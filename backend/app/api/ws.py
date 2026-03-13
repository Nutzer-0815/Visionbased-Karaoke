from __future__ import annotations

import base64
import os
import time
from typing import TypedDict

import cv2
import numpy as np
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from ultralytics import YOLO

from app.core.identity import IdentityStore
from app.core.recognizer import get_embedding, is_loaded

router = APIRouter()

MODEL_NAME = os.getenv("YOLO_MODEL", "yolov8n-face.pt")
MAX_FRAME_B64_LEN = int(os.getenv("MAX_FRAME_B64_LEN", "2500000"))
CONF_THRESHOLD = float(os.getenv("CONF_THRESHOLD", "0.3"))
TRACK_IOU_THRESHOLD = float(os.getenv("TRACK_IOU_THRESHOLD", "0.3"))
TRACK_MAX_MISSED = int(os.getenv("TRACK_MAX_MISSED", "5"))
model: YOLO | None = None
identity_store: IdentityStore = IdentityStore()


def load_model() -> None:
    global model
    try:
        model = YOLO(MODEL_NAME)
    except Exception as exc:
        raise RuntimeError(
            f"YOLO-Modell '{MODEL_NAME}' konnte nicht geladen werden. "
            "Bitte die Modelldatei herunterladen und im Backend-Verzeichnis ablegen. "
            f"Details: {exc}"
        ) from exc


class DetectionBase(TypedDict):
    x1: float
    y1: float
    x2: float
    y2: float
    conf: float
    cls: int
    track_id: int


class Detection(DetectionBase, total=False):
    suggested_name: str


class Track(TypedDict):
    id: int
    bbox: list[float]
    missed: int


class StreamMetrics(TypedDict, total=False):
    decode_ms: float
    inference_ms: float
    processing_ms: float
    backend_fps: float
    backend_sent_at_ms: int
    frame_id: int
    captured_at_ms: int


def decode_frame(data: str) -> np.ndarray | None:
    if data.startswith("data:image"):
        data = data.split(",", 1)[1]
    if len(data) > MAX_FRAME_B64_LEN:
        return None
    try:
        img_bytes = base64.b64decode(data, validate=True)
    except Exception:
        return None
    buffer = np.frombuffer(img_bytes, np.uint8)
    frame = cv2.imdecode(buffer, cv2.IMREAD_COLOR)
    return frame


def _crop_face(
    frame: np.ndarray, x1: float, y1: float, x2: float, y2: float
) -> np.ndarray | None:
    h, w = frame.shape[:2]
    pad_x = (x2 - x1) * 0.15
    pad_y = (y2 - y1) * 0.15
    ix1 = max(0, int(x1 - pad_x))
    iy1 = max(0, int(y1 - pad_y))
    ix2 = min(w, int(x2 + pad_x))
    iy2 = min(h, int(y2 + pad_y))
    if ix2 <= ix1 or iy2 <= iy1:
        return None
    return frame[iy1:iy2, ix1:ix2]


def iou(box_a: list[float], box_b: list[float]) -> float:
    x_left = max(box_a[0], box_b[0])
    y_top = max(box_a[1], box_b[1])
    x_right = min(box_a[2], box_b[2])
    y_bottom = min(box_a[3], box_b[3])

    if x_right <= x_left or y_bottom <= y_top:
        return 0.0

    intersection = (x_right - x_left) * (y_bottom - y_top)
    area_a = (box_a[2] - box_a[0]) * (box_a[3] - box_a[1])
    area_b = (box_b[2] - box_b[0]) * (box_b[3] - box_b[1])
    union = area_a + area_b - intersection
    if union <= 0:
        return 0.0
    return intersection / union


def assign_tracks(
    detections: list[Detection], tracks: list[Track], next_track_id: int
) -> tuple[list[Detection], list[Track], int]:
    if not detections:
        for track in tracks:
            track["missed"] += 1
        tracks = [track for track in tracks if track["missed"] <= TRACK_MAX_MISSED]
        return detections, tracks, next_track_id

    pairs: list[tuple[float, int, int]] = []
    for det_idx, det in enumerate(detections):
        det_box = [det["x1"], det["y1"], det["x2"], det["y2"]]
        for track_idx, track in enumerate(tracks):
            score = iou(det_box, track["bbox"])
            pairs.append((score, det_idx, track_idx))

    pairs.sort(reverse=True, key=lambda item: item[0])
    matched_dets: set[int] = set()
    matched_tracks: set[int] = set()

    for score, det_idx, track_idx in pairs:
        if score < TRACK_IOU_THRESHOLD:
            break
        if det_idx in matched_dets or track_idx in matched_tracks:
            continue
        matched_dets.add(det_idx)
        matched_tracks.add(track_idx)
        detections[det_idx]["track_id"] = tracks[track_idx]["id"]
        tracks[track_idx]["bbox"] = [
            detections[det_idx]["x1"],
            detections[det_idx]["y1"],
            detections[det_idx]["x2"],
            detections[det_idx]["y2"],
        ]
        tracks[track_idx]["missed"] = 0

    original_track_count = len(tracks)
    for track_idx in range(original_track_count):
        if track_idx not in matched_tracks:
            tracks[track_idx]["missed"] += 1

    tracks = [track for track in tracks if track["missed"] <= TRACK_MAX_MISSED]

    for det_idx, det in enumerate(detections):
        if det_idx in matched_dets:
            continue
        det["track_id"] = next_track_id
        tracks.append(
            {
                "id": next_track_id,
                "bbox": [det["x1"], det["y1"], det["x2"], det["y2"]],
                "missed": 0,
            }
        )
        next_track_id += 1

    return detections, tracks, next_track_id


@router.websocket("/stream")
async def websocket_stream(websocket: WebSocket) -> None:
    await websocket.accept()

    if model is None:
        await websocket.send_json({"type": "error", "message": "Modell nicht geladen. Backend neu starten."})
        await websocket.close()
        return

    tracks: list[Track] = []
    next_track_id = 1
    last_processed_at: float | None = None
    recognition_enabled = False
    track_embeddings: dict[int, np.ndarray] = {}

    try:
        while True:
            processing_start = time.perf_counter()
            try:
                message = await websocket.receive_json()
            except ValueError:
                await websocket.send_json({"type": "error", "message": "invalid json"})
                continue

            msg_type = message.get("type")

            # ── Non-frame control messages ──────────────────────────────────
            if msg_type == "set_recognition":
                recognition_enabled = bool(message.get("enabled", False))
                await websocket.send_json({
                    "type": "recognition_status",
                    "enabled": recognition_enabled,
                    "recognizer_available": is_loaded(),
                })
                continue

            if msg_type == "confirm_identity":
                track_id = message.get("track_id")
                name = str(message.get("name", "")).strip()
                if isinstance(track_id, int) and name and track_id in track_embeddings:
                    identity_store.add(name, track_embeddings[track_id])
                    await websocket.send_json({"type": "identity_saved", "name": name})
                    await websocket.send_json({"type": "identities", "names": identity_store.names})
                else:
                    await websocket.send_json({"type": "error", "message": "confirm_identity: missing track or name"})
                continue

            if msg_type == "delete_identity":
                name = str(message.get("name", "")).strip()
                if name:
                    identity_store.remove(name)
                    await websocket.send_json({"type": "identities", "names": identity_store.names})
                continue

            if msg_type == "list_identities":
                await websocket.send_json({"type": "identities", "names": identity_store.names})
                continue

            # ── Frame processing ─────────────────────────────────────────────
            if msg_type != "frame":
                await websocket.send_json({"type": "error", "message": "unsupported message type"})
                continue

            data = message.get("data")
            if not data:
                await websocket.send_json({"type": "error", "message": "missing frame data"})
                continue

            frame_id = message.get("frame_id")
            frame_id = frame_id if isinstance(frame_id, int) else None

            captured_at_ms_raw = message.get("captured_at_ms")
            captured_at_ms = (
                int(captured_at_ms_raw)
                if isinstance(captured_at_ms_raw, (int, float))
                else None
            )

            decode_start = time.perf_counter()
            frame = decode_frame(data)
            decode_ms = (time.perf_counter() - decode_start) * 1000
            if frame is None:
                await websocket.send_json({"type": "error", "message": "failed to decode frame"})
                continue

            inference_start = time.perf_counter()
            try:
                results = model(frame, verbose=False, imgsz=640)
            except Exception:
                await websocket.send_json({"type": "error", "message": "inference failed"})
                continue
            inference_ms = (time.perf_counter() - inference_start) * 1000

            detections: list[Detection] = []
            for box in results[0].boxes:
                x1, y1, x2, y2 = box.xyxy[0].tolist()
                conf = float(box.conf[0]) if box.conf is not None else 0.0
                cls = int(box.cls[0]) if box.cls is not None else -1
                if conf < CONF_THRESHOLD:
                    continue
                detections.append(
                    {
                        "x1": x1,
                        "y1": y1,
                        "x2": x2,
                        "y2": y2,
                        "conf": conf,
                        "cls": cls,
                        "track_id": -1,
                    }
                )

            detections, tracks, next_track_id = assign_tracks(detections, tracks, next_track_id)

            # ── Face recognition (opt-in per session) ────────────────────────
            if recognition_enabled and is_loaded():
                for det in detections:
                    crop = _crop_face(frame, det["x1"], det["y1"], det["x2"], det["y2"])
                    if crop is None:
                        continue
                    emb = get_embedding(crop)
                    if emb is None:
                        continue
                    track_embeddings[det["track_id"]] = emb
                    match = identity_store.find_match(emb)
                    if match:
                        det["suggested_name"] = match

            processing_ms = (time.perf_counter() - processing_start) * 1000
            now_perf = time.perf_counter()
            backend_fps = 0.0
            if last_processed_at is not None:
                delta = now_perf - last_processed_at
                if delta > 0:
                    backend_fps = 1.0 / delta
            last_processed_at = now_perf

            metrics: StreamMetrics = {
                "decode_ms": round(decode_ms, 2),
                "inference_ms": round(inference_ms, 2),
                "processing_ms": round(processing_ms, 2),
                "backend_fps": round(backend_fps, 2),
                "backend_sent_at_ms": int(time.time() * 1000),
            }
            if frame_id is not None:
                metrics["frame_id"] = frame_id
            if captured_at_ms is not None:
                metrics["captured_at_ms"] = captured_at_ms

            await websocket.send_json(
                {
                    "type": "detections",
                    "boxes": detections,
                    "width": int(frame.shape[1]),
                    "height": int(frame.shape[0]),
                    "metrics": metrics,
                }
            )
    except WebSocketDisconnect:
        return

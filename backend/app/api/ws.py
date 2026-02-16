from __future__ import annotations

import base64
import os
from typing import TypedDict

import cv2
import numpy as np
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from ultralytics import YOLO

router = APIRouter()

MODEL_NAME = os.getenv("YOLO_MODEL", "yolov8n-face.pt")
MAX_FRAME_B64_LEN = int(os.getenv("MAX_FRAME_B64_LEN", "2500000"))
CONF_THRESHOLD = float(os.getenv("CONF_THRESHOLD", "0.3"))
TRACK_IOU_THRESHOLD = float(os.getenv("TRACK_IOU_THRESHOLD", "0.3"))
TRACK_MAX_MISSED = int(os.getenv("TRACK_MAX_MISSED", "5"))
model = YOLO(MODEL_NAME)


class Detection(TypedDict):
    x1: float
    y1: float
    x2: float
    y2: float
    conf: float
    cls: int
    track_id: int


class Track(TypedDict):
    id: int
    bbox: list[float]
    missed: int


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

    tracks: list[Track] = []
    next_track_id = 1

    try:
        while True:
            try:
                message = await websocket.receive_json()
            except ValueError:
                await websocket.send_json({"type": "error", "message": "invalid json"})
                continue

            if message.get("type") != "frame":
                await websocket.send_json({"type": "error", "message": "unsupported message type"})
                continue

            data = message.get("data")
            if not data:
                await websocket.send_json({"type": "error", "message": "missing frame data"})
                continue

            frame = decode_frame(data)
            if frame is None:
                await websocket.send_json({"type": "error", "message": "failed to decode frame"})
                continue

            try:
                results = model(frame, verbose=False)
            except Exception:
                await websocket.send_json({"type": "error", "message": "inference failed"})
                continue

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

            await websocket.send_json(
                {
                    "type": "detections",
                    "boxes": detections,
                    "width": int(frame.shape[1]),
                    "height": int(frame.shape[0]),
                }
            )
    except WebSocketDisconnect:
        return

# ADR 0008: Frontend Capture Resolution Reduced to 640×360

Date: 2026-03-13
Status: Accepted

## Context

The frontend captured webcam frames at full resolution (typically 1280×720) and
sent them as JPEG over WebSocket to the backend. This created unnecessary network
load and increased JPEG encoding time per frame.

YOLOv8n is internally trained and optimised for 640px input (`imgsz=640`). Sending
higher-resolution frames provides no detection quality benefit while adding latency.

## Decision

Capture canvas is scaled to **640×360** (half of 1280×720) before JPEG encoding.
Backend YOLO call uses `imgsz=640` explicitly. This reduces payload size by ~4×
with no expected loss in detection quality for typical close-to-medium range faces.

## Consequences

- Smaller JPEG payloads → lower WebSocket buffer pressure and less E2E latency.
- Canvas render draws the overlay at the display canvas size (unchanged), not the
  capture size — visual quality is unaffected.
- **Potential regression:** If users have very small or distant faces in the frame
  (e.g., wide-angle lens, many people far from camera), the lower capture resolution
  may cause missed detections. If this is observed, revert `CAPTURE_WIDTH`/
  `CAPTURE_HEIGHT` in `frontend/src/App.tsx` to `video.videoWidth`/`video.videoHeight`
  and remove the explicit `imgsz` in `backend/app/api/ws.py`.

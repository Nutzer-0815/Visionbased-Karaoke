# ADR 0002: Frame Transport and Face Model Choice

Date: 2026-02-12  
Status: Accepted

## Context
Phase 2 requires sending video frames from the browser to the backend for face detection.
We need a simple, compatible format and a default detection model.

## Decision
- Use **Base64-encoded JPEG** over WebSocket messages for frame transport.
- Default YOLO model: `yolov8n-face.pt` (override via `YOLO_MODEL` env var).

## Consequences
- Base64-JPEG is easy to send via JSON but adds encoding overhead.
- The face model is small and fast; accuracy may be limited.
- Alternative transports (binary frames/WebRTC) can be evaluated later.

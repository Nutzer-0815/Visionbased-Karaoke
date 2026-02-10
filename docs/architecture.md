## Architecture

**Status:** Draft  
**Last updated:** 2026-02-10

This document is the **single source of truth** for architectural decisions
in this project.

---

## 1. System Overview

The system consists of a **browser-based frontend** and a **local Python backend**
communicating via **WebSocket** for real-time face detection and tracking.

**High-level goals:**

- Real-time performance (low latency, stable FPS)
- Clear separation of concerns (UI vs CV/AI logic)
- Easy local development and reproducibility
- Architecture suitable for applied Computer Vision / AI use cases

---

## 2. High-Level Components

### Frontend (Browser)

**Technology**

- TypeScript
- React
- Vite
- HTML5 Canvas
- Web Audio API

**Responsibilities**

- Webcam capture (`getUserMedia`)
- Rendering video and canvas overlay
- User interaction (click-to-select face, naming, song selection)
- Karaoke timing based on audio playback
- Visualization of runtime metrics (FPS, latency)

---

### Backend (Python)

**Technology**

- Python 3.x
- FastAPI
- WebSocket
- PyTorch
- YOLOv8 (Ultralytics)

**Responsibilities**

- Receive frames from the frontend
- Decode frames for inference
- Face detection using YOLOv8
- Multi-object tracking (stable `track_id` assignment)
- Metric collection (inference time, FPS)
- Stream detection results back to the frontend

---

## 3. Data Flow

1. Browser captures webcam frames
2. Frames are encoded (e.g. JPEG) and sent to the backend via WebSocket
3. Backend decodes frames and runs YOLOv8 inference
4. Detections are assigned stable `track_id`s
5. Backend sends detection results and metrics back to the frontend
6. Frontend renders:
   - Bounding boxes
   - Names
   - Karaoke lyrics synchronized with audio playback

---

## 4. Key Architectural Decisions

### Client-side UI, Server-side CV

Face detection and tracking run on the **backend process** rather than in the browser.

**Rationale**

- Direct use of PyTorch and YOLOv8
- Easier experimentation with models and parameters
- Centralized performance measurement
- Reduced frontend complexity

**Trade-offs**

- Requires a running backend process
- Adds network/IPC latency (WebSocket)

---

### WebSocket-based Communication

WebSocket is used instead of REST for communication between frontend and backend.

**Rationale**

- Low-latency, bidirectional streaming
- Suitable for continuous frame exchange
- Simpler real-time synchronization

**Trade-offs**

- More complex error handling compared to REST
- Requires connection lifecycle management

---

### Tracking on Backend

Multi-object tracking is performed in the backend process.

**Rationale**

- Tracking logic stays close to detection results
- Stable `track_id`s independent of frontend rendering
- Simplifies frontend state management

**Trade-offs**

- Backend becomes stateful
- Tracking state must be managed carefully across frames

---

## 5. Non-Goals (Out of Scope)

The following are explicitly **not part of the MVP**:

- Cloud deployment or multi-user support
- Persistent face recognition across sessions
- Music licensing and song catalog management
- Mobile-first optimization

---

## 6. Open Questions / Future Work

- Compare tracking approaches (simple IOU vs ByteTrack)
- Evaluate frame skipping vs detection accuracy
- Optional ONNX export for future client-side inference

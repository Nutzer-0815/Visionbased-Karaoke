## Architecture

**Status:** Current
**Last updated:** 2026-03-19

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
- Theme switching (7 visual themes, CSS custom properties, localStorage persistence)

---

### Backend (Python 3.12)

**Technology**

- Python 3.12
- FastAPI
- WebSocket
- YOLOv8 (Ultralytics)
- InsightFace (buffalo_s, ONNX, CPU)

**Responsibilities**

- Receive frames from the frontend
- Decode frames for inference
- Face detection using YOLOv8
- Multi-object tracking (stable `track_id` assignment via IOU)
- Optional face recognition: extract 512-dim embeddings via InsightFace, match against stored identities using cosine similarity
- Metric collection (inference time, FPS, E2E latency)
- Stream detection results back to the frontend

---

## 3. Data Flow

1. Browser captures webcam frames
2. Frames are encoded (JPEG) and sent to the backend via WebSocket
3. Backend decodes frames and runs YOLOv8 inference
4. Detections are assigned stable `track_id`s via IOU greedy matching
5. If recognition is enabled: face crops are passed through InsightFace; embeddings are matched against the identity store
6. Backend sends detection results (including optional `suggested_name`) and metrics back to the frontend
7. Frontend renders:
   - Bounding boxes
   - Names / recognition suggestions
   - Karaoke lyrics synchronized with audio playback

---

## 4. Key Architectural Decisions

### Client-side UI, Server-side CV

Face detection, tracking, and recognition run on the **backend process** rather than in the browser.

**Rationale**

- Direct use of YOLOv8 and InsightFace (Python ecosystem)
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
- Suitable for continuous frame exchange and control messages (recognition toggle, identity management)
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

### Face Recognition: InsightFace buffalo_s (opt-in)

Persistent face recognition uses InsightFace buffalo_s via ONNX/CPU.
Recognition is opt-in per session; embeddings are only stored on explicit user confirmation.

**Rationale**

- Purpose-built face recognition model (vs. generic ResNet or general-purpose deepface)
- Lightweight ONNX runtime, no GPU required
- Cosine similarity on L2-normalized 512-dim embeddings is fast and interpretable
- Opt-in design preserves user privacy

**Trade-offs**

- ~150 MB model download on first start
- CPU-only inference adds ~20–40 ms per recognized face crop
- buffalo_s accuracy is lower than buffalo_l (trade-off: speed vs. accuracy)

---

### CSS Theming via Custom Properties

Seven visual themes implemented via CSS custom properties and a `data-theme` attribute on `<html>`.
Active theme persists in `localStorage`; applied via inline script before React renders (no flash).

**Rationale**

- Zero runtime overhead (pure CSS, no JS at paint time)
- Single source of truth per theme (one `[data-theme="x"]` block)
- Flash-free thanks to pre-React inline script

**Trade-offs**

- All theme variables must be kept in sync when adding new UI elements

---

## 5. Non-Goals (Out of Scope)

The following are **not part of this project**:

- Cloud deployment or multi-user support
- Music licensing and song catalog management
- Mobile-first optimization

---

## 6. Open Questions / Future Work

- Compare tracking approaches (simple IOU vs ByteTrack)
- Evaluate frame skipping vs detection accuracy
- Optional ONNX export for future client-side inference
- buffalo_s → buffalo_l upgrade path for higher recognition accuracy

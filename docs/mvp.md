## MVP — Minimum Viable Product

**Status:** Approved  
**Last updated:** 2026-02-10

This document defines the **exact scope** of the MVP.
Anything not explicitly listed here is **out of scope**.

This document is the **single source of truth** for MVP requirements.

---

## 1. MVP Goal

The goal of the MVP is to demonstrate a **working real-time computer vision system**
that:

- detects and tracks faces in a live webcam feed
- allows users to assign identities to detected faces
- displays karaoke lyrics synchronized with audio playback
  directly over the corresponding face in the video feed

The MVP is designed as a **portfolio project** showcasing applied
Computer Vision, real-time systems, and AI engineering skills.

---

## 2. In-Scope Features

### 2.1 Frontend (Browser)

- Live webcam capture using `getUserMedia`
- Video display with canvas overlay
- Real-time rendering of:
  - face bounding boxes
  - track IDs or assigned names
  - karaoke lyrics above the face
- Click interaction:
  - user can click a face to select it
  - user can assign or change a name
- Song selection per person (single demo song is sufficient)
- Basic playback controls:
  - play
  - pause
  - restart

---

### 2.2 Backend (Python)

- WebSocket server for real-time communication
- Frame ingestion from frontend
- Face detection using YOLOv8
- Multi-object tracking with stable `track_id`s
- Streaming detection and tracking results back to frontend
- Basic runtime metrics collection (latency, FPS)

---

### 2.3 Karaoke Functionality

- Support for LRC lyric files with timestamps
- Instrumental audio playback (demo file)
- Correct lyric line displayed according to playback time
- Visual highlight of the current lyric line

---

## 3. Acceptance Criteria

The MVP is considered **complete** when all of the following are true:

- Webcam feed runs continuously without crashes
- Faces are detected and tracked stably for multiple seconds
- Clicking a face selects the correct tracked person
- Assigned names remain stable while tracking is active
- Karaoke lyrics follow the correct face and remain readable
- Audio playback and lyric display stay synchronized
- System can be started locally using 1–2 commands
- Setup and usage are documented in the README

---

## 4. Out of Scope (Explicit Non-Goals)

The following are **explicitly excluded** from the MVP:

- Music licensing or song catalog management
- Automatic face recognition across sessions
- Multi-user support or authentication
- Cloud deployment or scalability concerns
- Mobile device optimization
- Advanced UI styling or animations

---

## 5. Constraints and Assumptions

- The system runs locally on a single machine
- Only a small number of faces (1–3) must be supported
- Performance is evaluated on a single development machine
- Accuracy is evaluated qualitatively for MVP purposes

---

## 6. Definition of Done

The MVP is considered **done** when:

- all acceptance criteria are met
- metrics defined in `metrics-checklist.md` are collected at least once
- architectural decisions are documented in `architecture.md`
- the codebase builds and runs without manual intervention

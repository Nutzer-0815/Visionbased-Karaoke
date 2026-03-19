# Roadmap

**Status:** Phase 0-7 Completed
**Last updated:** 2026-03-19

This document defines the **development roadmap**
from project setup to MVP completion and beyond.

It is the **single source of truth** for development order and scope progression.

---

## Execution Status

- Phase 0: Completed
- Phase 1: Completed
- Phase 2: Completed
- Phase 3: Completed
- Phase 4: Completed
- Phase 5: Completed (MVP Completion)
- Phase 6: Completed (Metrics, Evaluation, Polishing)
- Phase 7: Completed (Persistent Face Recognition + Theme Switcher)

---

## Phase 0 — Project Setup & Foundations

**Goal:** Create a clean, reproducible development environment.

**Focus:**

- Repository structure (monorepo)
- Frontend and backend skeletons
- Tooling, linting, and CI setup
- Documentation placeholders

**Outcome:**

- Project can be cloned and started locally
- Clear developer workflow
- No product functionality yet

---

## Phase 1 — Frontend Webcam & Overlay Basics

**Goal:** Establish the visual and interaction foundation.

**Focus:**

- Webcam access via browser
- Video rendering
- Canvas overlay aligned with video
- Basic UI controls (start/stop)

**Why first?**

- All later features depend on a stable video and overlay pipeline
- Enables early visual feedback

---

## Phase 2 — Backend Face Detection Pipeline

**Goal:** Enable real-time face detection.

**Focus:**

- WebSocket communication
- Frame ingestion on backend
- YOLOv8 face detection
- Returning bounding boxes to frontend

**Outcome:**

- Faces are visible as bounding boxes in the live feed

---

## Phase 3 — Tracking & Identity Assignment

**Goal:** Stabilize detections over time and enable user interaction.

**Focus:**

- Multi-object tracking with stable `track_id`s
- Click-to-select face
- Assign and display names
- Basic persistence (session or local storage)

**Why here?**

- Karaoke requires stable identity tracking
- User interaction builds on tracking

---

## Phase 4 — Karaoke Engine (Standalone)

**Goal:** Implement karaoke logic independently of faces.

**Focus:**

- LRC file parsing
- Audio playback
- Lyric timing and highlighting
- Playback controls

**Outcome:**

- Karaoke works without any CV dependency

---

## Phase 5 — Karaoke Integrated with Live Faces (MVP Completion)

**Goal:** Combine all subsystems into the MVP experience.

**Focus:**

- Assign songs to tracked persons
- Render lyrics above the corresponding face
- Synchronize audio and overlay
- End-to-end testing

**Outcome:**

- Fully functional MVP as defined in `mvp.md`

---

## Phase 6 — Metrics, Evaluation & Polishing

**Goal:** Measure, validate, and document system behavior.

**Focus:**

- Implement metric collection
- Validate metrics defined in `metrics-checklist.md`
- Document trade-offs
- Improve robustness and UX

---

## Phase 7 — Persistent Face Recognition + Theme Switcher

**Goal:** Extend the system beyond MVP with two opt-in features.

**Focus:**

- Persistent face recognition across sessions using InsightFace buffalo_s
- Opt-in embedding storage with explicit user confirmation flow
- Privacy documentation
- 7-theme UI switcher (Standard, Dunkel, Hacker, Nintendo, Manga, Pink, Wirtshaus)
- CSS custom-property theming system with localStorage persistence

**Outcome:**

- Known faces are recognized and named automatically on re-entry
- Users can personalize the visual appearance of the interface

---

## Post-MVP (Optional / Future Work)

These items are **explicitly not required** for current completion:

- Additional songs and media management
- Cloud deployment
- Performance optimizations (GPU inference, ByteTrack, frame skipping)
- buffalo_s → buffalo_l upgrade for higher recognition accuracy
- Accessory drawing overlay (hat, glasses etc.) anchored to facial landmarks

---

## Completion Criteria

The roadmap is considered complete when:

- All implementation phases (0-6) are finished
- MVP acceptance criteria are met
- Documentation reflects the implemented system

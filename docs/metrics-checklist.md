## Metrics Checklist

**Status:** Baseline Collected (Phase 6 Closed)  
**Last updated:** 2026-02-20

This document defines the **metrics and measurement points**
used to evaluate correctness, performance, and robustness
of the system.

It is the **single source of truth** for all reported metrics.

---

## Phase 6 Closure Evidence

- Baseline report: `docs/metrics-baseline.md`
- Trade-off report: `docs/tradeoffs.md`
- Runtime transport ADR: `docs/adr/0006-runtime-metrics-transport.md`
- Reconnect ADR: `docs/adr/0007-ws-reconnect-frontend.md`

Backend runtime sample (2026-02-20, 20 frames, WS test):

- Decode time avg/min/max (ms): `1.31 / 0.23 / 19.03`
- Inference time avg/min/max (ms): `124.52 / 67.79 / 705.24`
- Processing time avg/min/max (ms): `129.90 / 69.00 / 781.01`
- Backend FPS avg/min/max: `10.79 / 0.00 / 14.44`
- Captured-to-backend-sent avg/min/max (ms): `129.60 / 67 / 778`

Note:

- This sample validates collection and reporting pipeline.
- Full manual quality measurements remain scenario-dependent and are intentionally lightweight for MVP.

---

## 1. Detection Quality (Face Detection)

These metrics evaluate the quality of face detection.

### Metrics

- Precision (per-frame)
- Recall (per-frame)
- False Positives / False Negatives (qualitative examples)
- Confidence score distribution

### Measurement Setup

- Small curated test set (static images and short video clips)
- Fixed confidence threshold
- Manual inspection for qualitative validation

### Notes

- Full benchmark datasets (e.g. WIDER FACE) are out of scope for MVP
- Focus is on correctness under realistic webcam conditions

---

## 2. Tracking Quality (Multi-Object Tracking)

These metrics evaluate the stability of identity assignment over time.

### Metrics

- ID Switch Count (per session)
- Average Track Duration (seconds)
- Track Loss Rate (tracks dropped unexpectedly)
- Recovery after short occlusions (qualitative)

### Measurement Setup

- Controlled webcam recordings with 1–3 faces
- Manual annotation for ID switch events
- Short occlusion scenarios (head turn, partial occlusion)

### Notes

- No full MOT benchmark required for MVP
- Emphasis on user-perceived stability

---

## 3. Real-Time Performance

These metrics evaluate whether the system meets real-time requirements.

### Metrics

- End-to-end latency (camera → overlay), in milliseconds
- Backend inference time per frame (ms)
- Frontend render time (ms)
- Frames per second (min / avg / max)
- Dropped frames or backlog size

### Measurement Points

- Timestamp at frame capture (frontend)
- Timestamp after inference (backend)
- Timestamp at render completion (frontend)

### Notes

- Latency is more important than raw FPS
- Stability is preferred over peak performance

---

## 4. Resource Utilization

These metrics help understand system efficiency.

### Metrics

- CPU usage (average / peak)
- GPU usage (if available)
- Memory usage (backend process)

### Measurement Setup

- Local development machine
- Tools: OS task manager or lightweight profiling

---

## 5. Karaoke Synchronization

These metrics evaluate audio–visual synchronization quality.

### Metrics

- Drift between audio playback and lyric display (ms)
- Correct lyric line after seek (yes/no)
- Stability over long playback (>60 seconds)

### Measurement Setup

- Single demo song with LRC timestamps
- Manual verification with repeated play/seek actions

---

## 6. Robustness & UX

These metrics evaluate system behavior under non-ideal conditions.

### Scenarios

- Webcam permission denied
- Backend not running / disconnected
- Temporary face disappearance
- Window resize or resolution change

### Expected Behavior

- Clear user-facing error messages
- Graceful degradation without crashes
- Automatic recovery when possible

---

## 7. Trade-offs and Reporting

All metrics should be reported together with:

- Model size (e.g. YOLOv8n vs YOLOv8s)
- Input resolution
- Detection frequency (every frame vs every N frames)

Trade-offs must be documented in:

- `docs/tradeoffs.md`

---

## 8. Non-Goals

The following are explicitly out of scope:

- Academic benchmark comparisons
- Cross-device performance comparison
- Large-scale dataset evaluation

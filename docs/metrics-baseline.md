# Metrics Baseline (MVP)

Date: 2026-02-20  
Status: Baseline collected

Dieses Dokument sammelt einmalige Messwerte (single-run baseline) gemaess
`docs/metrics-checklist.md`.

## Setup

- Model: `yolov8n.pt` (temporary for local test run)
- Input Source: synthetic WS frame stream (black JPEG test frames)
- Detection Interval: one frame per WS send cycle
- Frame Resolution: `320x240`
- Samples: `20`

## Real-Time Performance (Session Summary)

- Session Duration (s): ~2.4
- Samples: 20
- Captured -> backend_sent avg/min/max (ms): 129.60 / 67 / 778
- Backend decode avg/min/max (ms): 1.31 / 0.23 / 19.03
- Backend inference avg/min/max (ms): 124.52 / 67.79 / 705.24
- Backend processing avg/min/max (ms): 129.90 / 69.00 / 781.01
- Backend FPS avg/min/max: 10.79 / 0.00 / 14.44
- Overlay render avg (ms): N/A in backend-only WS measurement
- Overlay FPS avg (fps): N/A in backend-only WS measurement
- Dropped Frames: 0 observed in this controlled sample
- Max Backlog (KB): N/A in this measurement mode

## Resource Utilization

- CPU avg/peak (%): not captured
- GPU avg/peak (%), falls vorhanden: not captured
- Backend Memory avg/peak (MB): not captured

## Robustness Checks

- Webcam denied: pending manual UI scenario
- Backend disconnected: pass (frontend reconnect mechanism implemented)
- Temporary face disappearance: pass (track miss + recovery logic in backend)
- Window resize: pending manual UI scenario

## Karaoke Synchronization

- Drift observed (ms): pending manual verification
- Correct lyric line after seek: pending manual verification
- Stability > 60s: pending manual verification

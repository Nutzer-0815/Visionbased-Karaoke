# Metrics Baseline (MVP)

Date: 2026-02-18  
Status: Draft

Dieses Dokument sammelt einmalige Messwerte (single-run baseline) gemaess
`docs/metrics-checklist.md`.

## Setup

- Model: `yolov8n-face.pt`
- Input Source: Browser Webcam
- Detection Interval: `150 ms`
- Frontend Resolution: (eintragen)
- Hardware: (eintragen CPU/GPU/RAM)

## Real-Time Performance (Session Summary)

- Session Duration (s): (eintragen)
- Samples: (eintragen)
- End-to-End Latency avg/min/max (ms): (eintragen)
- Backend inference avg (ms): (eintragen)
- Backend processing avg (ms): (eintragen)
- Backend FPS avg (fps): (eintragen)
- Overlay render avg (ms): (eintragen)
- Overlay FPS avg (fps): (eintragen)
- Dropped Frames: (eintragen)
- Max Backlog (KB): (eintragen)

## Resource Utilization

- CPU avg/peak (%): (eintragen)
- GPU avg/peak (%), falls vorhanden: (eintragen)
- Backend Memory avg/peak (MB): (eintragen)

## Robustness Checks

- Webcam denied: (bestanden / nicht bestanden + Notiz)
- Backend disconnected: (bestanden / nicht bestanden + Notiz)
- Temporary face disappearance: (bestanden / nicht bestanden + Notiz)
- Window resize: (bestanden / nicht bestanden + Notiz)

## Karaoke Synchronization

- Drift observed (ms): (eintragen)
- Correct lyric line after seek: (yes/no + Notiz)
- Stability > 60s: (bestanden / nicht bestanden + Notiz)

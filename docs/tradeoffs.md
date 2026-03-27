# Trade-offs

Date: 2026-03-19
Status: Current

## 1) Model Size vs Latency

- Choice: `yolov8n-face.pt` as default model.
- Benefit: lower inference latency on local development hardware.
- Cost: lower detection robustness than larger models in difficult lighting.

## 2) Frame Interval vs Responsiveness

- Choice: frontend sends frames every `150ms`.
- Benefit: stable backend load and lower CPU/GPU pressure.
- Cost: lower temporal resolution than per-frame inference.

## 3) Metrics in WebSocket Payload

- Choice: include runtime metrics in regular `detections` responses.
- Benefit: no extra metrics API needed; simpler MVP integration.
- Cost: metrics are not persisted and not suitable for long-term analytics.

## 4) Lyric Placement Strategy

- Choice: lyrics rendered on canvas directly below the assigned face bounding box (fallback: above if near bottom edge).
- Benefit: lyrics are person-anchored and visually tied to the correct face.
- Cost: readability decreases if face is near the canvas edge or moves rapidly.

## 5) Face Recognition Model: InsightFace buffalo_s vs Alternatives

- Choice: InsightFace buffalo_s (ONNX, CPU) over deepface or torchvision ResNet.
- Benefit: purpose-built face recognition, no GPU required, no TensorFlow dependency, fast ONNX runtime.
- Cost: ~150 MB download on first start; buffalo_s accuracy lower than buffalo_l.
- Rejected alternatives:
  - deepface: heavy TensorFlow/Keras dependency, slower cold start
  - torchvision ResNet: not face-specific, requires custom training or fine-tuning

## 6) Recognition Opt-in via Explicit Confirmation

- Choice: embeddings are only stored after the user confirms "Ja" when a match is suggested.
- Benefit: no biometric data stored without informed consent; aligns with GDPR spirit.
- Cost: requires an extra interaction step; users who skip confirmation do not benefit from persistence.

## 7) CSS Custom Properties for Theming vs CSS-in-JS

- Choice: plain CSS custom properties (`--var`) with `[data-theme]` attribute on `<html>`.
- Benefit: zero runtime JS overhead; works without React; easy to extend with new themes.
- Cost: all theme variables must be kept in sync manually; no TypeScript safety for theme tokens.
- Rejected alternative: Tailwind `darkMode: 'class'` — not flexible enough for 7 distinct visual themes.

## 9) Pitch Scoring: Chroma-Based vs. Absolute Frequency Matching

- Choice: compare detected pitch against target using **chroma distance** (pitch class modulo 12 semitones), ignoring octave.
- Benefit: octave-independent — a soprano singing E4 correctly scores as hitting the target E2; works across all vocal ranges without calibration.
- Cost: octave errors are not penalized; a strict mode (absolute semitone distance) may be desirable for advanced users.
- Rejected alternative: absolute semitone distance — would incorrectly penalize singers performing in a different octave than the original recording.

## 8) Folder-per-Song Structure

- Choice: each song lives in `public/songs/{folder}/` with `lyrics.lrc` and optional `audio.*`.
- Benefit: adding or removing a song requires changes in exactly two places (folder + one line in `index.json`).
- Cost: slightly more filesystem structure than a flat file approach.

## 10) GPU Auto-Detection: "auto" Device Resolution

- Choice: `YOLO_DEVICE=auto` resolves to CUDA device 0 if PyTorch detects a CUDA GPU at startup, otherwise falls back to CPU.
- Benefit: zero configuration for GPU users; safe fallback for CPU-only machines.
- Cost: device is resolved once at startup — a GPU plugged in later requires a server restart.
- Rejected alternative: always CPU — would leave GPU capacity unused on capable hardware.

## 11) ByteTrack vs. IOU Tracker

- Choice: IOU greedy tracker as default; ByteTrack available via `USE_BYTETRACK=1`.
- Benefit: IOU tracker is dependency-free and sufficient for 1–3 faces with low occlusion; ByteTrack handles temporary disappearances and crowded scenes better.
- Cost: ByteTrack uses ultralytics' internal tracker state (global per process) — multiple simultaneous WebSocket connections would share tracker state. Acceptable for single-user local use.
- Rejected alternative: ByteTrack as default — overkill for the typical 1–3 face use case and adds connection-state complexity.

## 12) Frame Skipping via MIN_FRAME_INTERVAL_MS

- Choice: backend drops incoming frames if the previous frame was processed less than `MIN_FRAME_INTERVAL_MS` ago.
- Benefit: prevents backend queue buildup on slow hardware; reduces CPU load without changing frontend send rate.
- Cost: dropped frames are invisible to the frontend — no explicit feedback. Effective FPS may drop below the frontend send rate.
- Rejected alternative: frontend-side adaptive send rate — harder to implement, requires backend→frontend feedback loop.

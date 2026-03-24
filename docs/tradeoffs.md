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

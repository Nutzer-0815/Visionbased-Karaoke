# Trade-offs

Date: 2026-02-18
Status: Draft

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

- Choice: fixed lyric banner in the upper fifth of the viewport.
- Benefit: stable readability independent of face box movement.
- Cost: lyrics are not person-anchored in the rendered video space.

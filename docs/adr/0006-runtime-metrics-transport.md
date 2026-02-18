# ADR 0006: Runtime Metrics Transport via WebSocket

Date: 2026-02-18
Status: Accepted

## Context
Phase 6 requires runtime metrics for latency and performance without adding a
separate metrics service.

## Decision
Attach backend runtime metrics directly to each `detections` WebSocket message.
Frontend sends `frame_id` and `captured_at_ms`; backend echoes metrics and
timing values.

## Consequences
- Minimal protocol overhead and no extra endpoint.
- Frontend can compute end-to-end latency from `captured_at_ms`.
- Metrics are session-local and intended for MVP evaluation, not long-term
  time-series storage.

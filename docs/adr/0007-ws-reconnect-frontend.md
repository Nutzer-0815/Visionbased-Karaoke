# ADR 0007: Frontend WebSocket Reconnect Policy

Date: 2026-02-18
Status: Accepted

## Context
Phase 6 requires graceful degradation and recovery when backend connectivity is
temporarily unavailable.

## Decision
Frontend attempts automatic reconnect on WebSocket close while stream mode is
active. Reconnect delay is fixed at 1500 ms and status/error UI is updated to
show reconnect attempts.

## Consequences
- Better resilience during backend restarts or temporary network issues.
- Slightly increased connection churn in unstable environments.
- Keeps MVP simple without exponential backoff logic.

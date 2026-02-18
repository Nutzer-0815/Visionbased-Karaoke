# ADR 0005: Phase 5 Song Assignment Model

Date: 2026-02-18
Status: Accepted

## Context
Phase 5 requires assigning songs to tracked persons and rendering lyrics above
the corresponding face. The MVP scope allows a single demo song and local
execution.

## Decision
Use one shared audio playback stream and a track-based song assignment map in
the frontend:

- `track_id -> song_id` mapping for assignment.
- single demo song (`demo-song`) for MVP.
- active lyric line from global playback rendered as fixed banner in the upper
  fifth of the viewport above the live video feed.

## Consequences
- Satisfies Phase 5 acceptance with minimal complexity.
- No per-person independent playback in MVP.
- Lyric visibility is stable and independent of face-box movement.
- Easy extension path to multiple songs and per-track audio control later.

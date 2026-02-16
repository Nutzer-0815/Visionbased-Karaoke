# ADR 0003: Simple IOU Tracker for Phase 3

Date: 2026-02-12  
Status: Accepted

## Context
Phase 3 requires stable identities across frames. We need a lightweight tracker
that works with per-frame YOLO detections and is simple to implement.

## Decision
Use a simple IOU-based tracker:
- Greedy matching between detections and existing tracks.
- New tracks are created for unmatched detections.
- Tracks expire after a small number of missed frames.

## Consequences
- Tracking is simple and fast but can produce ID switches in crowded scenes.
- This is acceptable for MVP; more advanced trackers (e.g. ByteTrack) can be
  evaluated later if stability is insufficient.

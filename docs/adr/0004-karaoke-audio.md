# ADR 0004: Karaoke Demo Audio Source

Date: 2026-02-12  
Status: Accepted

## Context
Phase 4 requires a demo audio track for karaoke playback. We want a simple,
license-safe asset without external downloads.

## Decision
Generate a short sine-wave audio track in the browser and expose it as a WAV
data URL. Lyrics are loaded from a local LRC file in `frontend/public/lyrics/`.

## Consequences
- No external audio downloads or licensing concerns.
- Audio quality is minimal but sufficient for timing and UI.
- Can be replaced later with a real instrumental file.

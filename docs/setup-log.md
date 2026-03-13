# Setup Log (Setup Log)

Dieses Log dokumentiert jede Änderung im Repo Schritt für Schritt. Zusätzlich existiert ein reproduzierbares Bootstrap-Script (reproducible bootstrap script) unter `scripts/bootstrap.ps1`, das die aktuellen Dateien aus einer Snapshot-Manifest-Liste wiederherstellt.

## 2026-02-05 — Entry 001: Initiales Grundgerüst + Tooling (Milestone 0 / Issue 0.1 + 0.2)

Schritte (steps):

1. Ordnerstruktur (repository structure) angelegt: `frontend/`, `backend/`, `docs/`, `.github/workflows/`, `scripts/`, `docs/adr/`, plus Unterordner für `frontend/src`, `backend/app/api`, `backend/app/core`.
2. Placeholder-Spezifikationen (placeholder specs) erstellt: `docs/mvp.md`, `docs/roadmap.md`, `docs/architecture.md`, `docs/metrics-checklist.md`.
3. ADR erstellt, um die fehlenden Spezifikationsdateien zu dokumentieren: `docs/adr/0001-missing-specs.md`.
4. Frontend Skeleton (Vite + React + TypeScript) erstellt inkl. UI-Skeleton (Webcam + Canvas Overlay, Buttons) und Styles.
5. Backend Skeleton (FastAPI) erstellt inkl. `/health`, CORS und WebSocket Router Skeleton.
6. Tooling hinzugefügt: ESLint/Prettier Konfiguration für Frontend, Ruff Konfiguration für Backend, Root `.gitignore`.
7. README-Dateien geschrieben (`README.md`, `frontend/README.md`, `backend/README.md`).

Hinweis: Die exakten Datei-Inhalte und der komplette Wiederherstellungs-Workflow sind in `scripts/bootstrap.ps1` als Snapshot hinterlegt.

## 2026-02-05 — Entry 002: Transparenz-Verbesserung

Schritte (steps):

1. `docs/setup-log.md` hinzugefügt (dieses Log).
2. `scripts/bootstrap.ps1` generiert (Snapshot-Rekonstruktion der aktuellen Dateien).

## 2026-02-05 — Entry 003: Bootstrap-Kommentare + Log-Prozess

Schritte (steps):

1. `scripts/bootstrap.ps1` mit erklärenden Kommentaren versehen (commented bootstrap script).
2. Prozess festgelegt: Jede zukünftige Änderung wird zusätzlich in `docs/setup-log.md` protokolliert.

## 2026-02-10 — Entry 005: GitHub-Konventionen + Issue-Setup

Schritte (steps):

1. `docs/github-conventions.md` erstellt.
2. GitHub Issue Templates unter `.github/ISSUE_TEMPLATE/` erstellt.
3. `scripts/create-issues.ps1` erstellt.
4. `docs/issues.json` als Issue-Quelle angelegt.

## 2026-02-10 — Entry 006: Issues-Backlog angelegt

Schritte (steps):

1. `docs/issues.json` mit Phase-1 bis Phase-6 Issues aus der Roadmap befuellt.

## 2026-02-12 — Entry 007: Phase 2 Backend/Frontend Pipeline

Schritte (steps):

1. Backend-WebSocket erweitert: Frame-Ingestion, YOLOv8 Inference, Detection-Response.
2. Frontend sendet Base64-JPEG Frames und zeichnet Bounding Boxes.
3. ADR fuer Frame-Transport und Model-Default dokumentiert.
4. `docs/issues.json` aktualisiert (created=true).

## 2026-02-12 — Entry 008: Phase 2 Stabilisierung

Schritte (steps):

1. Backend: JSON-Fehlerbehandlung und Frame-Groessenlimit ergaenzt.
2. Backend: Inference-Fehler werden abgefangen.
3. Frontend: Fehler-Nachrichten vom Backend anzeigen.

## 2026-02-12 — Entry 009: Phase 3 Tracking & Identity

Schritte (steps):

1. Backend: IOU-Tracker mit track_id fuer detections.
2. Frontend: Click-to-select und Inline-Name-Input.
3. ADR fuer Tracking-Ansatz dokumentiert.

## 2026-02-12 — Entry 010: Phase 3 Stabilisierung

Schritte (steps):

1. Backend: Confidence-Threshold eingefuehrt (CONF_THRESHOLD).
2. Frontend: Selection wird geloescht, wenn Track zu lange nicht gesehen wird.

## 2026-02-12 — Entry 011: Python 3.12 Umstellung

Schritte (steps):

1. Ruff target-version auf py312 gesetzt.
2. CI Python-Version auf 3.12 gesetzt.
3. README-Hinweise auf Python 3.12 aktualisiert.

## 2026-02-12 — Entry 012: Phase 4 Karaoke (Standalone)

Schritte (steps):

1. LRC-Parser und Demo-Audio (data URL) implementiert.
2. Karaoke-UI mit Play/Pause/Restart und Highlighting hinzugefuegt.
3. ADR fuer Audio-Quelle dokumentiert.

## 2026-02-12 — Entry 013: Phase 4 QA Patch

Schritte (steps):

1. Karaoke-Fehler werden im UI angezeigt.
2. Aktive Zeile scrollt automatisch in Sicht.

## 2026-02-10 — Entry 004: CI-Workflow hinzugefügt

Schritte (steps):
1. GitHub Actions Workflow ci.yml erstellt.
2. Frontend-Job: 
pm install, 
pm run lint, 
pm run build.
3. Backend-Job: pip install -r requirements.txt ruff, uff check ..

## 2026-02-17 — Entry 014: CI Fix Ruff Import Order (Backend)

Schritte (steps):

1. backend/app/core/config.py Import-Block mit isort-konformer Gruppierung korrigiert (Leerzeile zwischen stdlib und third-party).
2. Ziel: GitHub Actions Backend-Job (ruff check .) wieder gruen machen.

## 2026-02-17 — Entry 015: CI Fix Frontend Dependency Conflict

Schritte (steps):

1. Frontend-Dev-Dependencies angepasst: `eslint` und `@eslint/js` von 9.x auf 8.57.0.
2. Ziel: `npm install` im GitHub Actions Frontend-Job ohne Peer-Dependency-Konflikt ausfuehren.

## 2026-02-17 — Entry 016: CI Fix Frontend JSON BOM

Schritte (steps):

1. frontend/package.json von UTF-8 mit BOM auf UTF-8 ohne BOM umgestellt.
2. Ziel: Vite/PostCSS JSON-Parse-Fehler (Unexpected token '\ufeff') in GitHub Actions Build beheben.

## 2026-02-18 — Entry 017: Phase 5 Karaoke + Live Faces Integration

Schritte (steps):

1. Frontend: Song-Zuordnung pro `track_id` eingefuehrt (Demo-Song fuer MVP).
2. Frontend: Aktive Lyric-Zeile als Overlay direkt ueber zugeordneten Gesichtern gerendert.
3. Frontend: Canvas-Klickinteraktion stabilisiert (`pointer-events: auto`) fuer Face-Selection.
4. ADR fuer Phase-5-Annahme hinzugefuegt: `docs/adr/0005-phase5-song-assignment.md`.

## 2026-02-18 — Entry 018: Phase 5 Lyric Placement Adjustment

Schritte (steps):

1. Lyrics-Darstellung von Face-gebundenem Canvas-Overlay auf festen Banner umgestellt.
2. Banner im oberen Fuenftel des Viewports ueber dem Livevideofeed positioniert.
3. ADR 0005 aktualisiert, um die neue Platzierungsentscheidung zu dokumentieren.

## 2026-02-18 — Entry 019: Phase 6 Runtime Metrics (Start)

Schritte (steps):

1. Backend-WebSocket um Runtime-Metriken erweitert (`decode_ms`, `inference_ms`, `processing_ms`, `backend_fps`).
2. Frontend sendet `frame_id` + `captured_at_ms` pro Frame und zeigt Runtime-Metriken im UI an.
3. ADR fuer Metrik-Transport hinzugefuegt: `docs/adr/0006-runtime-metrics-transport.md`.
4. Trade-off-Dokument erstellt: `docs/tradeoffs.md`.

## 2026-02-18 — Entry 020: Phase 6 Metrics Aggregation & Baseline Template

Schritte (steps):

1. Frontend: Session-Aggregation fuer Metriken ergaenzt (avg/min/max, dropped frames, backlog).
2. Frontend: Export als JSON-Datei (`Export Metrics JSON`) hinzugefuegt.
3. Baseline-Dokument fuer einmalige Messwerte angelegt: `docs/metrics-baseline.md`.

## 2026-02-18 — Entry 021: Phase 6 Robustness (WebSocket Reconnect)

Schritte (steps):

1. Frontend-WebSocket auf automatische Wiederverbindung bei Disconnect erweitert.
2. Type Guards fuer eingehende WebSocket-Payloads eingefuehrt (TypeScript-Sicherheit).
3. ADR zur Reconnect-Policy hinzugefuegt: `docs/adr/0007-ws-reconnect-frontend.md`.

## 2026-02-18 — Entry 022: CI Lint Fix (Hook Dependencies)

Schritte (steps):

1. `frontend/src/App.tsx`: `resetSessionStats` zur Dependency-Liste von `startStream` (`useCallback`) hinzugefuegt.
2. Ziel: GitHub Actions Frontend-Lint (`react-hooks/exhaustive-deps`) wieder gruen machen.

## 2026-02-18 — Entry 023: TypeScript Guard Fix (`metrics` possibly undefined)

Schritte (steps):

1. `frontend/src/App.tsx`: innerhalb von `if (payload.metrics)` eine lokale Konstante `metrics` eingefuehrt.
2. Alle Zugriffe von `payload.metrics.*` auf `metrics.*` umgestellt, um TS18048 (`possibly undefined`) zu vermeiden.

## 2026-02-19 — Entry 024: E2E Smoke Test Cleanup (Model File Ignore)

Schritte (steps):

1. Nach E2E-Smoke-Test wurde die lokal heruntergeladene Datei `backend/yolov8n.pt` entfernt.
2. `.gitignore` erweitert um `backend/*.pt`, damit lokale Modellgewichte nicht versehentlich committed werden.
3. Ziel: Repo sauber halten und große Binardateien aus Git ausschliessen.

## 2026-02-20 — Entry 025: Phase 6 Final Closure

Schritte (steps):

1. Runtime-Baseline-Messung (20 WS-Frames) erhoben und in `docs/metrics-baseline.md` dokumentiert.
2. `docs/metrics-checklist.md` von Draft auf Abschlussstatus mit Evidenz-Block aktualisiert.
3. `docs/roadmap.md` auf "Phase 0-6 Completed" gesetzt und Completion-Criteria aktualisiert.
4. GitHub-Issue fuer Phase 6 zur Schliessung vorbereitet.

## 2026-02-27 — Entry 026: Post-MVP Backlog Refinement

Schritte (steps):

1. Neues Label `post-mvp` in GitHub angelegt.
2. Bestehende, umgesetzte Phasen-Issues `#1` bis `#5` auf GitHub geschlossen.
3. Sechs neue Post-MVP-Issues `#7` bis `#12` auf GitHub erstellt.
4. `docs/issues.json` mit Closure-Status fuer Phase 1-5 sowie neuen Post-MVP-Issues synchronisiert.

## 2026-03-12 — Entry 027: Karaoke-Lyrics auf Canvas + demo.lrc

Schritte (steps):

1. `frontend/public/lyrics/demo.lrc` mit 20 deutschen Lyric-Zeilen (3s-Intervall, 57s Laufzeit) erstellt.
2. `frontend/src/App.tsx`: Karaoke-Lyrics werden jetzt direkt auf dem Canvas ueber der Bounding Box des zugeordneten Gesichts gerendert (gelb, fett, 18px, halbtransparenter schwarzer Hintergrund).
3. Canvas-Render-useEffect-Dependencies um `songByTrack`, `activeLine`, `karaokeLines` ergaenzt.

## 2026-03-12 — Entry 028: Code Review Fixes (Frontend)

Schritte (steps):

1. `frontend/src/App.tsx`: Lyric-Text-X-Position auf Canvas geclampt (`Math.max(0, Math.min(canvas.width - bgW, bgX))`), um Ueberlauf am Rand zu verhindern.
2. `frontend/src/styles.css`: Tippfehler `#cbd5f5` auf korrektes Slate-300 `#cbd5e1` in `.name-editor input` und `.ghost`-Button korrigiert (beide Vorkommen).
3. `frontend/src/App.tsx`: `WS_MAX_RECONNECT_ATTEMPTS = 10` eingefuehrt; Reconnect-Loop stoppt nach 10 Versuchen mit klarer Fehlermeldung.

## 2026-03-12 — Entry 029: Code Review Fixes (Backend + Frontend)

Schritte (steps):

1. `frontend/src/App.tsx`: Duplizierten `setSongByTrack`-Block im Stale-Track-Cleanup-Interval entfernt; Logik laeuft jetzt einmal pro Tick unabhaengig von `selectedTrackId`.
2. `backend/app/api/ws.py`: YOLO-Modell wird nicht mehr beim Modulimport geladen. Neue Funktion `load_model()` mit klarer `RuntimeError`-Meldung bei fehlender Modelldatei.
3. `backend/app/api/ws.py`: WebSocket-Handler prueft `model is None` und sendet Fehlermeldung ans Frontend, statt zu crashen.
4. `backend/app/main.py`: FastAPI-`lifespan`-Hook eingefuehrt; `load_model()` wird beim Server-Start aufgerufen mit Log-Ausgabe.
5. `frontend/src/karaoke/audio.ts`: O(n²) String-Concatenation durch Chunk-basierte Verarbeitung (8192 Bytes/Chunk) ersetzt.

## 2026-03-12 — Entry 030: Name-Badge prominent auf Canvas

Schritte (steps):

1. `frontend/src/App.tsx`: Track-Label wird nicht mehr als kleiner Text in der Bounding Box gezeichnet, sondern als farbiges Badge direkt oberhalb der Box (gleiche Farbe wie Rahmen: gruen/orange, weisser Text, geclampt an Canvas-Raendern).

## 2026-03-12 — Entry 032: README aktualisiert

Schritte (steps):

1. `README.md`: Projektbeschreibung auf MVP-Abschluss aktualisiert, Feature-Liste, Quickstart mit Modell-Download-Anleitung (Option A: face-Modell, Option B: yolov8n.pt Auto-Download), Nutzungsanleitung und Projektstruktur ergaenzt.
2. `backend/README.md`: Modell-Setup-Abschnitt mit Umgebungsvariablen-Tabelle ergaenzt.

## 2026-03-12 — Entry 031: Docs auf aktuellen Stand gebracht

Schritte (steps):

1. `docs/adr/0005-phase5-song-assignment.md`: Decision-Abschnitt von "fixed banner" auf canvas-gebundenes Lyric-Rendering ueber der Bounding Box aktualisiert.
2. `docs/tradeoffs.md`: Trade-off #4 von "fixed lyric banner" auf "face-anchored canvas rendering" korrigiert.


## 2026-03-12 — Entry 033: Issue #7 Songs & Media Management (Schritt 1–4)

Schritte (steps):

1. `frontend/public/songs/index.json` erstellt: Song-Katalog mit drei Eintraegen (demo-song, song-2 Happy Birthday, song-3 Techno Traum).
2. `frontend/src/karaoke/audio.ts`: `generateMelodyDataUrl(notes, sampleRate, volume)` und `generateHappyBirthdayDataUrl()` hinzugefuegt. Happy Birthday Melodie (BPM 80, C-Dur, ~22s, public domain seit 2016) als Note-Array mit 10 ms Fade-In/Out pro Note.
3. `frontend/public/lyrics/song2.lrc`: Happy Birthday Lyrics synchronisiert mit der generierten Melodie (4 Zeilen, Timestamps: 0:00, 0:05.25, 0:10.50, 0:16.50).
4. `frontend/public/lyrics/song3.lrc`: Techno Traum Placeholder-Lyrics (10 Zeilen, 4s-Intervall, 40s).
5. `frontend/src/karaoke/songs.ts` erstellt: `Song`-Typ, `loadSongCatalog()` (fetch + Validierung), `resolveAudioUrl()` (loest `generated:happy-birthday` auf).
6. `frontend/src/App.tsx`: Multi-Song-Support implementiert. Song-Katalog wird beim Mount geladen. Song-Dropdown im UI statt hardcoded Demo-Song. `loadSong(song)` laedt LRC und Audio dynamisch. `activeSongId` steuert Canvas-Lyric-Rendering.

## 2026-03-12 — Entry 034: Issue #8 UI/UX Polish Pass

Schritte (steps):

1. `frontend/src/styles.css`: `.status.connecting` neu (amber statt rot). Pulse-Animation fuer connecting-Dot. `select`-Element styled passend zu inputs. `.error-banner` als prominenter Fehler-Banner. `.editor-row`/`.editor-divider` fuer Name-Editor. Karaoke-Zeile mit linker Akzentlinie + soft background. Scrollbar-Styling. 3 Breakpoints: 480px (mobile padding, 1-col), 640px (2-col metrics), 900px (bestehend). Metrics-Panel collapsible (Header + Toggle-Button).
2. `frontend/src/App.tsx`: `wsStatus connecting` korrekt als CSS-Klasse `connecting` gesetzt. `wsError` als `.error-banner` statt inline-span. Metriken einklappbar via `metricsOpen`-State. Name-Editor in zwei `editor-row` unterteilt (Name-Zeile + Song-Zeile mit Divider).

## 2026-03-12 — Entry 035: Issue #9 Cloud Deployment Baseline

Schritte (steps):

1. `frontend/src/App.tsx`: `WS_URL` aus `import.meta.env.VITE_WS_URL` gelesen (Fallback auf localhost); konfigurierbar fuer Cloud-Deployments.
2. `frontend/.env.example`: Dokumentiert `VITE_WS_URL` fuer lokale und Cloud-Umgebungen.
3. `backend/Dockerfile`: python:3.12-slim, OpenCV-System-Abhaengigkeiten, uvicorn CMD; Modell-Datei wird nicht gebundelt.
4. `backend/.env.example`: Alle Backend-Umgebungsvariablen mit Standardwerten dokumentiert.
5. `docker-compose.yml`: Backend-Service mit env_file und Volume-Mount fuer Modell-Dateien.
6. `.github/workflows/ci.yml`: Frontend-Build-Artefakt (`frontend-dist`) wird nach erfolgreichem Build fuer 7 Tage hochgeladen.
7. `docs/deployment.md`: Vollstaendige Deployment-Anleitung fuer Vercel (Frontend), Docker/Railway/Fly.io (Backend), Modell-Setup und Umgebungsvariablen.

## 2026-03-12 — Entry 036: CI Backend Fix (ruff isort I001)

Schritte (steps):

1. `backend/ruff.toml` erstellt mit `known-first-party = ["app"]` fuer korrekte isort-Sektionierung.
2. `backend/app/main.py`: Import-Reihenfolge auf isort-Standard gebracht: stdlib → third-party (fastapi) → first-party (app.*), jeweils mit Leerzeile getrennt.
3. `backend/app/main.py`: Kombinierten Import `load_model, router as ws_router` auf zwei separate Zeilen aufgeteilt (Ruff-Anforderung bei gemischten Alias-Imports).
4. Root `pyproject.toml` ebenfalls mit `[tool.ruff.lint.isort] known-first-party = ["app"]` versehen (Fallback).
5. CI (GitHub Actions Backend-Job) ist jetzt wieder gruen (Commits: cdef95b, bfa760c, e91649d, 5d021a4, 4a502f7, 50ccba7).

## 2026-03-13 — Entry 037: Issue #11 Performance Optimization Pass

Schritte (steps):

1. `frontend/src/App.tsx`: Capture-Auflösung von 1280×720 auf 640×360 reduziert (`CAPTURE_WIDTH`/`CAPTURE_HEIGHT` Konstanten). Ergibt ~4× kleinere JPEG-Payload pro Frame.
2. `backend/app/api/ws.py`: `imgsz=640` explizit an YOLO-Aufruf übergeben — konsistent mit neuer Capture-Auflösung, verhindert unbeabsichtigtes Up-Scaling intern.
3. `frontend/src/App.tsx`: Canvas-`useEffect` haengt nicht mehr von `activeLine`, `karaokeLines`, `songByTrack`, `activeSongId` ab. Stattdessen werden diese Werte via `useRef` gelesen und per `useEffect` synchronisiert. Canvas-Redraw laeuft jetzt nur bei neuen Detektionen (~6–7×/s) statt bei jedem RAF-Tick (60fps).
4. `docs/adr/0008-capture-resolution.md`: Entscheidung dokumentiert inkl. Revert-Bedingung (kleine/entfernte Gesichter).
5. `docs/metrics-baseline.md`: Post-Optimization-Abschnitt mit erwarteten Verbesserungen ergaenzt.

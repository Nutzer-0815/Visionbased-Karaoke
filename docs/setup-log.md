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

1. Nach E2E-Smoke-Test wurde die lokal heruntergeladene Datei ackend/yolov8n.pt entfernt.
2. .gitignore erweitert um ackend/*.pt, damit lokale Modellgewichte nicht versehentlich committed werden.
3. Ziel: Repo sauber halten und große Binardateien aus Git ausschliessen.


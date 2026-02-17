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


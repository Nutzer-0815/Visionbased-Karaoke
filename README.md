# Face Karaoke AI

**Face Karaoke AI** ist ein lokales Echtzeit-System, das Gesichter per Webcam erkennt, trackt und Karaoke-Lyrics synchronisiert über dem jeweiligen Gesicht im Video anzeigt.

**Stack:** FastAPI + WebSocket + YOLOv8 (Backend) | React + Vite + TypeScript + Canvas (Frontend)

**MVP-Status:** Abgeschlossen (Phase 0–6)

---

## Features

- Live-Gesichtserkennung und -Tracking via YOLOv8
- Klick auf Gesicht → Name vergeben → Song zuordnen
- Karaoke-Lyrics werden face-gebunden über der Bounding Box gerendert
- LRC-Dateiformat für Lyrics mit Zeitstempel-Synchronisation
- Runtime-Metriken (E2E-Latenz, Inference-Zeit, FPS) mit Session-Export

---

## Quickstart

### 1. Modell herunterladen

Das Backend benötigt eine YOLOv8-Gewichtsdatei im `backend/`-Verzeichnis.

**Option A – Face-spezifisches Modell (empfohlen):**
```
yolov8n-face.pt  →  ins backend/-Verzeichnis legen
```

**Option B – Standard YOLOv8 (automatischer Download beim Start):**
```powershell
$env:YOLO_MODEL="yolov8n.pt"
```
Ultralytics lädt `yolov8n.pt` beim ersten Start automatisch herunter (~6 MB).

Das verwendete Modell kann jederzeit per Umgebungsvariable überschrieben werden:
```powershell
$env:YOLO_MODEL="yolov8n.pt"   # oder yolov8s-face.pt etc.
```

### 2. Backend starten (Python 3.12)

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Health-Check: `curl http://localhost:8000/health`

### 3. Frontend starten

```powershell
cd frontend
npm install
npm run dev
```

Browser: `http://localhost:5173`

---

## Nutzung

1. **"Start Webcam"** klicken
2. Gesicht im Video anklicken (wird orange markiert)
3. Namen eingeben → **"Name speichern"**
4. **"Song zuordnen"** klicken
5. Unter "Karaoke" → **"Play"** drücken
6. Lyrics erscheinen gelb über dem Gesicht im Video

---

## Projektstruktur

```
backend/   FastAPI + YOLOv8 + IOU-Tracker
frontend/  React + Vite + Canvas-Overlay + Karaoke-Engine
docs/      Spezifikationen, ADRs, Roadmap, Metriken
```

## Dokumente

- `docs/mvp.md` – MVP-Spezifikation
- `docs/roadmap.md` – Entwicklungsphasen
- `docs/architecture.md` – Architekturentscheidungen
- `docs/metrics-checklist.md` – Metriken und Messmethoden
- `docs/tradeoffs.md` – Dokumentierte Trade-offs

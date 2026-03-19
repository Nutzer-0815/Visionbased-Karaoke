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
- Persistente Gesichtswiedererkennung über Sessions (opt-in, lokal, InsightFace)

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

> **Hinweis:** Beim ersten Start lädt InsightFace das Erkennungsmodell **buffalo_s** (~150 MB)
> automatisch herunter. Das passiert einmalig und dauert je nach Verbindung 1–2 Minuten.
> Fehlt das YOLOv8-Modell, startet der Server nicht — Fehlermeldung erscheint im Terminal.

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
6. Lyrics erscheinen gelb unter dem Gesicht im Video

**Gesichtswiedererkennung (opt-in):**
- Toggle **"Erkennung: AN"** aktivieren (nur wenn InsightFace geladen wurde)
- Wird eine bekannte Person erkannt, erscheint: *"Erkannt: [Name]? Ja / Nein"*
- Nur bei Bestätigung wird das Embedding gespeichert (`backend/data/identities.json`)
- Gespeicherte Identitäten sind im Panel unterhalb des Namenseditors sichtbar und löschbar
- Weitere Details: [docs/privacy.md](docs/privacy.md)

---

## Songs hinzufügen

Songs liegen unter `frontend/public/songs/` — ein Ordner pro Song:

```
frontend/public/songs/
  index.json            ← Katalog, hier eintragen
  mein-song/
    lyrics.lrc          ← Pflicht (LRC-Format mit Zeitstempeln)
    audio.mp3           ← Optional
```

**Neues Lied in 3 Schritten:**

1. Ordner `frontend/public/songs/mein-song/` anlegen
2. `lyrics.lrc` ablegen ([LRC-Format](https://en.wikipedia.org/wiki/LRC_(file_format)))
3. Zeile in `index.json` ergänzen:

```json
{"folder": "mein-song", "title": "Mein Lied", "audio": "audio.mp3"}
```

Kein `audio`-Feld = kein Audio (Stille). `"audio": "generated:happy-birthday"` nutzt den eingebauten Sinuston-Generator.

---

## Umgebungsvariablen (Backend)

Optional: `backend/.env` anlegen:

| Variable | Standard | Beschreibung |
|---|---|---|
| `YOLO_MODEL` | `yolov8n-face.pt` | Pfad zur Modelldatei |
| `ALLOWED_ORIGINS` | `http://localhost:5173` | CORS-Whitelist |
| `RECOGNITION_THRESHOLD` | `0.4` | Cosine-Similarity-Schwellenwert für Wiedererkennung |
| `IDENTITY_STORE_PATH` | `data/identities.json` | Pfad zum Identitäten-Store |
| `LOG_LEVEL` | `INFO` | Log-Level |

---

## Projektstruktur

```
backend/
  app/
    api/ws.py           WebSocket-Endpoint, YOLO-Inferenz, IOU-Tracker
    core/identity.py    Lokaler Identitäten-Store
    core/recognizer.py  InsightFace-Embedding-Extraktion
    core/config.py      Einstellungen via .env
  data/                 Lokale Daten (nicht im Repo)
frontend/
  public/songs/         Song-Ordner (LRC + Audio)
  src/App.tsx           Hauptkomponente
  src/karaoke/          LRC-Parser, Audio-Generator, Song-Katalog
docs/
  mvp.md                MVP-Spezifikation
  architecture.md       Architekturentscheidungen
  privacy.md            Datenschutz (Gesichtserkennung)
```

## Dokumente

- [docs/mvp.md](docs/mvp.md) – MVP-Spezifikation
- [docs/architecture.md](docs/architecture.md) – Architekturentscheidungen
- [docs/privacy.md](docs/privacy.md) – Datenschutz (Gesichtserkennung)
- [docs/tradeoffs.md](docs/tradeoffs.md) – Dokumentierte Trade-offs

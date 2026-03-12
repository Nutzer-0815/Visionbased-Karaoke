# Backend (FastAPI)

**Lokaler Start (Python 3.12)**
1. `python -m venv .venv`
2. `.\.venv\Scripts\Activate.ps1`
3. `pip install -r requirements.txt`
4. `uvicorn app.main:app --reload --host 0.0.0.0 --port 8000`

**Health Check**
- `curl http://localhost:8000/health`

**Modell-Setup**

Das Backend benötigt eine YOLOv8-Gewichtsdatei. Standardmäßig wird `yolov8n-face.pt` erwartet.

Option A – Face-Modell manuell herunterladen und ins `backend/`-Verzeichnis legen.

Option B – Standard-Modell mit automatischem Download:
```powershell
$env:YOLO_MODEL="yolov8n.pt"
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Weitere konfigurierbare Umgebungsvariablen:

| Variable | Standard | Beschreibung |
|---|---|---|
| `YOLO_MODEL` | `yolov8n-face.pt` | Pfad oder Name der Gewichtsdatei |
| `CONF_THRESHOLD` | `0.3` | Mindest-Konfidenz für Detektionen |
| `TRACK_IOU_THRESHOLD` | `0.3` | IOU-Schwellwert für Tracker-Matching |
| `TRACK_MAX_MISSED` | `5` | Frames bis Track gelöscht wird |
| `MAX_FRAME_B64_LEN` | `2500000` | Max. Frame-Größe in Bytes (Base64) |
| `ALLOWED_ORIGINS` | `http://localhost:5173` | CORS-Ursprünge (kommagetrennt) |
| `LOG_LEVEL` | `INFO` | Log-Level |

**Lint (optional, Ruff)**
- `pip install ruff`
- `ruff check .`

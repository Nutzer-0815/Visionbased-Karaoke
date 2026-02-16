# Face Karaoke AI

Monorepo für **Face Karaoke AI**: ein lokales Backend (FastAPI + WebSocket) und ein Frontend (React + Vite + TypeScript) mit Webcam-Preview, Canvas-Overlay und späterer Web-Audio-Analyse (Web Audio). Ziel ist eine schlanke MVP-Umsetzung mit klaren Schnittstellen für Tracking/Inference (YOLOv8) im Backend.

Dieses Repository folgt einer Issue-by-Issue-Roadmap. Die Spezifikationen liegen in `docs/` und werden als Source of Truth genutzt.

**Quickstart**

Backend (FastAPI, Python 3.12):
1. `cd backend`
2. `python -m venv .venv`
3. `.\.venv\Scripts\Activate.ps1`
4. `pip install -r requirements.txt`
5. `uvicorn app.main:app --reload --host 0.0.0.0 --port 8000`
6. `curl http://localhost:8000/health`

Frontend (Vite + React + TypeScript):
1. `cd frontend`
2. `npm install`
3. `npm run dev`

Dokumente:
- `docs/mvp.md`
- `docs/roadmap.md`
- `docs/architecture.md`
- `docs/metrics-checklist.md`

Hinweis: Das Backend läuft lokal. GitHub Pages Deployment für das Frontend folgt in einem späteren Issue.

# Deployment

## Overview

| Component | Target | Notes |
|---|---|---|
| Frontend | Vercel / Netlify / static host | `npm run build` → `dist/` |
| Backend | Docker (Railway / Fly.io / VPS) | Requires Python runtime + model file |

The backend runs YOLOv8 inference (PyTorch ~2 GB). It cannot run on serverless or free-tier CPU-only platforms reliably. A GPU-enabled container host or a local machine is recommended.

---

## Frontend — Vercel (recommended)

1. Push the repository to GitHub (already done).
2. Create a new project on [vercel.com](https://vercel.com) and import the repository.
3. Set the **Root Directory** to `frontend`.
4. Set the **Build Command** to `npm run build` and **Output Directory** to `dist`.
5. Add the environment variable:
   ```
   VITE_WS_URL = wss://your-backend-host/ws/stream
   ```
6. Deploy. Every push to `main` triggers a new build automatically.

### Netlify alternative

```bash
cd frontend
npm run build
# drag-and-drop dist/ to netlify.com, or use netlify-cli:
npx netlify deploy --prod --dir dist
```

---

## Backend — Docker

### Build and run locally

```bash
# Copy and edit the env file
cp backend/.env.example backend/.env

# Start with docker-compose (builds image automatically)
docker-compose up --build

# Or build and run manually
docker build -t face-karaoke-backend ./backend
docker run -p 8000:8000 --env-file backend/.env face-karaoke-backend
```

### Model file

The model is **not bundled** in the Docker image. Two options:

**Option A — Manual (recommended for production)**
```bash
# Place yolov8n-face.pt into backend/ before building
cp /path/to/yolov8n-face.pt backend/
docker-compose up --build
```

**Option B — Auto-download on first start**
```bash
# In backend/.env:
YOLO_MODEL=yolov8n.pt
```
Ultralytics downloads `yolov8n.pt` (~6 MB) automatically on first startup.

### Railway deployment

1. Install the [Railway CLI](https://docs.railway.app/develop/cli).
2. ```bash
   railway login
   railway init
   railway up --service backend
   ```
3. Set environment variables in the Railway dashboard (copy from `backend/.env.example`).
4. Set `ALLOWED_ORIGINS` to your Vercel frontend URL.

### Fly.io deployment

```bash
cd backend
fly launch --name face-karaoke-backend
fly secrets set YOLO_MODEL=yolov8n.pt ALLOWED_ORIGINS=https://your-frontend.vercel.app
fly deploy
```

---

## Environment variables

### Frontend

| Variable | Default | Description |
|---|---|---|
| `VITE_WS_URL` | `ws://localhost:8000/ws/stream` | Backend WebSocket URL |

### Backend

See `backend/.env.example` for the full list. Key variables for production:

| Variable | Example | Description |
|---|---|---|
| `YOLO_MODEL` | `yolov8n-face.pt` | Model file path or name |
| `ALLOWED_ORIGINS` | `https://your-app.vercel.app` | CORS allowed origins |
| `LOG_LEVEL` | `WARNING` | Reduce noise in production |

---

## CI

GitHub Actions (`ci.yml`) runs on every push:
- Frontend: lint + build → uploads `dist/` as artifact `frontend-dist` (7-day retention)
- Backend: pip install + `ruff check`

The built frontend artifact can be downloaded from the Actions tab and deployed manually, or the CI can be extended with a deploy step (e.g., `vercel deploy --prod`).

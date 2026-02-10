# Backend (FastAPI)

**Lokaler Start**
1. `python -m venv .venv`
2. `.\.venv\Scripts\Activate.ps1`
3. `pip install -r requirements.txt`
4. `uvicorn app.main:app --reload --host 0.0.0.0 --port 8000`

**Health Check**
- `curl http://localhost:8000/health`

**Lint (optional, Ruff)**
- `pip install ruff`
- `ruff check .`

# Notes App

A full-stack notes web app: organize notes in groups (similar in spirit to chat threads). Users sign in with JWT-based auth; the API is built with FastAPI and SQLite.

## Repository layout

| Path | Role |
|------|------|
| `backend/` | FastAPI app, SQLAlchemy models, SQLite file DB |
| `frontend/` | React 19 + Vite UI |

## Tech stack

- **Frontend:** React 19, Vite 6
- **Backend:** FastAPI, SQLAlchemy, JWT (python-jose), bcrypt (passlib)
- **Database:** SQLite (`notes.db`, created beside the backend app on first run)

## Prerequisites

- **Python** 3.10+ recommended  
- **Node.js** 18+ (for npm and the Vite dev server)

## Backend setup

From the repository root:

```bash
cd backend
python -m venv venv
```

**Windows (PowerShell):** activate with `.\venv\Scripts\Activate.ps1`  
**macOS / Linux:** `source venv/bin/activate`

```bash
pip install -r requirements.txt
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

- API base: **http://127.0.0.1:8000**
- OpenAPI docs: **http://127.0.0.1:8000/docs**
- Health check: **http://127.0.0.1:8000/health**

The SQLite database file is created as `backend/notes.db` when the app runs (see `app/database.py`). It is listed in `.gitignore` and should not be committed.

### Environment variables (backend)

| Variable | Purpose |
|----------|---------|
| `JWT_SECRET_KEY` | Secret used to sign JWTs. **Set a strong random value in any shared or production environment.** If unset, a development default is used (see `app/security.py`). |

Example (PowerShell):

```powershell
$env:JWT_SECRET_KEY = "your-long-random-secret-here"
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

## Frontend setup

From the repository root:

```bash
cd frontend
npm install
npm run dev
```

The dev server runs on **http://localhost:3000** and proxies `/api` to the FastAPI app on **http://127.0.0.1:8000**, so you normally open only the frontend URL in the browser.

### Optional: `VITE_API_BASE`

By default the app uses relative URLs (empty base) so requests go through the Vite proxy in development. For a build served from another origin, set `VITE_API_BASE` to your API origin (e.g. `https://api.example.com`) before `npm run build`.

## Running the full stack locally

1. Start the backend (port **8000**).  
2. Start the frontend (`npm run dev`, port **3000**).  
3. Open **http://localhost:3000**.

CORS on the API allows localhost / 127.0.0.1 with any port for direct API access when needed.

## Scripts (frontend)

| Command | Description |
|---------|-------------|
| `npm run dev` | Dev server with hot reload |
| `npm run build` | Production build to `frontend/dist/` |
| `npm run preview` | Preview the production build locally |

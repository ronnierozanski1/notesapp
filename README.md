# Notes App

A personal notes web app - like WhatsApp groups with yourself.

## Tech Stack

- **Frontend:** React (coming soon)
- **Backend:** FastAPI (Python)
- **Database:** SQLite

## Getting Started

### Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

API runs at http://localhost:8000

- Health check: http://localhost:8000/health
- API docs: http://localhost:8000/docs

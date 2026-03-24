"""FastAPI app entry point."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel #delete after testing

from .database import engine, Base
from . import models  # noqa: F401 - needed so tables are registered
from .routers import auth, groups, notes

# Create database tables on startup
Base.metadata.create_all(bind=engine) #looks at all classes that inherit from Base, if table doesn't exist, create it

app = FastAPI(
    title="Notes API",
    description="Personal notes app - like WhatsApp groups with yourself",
    version="0.1.0",
)

# Local dev: any localhost / 127.0.0.1 port (Vite 3000/5173, or 127.0.0.1 vs "localhost")
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"http://(localhost|127\.0\.0\.1)(:\d+)?$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api", tags=["auth"])
app.include_router(groups.router, prefix="/api", tags=["groups"])
app.include_router(notes.router, prefix="/api", tags=["notes"])

#delete after testing
class EchoBody(BaseModel):
    """JSON body for POST /api/echo — learning step, no database."""

    message: str


@app.post("/api/echo")
def echo(body: EchoBody):
    """Echo the message back — smallest frontend ↔ backend loop."""
    return {"reply": f"You said: {body.message}"}
#delete after testing

#the get function in the app object is called with the path then returnes a function then this function is called with another function.
@app.get("/health") 
def health_check():
    """Simple endpoint to verify the server is running."""
    return {"status": "ok"}

"""Note API endpoints (per-group messages)."""

from datetime import datetime

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..database import get_db
from ..deps import get_current_user
from ..group_access import get_user_group_or_404
from .. import models
from ..schemas import NoteCreate, NoteResponse

router = APIRouter()

@router.get("/groups/{group_id}/notes", response_model=list[NoteResponse])
def list_notes(
    group_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Return all notes in the given group (must be owned by the current user), newest first."""
    get_user_group_or_404(db, group_id, current_user.id)

    stmt = (select(models.Note)
            .where(models.Note.group_id == group_id)
            .order_by(models.Note.created_at.desc()))
    return list(db.scalars(stmt).all())

@router.post("/groups/{group_id}/notes", response_model=NoteResponse, status_code=201)
def create_note(
    group_id: int,
    note_in: NoteCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    group = get_user_group_or_404(db, group_id, current_user.id)
    group.activity_at = datetime.utcnow()
    db_note = models.Note(content=note_in.content, group_id=group_id)
    db.add(db_note)
    db.commit()
    db.refresh(db_note)
    return db_note

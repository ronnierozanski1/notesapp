"""Group API endpoints (list and create chats)."""

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..database import get_db
from ..deps import get_current_user
from .. import models
from ..schemas import GroupCreate, GroupResponse

router = APIRouter()


@router.get("/groups", response_model=list[GroupResponse]) #response_model tells fastapi what the function returns
def list_groups(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Return the current user's groups, most recently active first (see Group.activity_at)."""
    stmt = (
        select(models.Group)
        .where(models.Group.user_id == current_user.id)
        .order_by(models.Group.activity_at.desc(), models.Group.id.desc())
    )
    return list(db.scalars(stmt).all())


@router.post("/groups", response_model=GroupResponse, status_code=201)
def create_group(
    group_in: GroupCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Create a new group owned by the current user."""
    db_group = models.Group(name=group_in.name, user_id=current_user.id)
    db.add(db_group)
    db.commit()
    db.refresh(db_group)
    return db_group

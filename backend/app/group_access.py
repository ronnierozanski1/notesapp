"""Helpers to resolve a group owned by the current user (404 if missing or not owned)."""


from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from . import models

#authorization check - check if the group belongs to the user
def get_user_group_or_404(db: Session, group_id: int, owner_id: int) -> models.Group:
    """Return the group only if it exists and belongs to owner_id; else 404 (no existence leak)."""
    stmt = select(models.Group).where(
        models.Group.id == group_id,
        models.Group.user_id == owner_id,
    )
    group = db.scalars(stmt).first()
    if group is None:
        raise HTTPException(status_code=404, detail="Group not found")
    return group

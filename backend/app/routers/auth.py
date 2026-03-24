"""Register and login (JWT)."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..database import get_db
from .. import models
from ..schemas import Token, UserLogin, UserPublic, UserRegister
from ..security import create_access_token, hash_password, verify_password

router = APIRouter()


@router.post("/register", response_model=UserPublic, status_code=status.HTTP_201_CREATED)
def register(body: UserRegister, db: Session = Depends(get_db)):
    """Create a new user with a hashed password."""
    username = body.username.strip()
    if not username:
        raise HTTPException(status_code=400, detail="Username is required")
    existing = db.scalars(select(models.User).where(models.User.username == username)).first()
    if existing is not None:
        raise HTTPException(status_code=400, detail="Username already taken")

    user = models.User(username=username, password_hash=hash_password(body.password))
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.post("/login", response_model=Token)
def login(body: UserLogin, db: Session = Depends(get_db)):
    """Validate credentials and return a JWT access token."""
    username = body.username.strip()
    user = db.scalars(select(models.User).where(models.User.username == username)).first()
    if user is None or not verify_password(body.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
        )
    token = create_access_token(user_id=user.id, username=user.username)
    return Token(access_token=token, token_type="bearer")

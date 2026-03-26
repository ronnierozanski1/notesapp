"""Password hashing and JWT creation/validation."""

import os
from datetime import datetime, timedelta, timezone
from jose import JWTError, jwt #jose library for creating and validating JWTs
from passlib.context import CryptContext #passlib library for hashing and verifying passwords

SECRET_KEY = os.getenv("JWT_SECRET_KEY", "dev-secret-change-with-JWT_SECRET_KEY") #later choose my key: $env:JWT_SECRET_KEY="my_super_secret_key"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_DAYS = 7

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto") #creates a password hashing configuration object, bcrypt is a secure hash algorithm


def hash_password(plain: str) -> str:
    return pwd_context.hash(plain)


def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)


def create_access_token(*, user_id: int, username: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(days=ACCESS_TOKEN_EXPIRE_DAYS)
    payload = {
        "sub": str(user_id),
        "username": username,
        "exp": expire,
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM) #creates a JWT token by serializing your data into a compact, URL-safe string format suitable for HTTP


def decode_token(token: str) -> dict: #decode the token, validate it, return a dictionary with the token contents
    return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])

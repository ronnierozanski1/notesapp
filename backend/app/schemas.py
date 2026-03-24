"""Pydantic schemas for API request/response validation."""

from datetime import datetime
from pydantic import BaseModel


class GroupBase(BaseModel):
    name: str


class GroupCreate(GroupBase): #what the user sends to the server
    pass


class GroupResponse(GroupBase):
    id: int
    user_id: int
    created_at: datetime

    class Config: #allows the schema to be converted to a dictionary then fastapi converts it to a json 
        from_attributes = True


class NoteBase(BaseModel):
    content: str


class NoteCreate(NoteBase):
    pass


class NoteResponse(NoteBase):
    id: int
    group_id: int
    created_at: datetime

    class Config:
        from_attributes = True


class UserRegister(BaseModel):
    username: str
    password: str


class UserLogin(BaseModel):
    username: str
    password: str


class UserPublic(BaseModel):
    id: int
    username: str

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

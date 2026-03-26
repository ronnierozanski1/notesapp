"""SQLAlchemy database models."""
#how the tables look like in the database

from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime

from .database import Base


class User(Base):
    """Registered account for JWT-authenticated API access."""

    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)

    groups = relationship("Group", back_populates="user") #so i can do user.groups to get all groups of the user


class Group(Base): #Each objet is one row = one group
    """A group/chat - like a WhatsApp group with yourself."""

    __tablename__ = "groups"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True) #foreign key means from another table
    created_at = Column(DateTime, default=datetime.utcnow)
    # Bumped when a note is posted (and set on create). Used for WhatsApp-style sidebar ordering.
    activity_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    user = relationship("User", back_populates="groups") #so i can do group.user to get the user of the group
    notes = relationship("Note", back_populates="group") #so i csn do group.notes to get all notes in the group


class Note(Base): #Each objuct is one row = one note
    """A note message inside a group."""

    __tablename__ = "notes"

    id = Column(Integer, primary_key=True, index=True)
    content = Column(Text, nullable=False)
    group_id = Column(Integer, ForeignKey("groups.id"), nullable=False) #foreign key means that the note matches an existing group
    created_at = Column(DateTime, default=datetime.utcnow)

    group = relationship("Group", back_populates="notes") #so i can do note.group to get the group of the note

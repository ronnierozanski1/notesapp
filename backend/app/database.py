"""SQLite database connection and session setup."""

from sqlalchemy import create_engine, inspect, text  # create or connect to the database
from sqlalchemy.orm import sessionmaker #create a session to interact with the database
from sqlalchemy.ext.declarative import declarative_base #create a base class for the database models


SQLALCHEMY_DATABASE_URL = "sqlite:///./notes.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False}) #connectiong to the DB, returns an engine object

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine) #talking to the DB - factory function that can create a session to interact with the database
Base = declarative_base() #define structure of the tables in the database


def migrate_sqlite_groups_activity_at(engine) -> None:
    """Add groups.activity_at for existing DBs (create_all does not ALTER old tables)."""
    try:
        cols = [c["name"] for c in inspect(engine).get_columns("groups")]
    except Exception:
        return
    if "activity_at" in cols:
        return
    with engine.begin() as conn:
        conn.execute(text("ALTER TABLE groups ADD COLUMN activity_at DATETIME"))
        conn.execute(text("UPDATE groups SET activity_at = created_at"))


def get_db():
    """Provides a database session. FastAPI will call this for each request."""
    db = SessionLocal() #create a temporary Session to interact with the database, when request is done, session is closed, SessionLocal is a factory function that can create a session to interact with the database
    try:
        yield db
    finally:
        db.close()

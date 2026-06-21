import os
from typing import Generator
from sqlalchemy.orm import Session
from ..core.database import SessionLocal

# Global engine instances (loaded at startup)
_engines = {
    "tfidf": None,
    "semantic": None,
    "hybrid": None
}

def get_db() -> Generator[Session, None, None]:
    """Dependency to get a DB session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_tfidf_engine():
    return _engines["tfidf"]

def get_semantic_engine():
    return _engines["semantic"]

def get_hybrid_engine():
    return _engines["hybrid"]

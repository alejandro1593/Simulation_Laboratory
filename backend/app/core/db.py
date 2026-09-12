"""Acceso a la base de datos (SQLAlchemy 2)."""

from __future__ import annotations

from collections.abc import Iterator

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from app.core.config import get_settings


class Base(DeclarativeBase):
    pass


def _make_engine():
    url = get_settings().database_url
    kwargs = {}
    if url.startswith("sqlite"):
        kwargs.update(connect_args={"check_same_thread": False})
    return create_engine(url, future=True, **kwargs)


engine = _make_engine()
SessionLocal = sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)


def get_db() -> Iterator[Session]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db() -> None:
    from app import models  # noqa: F401  (registra las tablas en Base.metadata)
    from app.core import audit  # noqa: F401  (registra audit_events)

    Base.metadata.create_all(bind=engine)
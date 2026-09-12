"""Auditoría append-only con cadena de hashes (tamper-evident)."""

from __future__ import annotations

import hashlib
import json
from datetime import UTC, datetime

from sqlalchemy import Column, DateTime, Integer, String, Text
from sqlalchemy.orm import Session

from app.core.db import Base


def _get_prev_hash(db: Session) -> str:
    last = db.query(AuditEvent).order_by(AuditEvent.id.desc()).first()
    return last.event_hash if last else ("0" * 64)


class AuditEvent(Base):
    __tablename__ = "audit_events"

    id = Column(Integer, primary_key=True)
    ts = Column(DateTime(timezone=True), default=lambda: datetime.now(UTC))
    user_id = Column(String(64), nullable=True)
    zone = Column(String(32))
    action = Column(String(128))
    detail = Column(Text, default="")
    prev_hash = Column(String(64))
    event_hash = Column(String(64))


def audit(db: Session, *, user_id: str | None, zone: str, action: str, detail: dict | None = None) -> None:
    prev = _get_prev_hash(db)
    record = {
        "prev": prev,
        "ts": datetime.now(UTC).isoformat(),
        "zone": zone,
        "action": action,
        "detail": detail or {},
    }
    event_hash = hashlib.sha256(json.dumps(record, sort_keys=True).encode()).hexdigest()
    db.add(
        AuditEvent(
            user_id=user_id,
            zone=zone,
            action=action,
            detail=json.dumps(record["detail"], ensure_ascii=False),
            prev_hash=prev,
            event_hash=event_hash,
        )
    )
    db.commit()
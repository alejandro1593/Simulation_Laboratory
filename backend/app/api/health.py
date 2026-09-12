"""Healthcheck y manifiesto de zonas (público)."""

from __future__ import annotations

from fastapi import APIRouter, Depends

from app.api.deps import guards, rate_get
from app.core.config import get_settings

router = APIRouter(tags=["health"])


@router.get("/health", dependencies=[rate_get()])
def health() -> dict:
    return {
        "status": "ok",
        "app": get_settings().app_name,
        "snapshot": get_settings().snapshot_version,
        "zones": {"lobby": True, "academic": True, "research": False},
        "engine": "molcore-sim-v1",
    }


@router.get("/whoami", dependencies=[Depends(guards.guest_lobby)])
def whoami(identity: dict = Depends(guards.guest_lobby)) -> dict:
    return identity
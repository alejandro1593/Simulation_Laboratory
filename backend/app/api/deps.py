"""Dependencias de zona y rate limiting consumidas por los routers."""

from dataclasses import dataclass

from fastapi import Depends

from app.core.config import get_settings
from app.core.security import (
    ZONE_ACADEMIC,
    ZONE_LOBBY,
    ZONE_RESEARCH,
    ZoneAuth,
    make_rate_limit,
)


@dataclass(frozen=True)
class Guards:
    identity = ZoneAuth(ZONE_LOBBY)  # requiere token, cualquier rol con lobby
    academic = ZoneAuth(ZONE_ACADEMIC)
    research = ZoneAuth(ZONE_RESEARCH)
    guest_lobby = ZoneAuth(ZONE_LOBBY, allow_guest=True)


guards = Guards()


def rate_get() -> Depends:
    return make_rate_limit(get_settings().rate_guest)


def rate_student() -> Depends:
    return make_rate_limit(get_settings().rate_student)


def rate_login() -> Depends:
    return make_rate_limit(10)
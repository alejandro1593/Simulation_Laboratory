"""Seguridad: password hashing (argon2), JWT por zonas y rate limit en memoria."""

from __future__ import annotations

import time
from datetime import UTC, datetime, timedelta

import jwt
from fastapi import Depends, Request
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pwdlib import PasswordHash

from app.core.config import get_settings
from app.core.errors import AppError

# Zonas (compartimentación, estilo "laboratorio clasificado")
ZONE_LOBBY = "lobby"
ZONE_ACADEMIC = "academic"
ZONE_RESEARCH = "research"

ROLE_ROUTES = {
    "guest": [ZONE_LOBBY],
    "student": [ZONE_LOBBY, ZONE_ACADEMIC],
    "docente": [ZONE_LOBBY, ZONE_ACADEMIC],
    "researcher": [ZONE_LOBBY, ZONE_ACADEMIC, ZONE_RESEARCH],
    "admin": [ZONE_LOBBY, ZONE_ACADEMIC, ZONE_RESEARCH],
}

_password_hash = PasswordHash.recommended()

_bearer = HTTPBearer(auto_error=False)


def hash_password(password: str) -> str:
    return _password_hash.hash(password)


def verify_password(password: str, hashed: str) -> bool:
    return _password_hash.verify(password, hashed)


def create_access_token(user_id: int, role: str) -> str:
    settings = get_settings()
    now = datetime.now(UTC)
    payload = {
        "sub": str(user_id),
        "role": role,
        "zone": ROLE_ROUTES[role][-1],
        "iat": now,
        "exp": now + timedelta(minutes=settings.jwt_access_ttl_min),
    }
    return jwt.encode(payload, settings.jwt_secret, algorithm=settings.jwt_algorithm)


def decode_token(token: str) -> dict:
    settings = get_settings()
    try:
        return jwt.decode(token, settings.jwt_secret, algorithms=[settings.jwt_algorithm])
    except jwt.ExpiredSignatureError as exc:
        raise AppError(401, "token_expired", "El token de acceso ha expirado.") from exc
    except jwt.InvalidTokenError as exc:
        raise AppError(401, "token_invalid", "El token no es válido.") from exc


class ZoneAuth:
    """Dependencia de zona: exige token y rol con acceso a la zona pedida."""

    def __init__(self, zone: str, *, allow_guest: bool = False):
        self.zone = zone
        self.allow_guest = allow_guest

    async def __call__(
        self,
        request: Request,
        creds: HTTPAuthorizationCredentials | None = Depends(_bearer),
    ) -> dict:
        if creds is None:
            if self.allow_guest:
                return {"sub": None, "role": "guest", "zone": ZONE_LOBBY}
            raise AppError(401, "auth_required", "Se requiere autenticación.")
        payload = decode_token(creds.credentials)
        role = payload.get("role", "guest")
        if self.zone not in ROLE_ROUTES.get(role, []):
            raise AppError(
                403,
                "zona_denegada",
                f"Tu rol ({role}) no tiene acceso a la zona \"{self.zone}\".",
            )
        return {"sub": payload.get("sub"), "role": role, "zone": payload.get("zone")}


class RateLimiter:
    """Token bucket simple en memoria (suficiente para dev/single-node)."""

    def __init__(self) -> None:
        self._buckets: dict[str, list[float]] = {}

    def allow(self, key: str, limit: int, window: float = 60.0) -> bool:
        now = time.monotonic()
        bucket = [t for t in self._buckets.get(key, []) if now - t < window]
        if len(bucket) >= limit:
            self._buckets[key] = bucket
            return False
        bucket.append(now)
        self._buckets[key] = bucket
        return True


def rate_key(request: Request, zone: str) -> str:
    return f"{request.client.host if request.client else '?'}:{zone}"


def make_rate_limit(limit: int) -> Depends:
    limiter = RateLimiter()

    def _check(request: Request) -> None:
        if not limiter.allow(rate_key(request, request.url.path), limit):
            raise AppError(429, "rate_limited", "Demasiadas solicitudes. Intenta de nuevo en un minuto.")

    return Depends(_check)
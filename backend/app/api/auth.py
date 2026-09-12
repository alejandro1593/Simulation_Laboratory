"""Registro, login, refresh y perfil — con refresco almacenado en hash + auditoría."""

from __future__ import annotations

import hashlib
import re
import secrets
from datetime import UTC, datetime, timedelta

from fastapi import APIRouter, Depends

from app.api.deps import guards, rate_login
from app.core.audit import audit
from app.core.config import get_settings
from app.core.db import get_db
from app.core.errors import AppError
from app.core.security import ROLE_ROUTES, create_access_token, hash_password, verify_password
from app.models import RefreshToken, User
from app.schemas import LoginIn, RefreshIn, RegisterIn, TokenPair, UserOut

router = APIRouter(prefix="/auth", tags=["auth"])

_EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


def _token_pair(db, user: User) -> TokenPair:
    settings = get_settings()
    raw = secrets.token_urlsafe(48)
    token_hash = hashlib.sha256(raw.encode()).hexdigest()
    db.add(
        RefreshToken(
            user_id=user.id,
            token_hash=token_hash,
            expires_at=datetime.now(UTC) + timedelta(days=settings.jwt_refresh_ttl_days),
        )
    )
    db.commit()
    return TokenPair(
        access_token=create_access_token(user.id, user.role),
        refresh_token=raw,
        expires_in_seconds=settings.jwt_access_ttl_min * 60,
        user=UserOut(id=user.id, email=user.email, username=user.username, role=user.role, zone=ROLE_ROUTES[user.role][-1]),
    )


@router.post("/register", response_model=TokenPair, status_code=201, dependencies=[rate_login()])
def register(body: RegisterIn, db=Depends(get_db)) -> TokenPair:
    if not _EMAIL_RE.match(body.email):
        raise AppError(422, "email_invalido", "Formato de correo no válido.")
    if db.query(User).filter(User.email == body.email).first():
        raise AppError(409, "email_duplicado", "Ya existe una cuenta con ese correo.")
    if db.query(User).filter(User.username == body.username).first():
        raise AppError(409, "usuario_duplicado", "Ese nombre de usuario ya está en uso.")
    user = User(email=body.email, username=body.username, password_hash=hash_password(body.password))
    db.add(user)
    db.commit()
    db.refresh(user)
    refresh = _token_pair(db, user)
    audit(db, user_id=str(user.id), zone="lobby", action="auth.register", detail={"email": body.email})
    return refresh


@router.post("/login", response_model=TokenPair, dependencies=[rate_login()])
def login(body: LoginIn, db=Depends(get_db)) -> TokenPair:
    user = db.query(User).filter(User.email == body.email).first()
    if user is None or not verify_password(body.password, user.password_hash):
        raise AppError(401, "credenciales_invalidas", "Correo o contraseña incorrectos.")
    audit(db, user_id=str(user.id), zone="lobby", action="auth.login", detail={})
    return _token_pair(db, user)


@router.post("/refresh", response_model=TokenPair)
def refresh(body: RefreshIn, db=Depends(get_db)) -> TokenPair:
    token_hash = hashlib.sha256(body.refresh_token.encode()).hexdigest()
    stored = (
        db.query(RefreshToken)
        .filter(RefreshToken.token_hash == token_hash, RefreshToken.revoked.is_(False))
        .first()
    )
    if stored is None or stored.expires_at < datetime.now(UTC):
        raise AppError(401, "refresh_invalido", "El token de refresco no es válido o expiró.")
    user = db.get(User, stored.user_id)
    if user is None:
        raise AppError(401, "usuario_borrado", "La cuenta ya no existe.")
    stored.revoked = True
    db.commit()
    audit(db, user_id=str(user.id), zone="lobby", action="auth.refresh", detail={})
    return _token_pair(db, user)


@router.get("/me", response_model=UserOut)
def me(identity: dict = Depends(guards.identity), db=Depends(get_db)) -> UserOut:
    user = db.get(User, int(identity["sub"]))
    if user is None:
        raise AppError(401, "usuario_borrado", "La cuenta ya no existe.")
    return UserOut(id=user.id, email=user.email, username=user.username, role=user.role, zone=ROLE_ROUTES[user.role][-1])
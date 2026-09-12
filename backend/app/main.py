"""MolCore Lab — API principal.

Monolito modular: una sola API FastAPI sirve al Lobby (público), a la Zona
Académica (JWT) y expone el portón sellado de la Zona de Investigación.
Sin connectors "mágicos": la química vive en app/domain y usa datos curados.
"""

from __future__ import annotations

from contextlib import asynccontextmanager

import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import get_settings
from app.core.db import init_db
from app.core.errors import register_exception_handlers


@asynccontextmanager
async def lifespan(_app: FastAPI):
    init_db()
    yield


def create_app() -> FastAPI:
    settings = get_settings()
    app = FastAPI(
        title=settings.app_name,
        version="1.0.0",
        description=(
            "Plataforma web de química experimental simulada. Zonas compartimentadas; "
            "toda la química se resuelve en el backend con un kernel determinista."
        ),
        lifespan=lifespan,
    )

    origins = [o.strip() for o in settings.cors_origins.strip("[]").split(",") if o.strip()]
    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins or ["http://localhost:5173"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    from app.api import academic, auth, health, research

    app.include_router(health.router, prefix="/api/v1")
    app.include_router(auth.router, prefix="/api/v1")
    app.include_router(academic.router, prefix="/api/v1")
    app.include_router(research.router, prefix="/api/v1")

    register_exception_handlers(app)
    return app


app = create_app()


if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=get_settings().debug)
"""Zona Investigación: acceso restringido (MFA) — MVP solo exhibe el estado.

Esta zona quedará física y lógicamente aislada: cola de cómputo en contenedores
sin red, integridad de datos por auditoría con cadena de hashes y verificación
obligatoria de pertenencia. En Fase 1 solo devolvemos estado y un 503 honesto
para los endpoints que aún no existen: no fingimos resultados.
"""

from __future__ import annotations

from fastapi import APIRouter, Depends

from app.api.deps import guards
from app.core.audit import audit
from app.core.db import get_db
from app.core.errors import AppError

router = APIRouter(prefix="/research", tags=["research"])


@router.get("/status")
def research_status(_identity: dict = Depends(guards.research), db=Depends(get_db)) -> dict:
    audit(db, user_id=str(_identity.get("sub")), zone="research", action="research.status", detail={})
    return {
        "status": "planned",
        "mfa_required": True,
        "sandbox": "no-network-container",
        "audit": "tamper-evident-hashchain",
        "services": {
            "screening_virtual": "planned",
            "simulacion_dft": "planned",
            "docking": "planned",
            "prediccion_reacciones": "planned",
            "datos": "elementos-y-sustancias-curados",
        },
        "política": "No se sirven resultados de IA aún: todo está marcado como planificado.",
    }


@router.post("/jobs")
def research_job(_identity: dict = Depends(guards.research)) -> dict:
    raise AppError(
        503,
        "zona_en_construccion",
        "La zona de investigación abre en una fase posterior del proyecto. Consulta /research/status.",
    )
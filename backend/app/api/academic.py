"""Zona Académica: simulador, tutor, tabla periódica, constructor, calculadoras y progreso."""

from __future__ import annotations

from collections import Counter, defaultdict
from datetime import UTC, date, datetime, timedelta

from fastapi import APIRouter, Depends, Query

from app.api.deps import guards, rate_student
from app.core.audit import audit
from app.core.db import get_db
from app.core.errors import AppError
from app.domain import builder, calculators, periodic, simulator, tutor
from app.domain.balancer import BalanceError, ParseError, balance
from app.domain.simulator import SimulationError
from app.domain.tutor import PracticeError
from app.models import ProgressEntry
from app.schemas import (
    BalanceIn,
    BuildingIn,
    CheckIn,
    DilutionIn,
    Mol3DIn,
    MolarMassIn,
    ProgressIn,
    SimulateIn,
    SolutionPrepIn,
)

router = APIRouter(prefix="/academic", tags=["academic"])


# ---------------------------------------------------------------- simulador


@router.get("/simulator/catalog", dependencies=[rate_student()])
def simulator_catalog() -> dict:
    return simulator.catalog()


@router.post("/simulator/run", dependencies=[rate_student()])
def simulator_run(body: SimulateIn, identity: dict = Depends(guards.academic), db=Depends(get_db)) -> dict:
    try:
        result = simulator.run_scene([a.model_dump() for a in body.additions], equipment=body.equipment)
    except SimulationError as exc:
        raise AppError(422, "receta_no_valida", str(exc)) from exc
    audit(
        db,
        user_id=str(identity.get("sub")),
        zone="academic",
        action="simulator.run",
        detail={"experiment": result["id"], "topics": result["topic"]},
    )
    return result


# ---------------------------------------------------------------- tutor


@router.get("/tutor/problem", dependencies=[rate_student()])
def tutor_problem(
    topic: str | None = Query(default=None),
    difficulty: int | None = Query(default=None, ge=1, le=3),
    identity: dict = Depends(guards.academic),
) -> dict:
    try:
        return tutor.generate_problem(topic=topic, difficulty=difficulty)
    except PracticeError as exc:
        raise AppError(404, "sin_ejercicios", str(exc)) from exc


@router.post("/tutor/balance", dependencies=[rate_student()])
def tutor_balance(body: BalanceIn) -> dict:
    try:
        return tutor.balance_with_steps(body.equation)
    except (ParseError, BalanceError) as exc:
        raise AppError(422, "ecuacion_invalida", str(exc)) from exc


@router.post("/tutor/check", dependencies=[rate_student()])
def tutor_check(body: CheckIn, identity: dict = Depends(guards.academic), db=Depends(get_db)) -> dict:
    result = tutor.check_solution(body.exercise, body.solution)
    audit(
        db,
        user_id=str(identity.get("sub")),
        zone="academic",
        action="tutor.check",
        detail={"correct": result["correct"], "exercise": body.exercise},
    )
    return result


@router.post("/balance", dependencies=[rate_student()])
def balance_equation(body: BalanceIn) -> dict:
    """Equilibrado directo (sin pasos) para integrar en el simulador o el bloc."""
    try:
        return balance(body.equation)
    except (ParseError, BalanceError) as exc:
        raise AppError(422, "ecuacion_invalida", str(exc)) from exc


# ---------------------------------------------------------------- tabla periódica


@router.get('/periodic/elements', dependencies=[rate_student()])
def periodic_elements() -> list[dict]:
    return periodic.get_elements()


@router.get("/periodic/elements/{z}", dependencies=[rate_student()])
def periodic_element(z: int) -> dict:
    el = periodic.get_element(z)
    if el is None:
        raise AppError(404, "elemento_no_encontrado", "Número atómico fuera del catálogo.")
    return el


@router.get("/periodic/neighbors/{z}", dependencies=[rate_student()])
def periodic_neighbors(z: int) -> list[dict]:
    return periodic.neighbors(z)


@router.get("/periodic/trends/{prop}", dependencies=[rate_student()])
def periodic_trends(prop: str) -> dict:
    if prop not in ("en", "m"):
        raise AppError(422, "propiedad_no_soportada", "Usa 'en' (electronegatividad) o 'm' (masa).")
    return periodic.trend_breakpoints(prop)


# ---------------------------------------------------------------- constructor


@router.get("/builder/presets", dependencies=[rate_student()])
def builder_presets() -> dict:
    return builder.presets()


@router.post("/builder/validate", dependencies=[rate_student(), Depends(guards.academic)])
def builder_validate(body: BuildingIn) -> dict:
    return builder.Building([a.model_dump() for a in body.atoms], [b.model_dump() for b in body.bonds]).validate()


@router.post("/builder/mol3d", dependencies=[rate_student()])
def builder_mol3d(body: Mol3DIn, _identity: dict = Depends(guards.academic)):
    try:
        result = builder.mol3d(body.smiles)
    except Exception as exc:  # RDKit puede lanzar múltiples excepciones
        raise AppError(422, "smiles_invalido", f"No se pudo interpretar el SMILES: {exc}") from exc
    if result is None:
        raise AppError(503, "rdkit_no_disponible", "RDKit no está instalado en este despliegue; usa el constructor 2D.")
    return result


# ---------------------------------------------------------------- calculadoras


@router.post("/calculators/molar-mass", dependencies=[rate_student()])
def calc_molar_mass(body: MolarMassIn) -> dict:
    try:
        return calculators.molar_mass(body.formula)
    except calculators.CalculationError as exc:
        raise AppError(422, "formula_invalida", str(exc)) from exc


@router.post("/calculators/oxidation-states", dependencies=[rate_student()])
def calc_oxidation_states(body: MolarMassIn) -> dict:
    try:
        return calculators.oxidation_states(body.formula)
    except calculators.CalculationError as exc:
        raise AppError(422, "formula_invalida", str(exc)) from exc


@router.post("/calculators/solution-prep", dependencies=[rate_student()])
def calc_solution_prep(body: SolutionPrepIn) -> dict:
    try:
        return calculators.solution_prep(body.formula, molarity=body.molarity, volume_ml=body.volume_ml)
    except calculators.CalculationError as exc:
        raise AppError(422, "formula_invalida", str(exc)) from exc


@router.post("/calculators/dilution", dependencies=[rate_student()])
def calc_dilution(body: DilutionIn) -> dict:
    try:
        return calculators.dilution(c1=body.c1, v1_ml=body.v1_ml, c2_target=body.c2)
    except calculators.CalculationError as exc:
        raise AppError(422, "dilucion_invalida", str(exc)) from exc


# ---------------------------------------------------------------- progreso del estudiante


@router.post("/progress", status_code=201, dependencies=[rate_student()])
def record_progress(body: ProgressIn, identity: dict = Depends(guards.academic), db=Depends(get_db)) -> dict:
    """Registra un intento/práctica (un fila por evento: score 1 = acierto, 0 = fallo)."""
    user_id = int(identity["sub"])
    db.add(
        ProgressEntry(
            user_id=user_id,
            topic=body.topic,
            activity_type=body.activity_type,
            score=body.score,
            detail=body.detail,
        )
    )
    db.commit()
    counts = (
        db.query(ProgressEntry)
        .filter(ProgressEntry.user_id == user_id)
        .with_entities(ProgressEntry.topic, ProgressEntry.score)
        .all()
    )
    return {
        "user_id": user_id,
        "topic": body.topic,
        "score": body.score,
        "totals": {"attempts": len(counts), "correct": sum(1 for _, s in counts if s == 1)},
    }


def _streak(dates: set[date]) -> int:
    """Días consecutivos con actividad terminando en hoy (o ayer si hoy aún no hay)."""
    if not dates:
        return 0
    cursor = datetime.now(UTC).date()
    if cursor not in dates:
        cursor -= timedelta(days=1)
    streak = 0
    while cursor in dates:
        streak += 1
        cursor -= timedelta(days=1)
    return streak


@router.get("/progress", dependencies=[rate_student()])
def student_progress(identity: dict = Depends(guards.academic), db=Depends(get_db)) -> dict:
    user_id = int(identity["sub"])
    entries = db.query(ProgressEntry).filter(ProgressEntry.user_id == user_id).all()
    totals = Counter()
    correct = Counter()
    per_day: dict[date, list[float | None]] = defaultdict(list)
    for e in entries:
        totals[e.topic] += 1
        if e.score == 1:
            correct[e.topic] += 1
        per_day[e.at.date()].append(e.score)

    topics = [
        {
            "topic": t,
            "attempts": totals[t],
            "correct": correct[t],
            "mastery": round(correct[t] * 100 / totals[t], 1) if totals[t] else 0.0,
        }
        for t in totals
    ]
    topics.sort(key=lambda x: -x["mastery"])

    today = datetime.now(UTC).date()
    days = []
    for offset in range(6, -1, -1):
        d = today - timedelta(days=offset)
        scores = per_day.get(d, [])
        days.append({"day": d.isoformat(), "attempts": len(scores), "correct": sum(1 for s in scores if s == 1)})

    attempts = sum(totals.values())
    correct_total = sum(correct.values())
    return {
        "topics": topics,
        "totals": {"attempts": attempts, "correct": correct_total, "accuracy": round(correct_total * 100 / attempts, 1) if attempts else 0.0},
        "streak": _streak(set(per_day.keys())),
        "last_7_days": days,
    }
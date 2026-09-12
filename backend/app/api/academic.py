"""Zona Académica: simulador, tutor, tabla periódica, constructor y calculadoras."""

from __future__ import annotations

from fastapi import APIRouter, Depends, Query

from app.api.deps import guards, rate_student
from app.core.audit import audit
from app.core.db import get_db
from app.core.errors import AppError
from app.domain import builder, calculators, periodic, simulator, tutor
from app.domain.balancer import BalanceError, ParseError, balance
from app.domain.simulator import SimulationError
from app.domain.tutor import PracticeError
from app.schemas import (
    BalanceIn,
    BuildingIn,
    CheckIn,
    DilutionIn,
    Mol3DIn,
    MolarMassIn,
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
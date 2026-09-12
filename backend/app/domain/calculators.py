"""Calculadoras de laboratorio (Zona Académica).

Masa molar y preparación de disoluciones a partir de la fórmula química.
Solo usan datos reales (masas atómicas del catálogo de elementos): no hay
ninguna constante inventada.
"""

from __future__ import annotations

from app.data import load_elements
from app.domain.balancer import ParseError, parse_species


class CalculationError(ValueError):
    pass


def _masses() -> dict[str, float]:
    return {e["s"]: e["m"] for e in load_elements() if e.get("m")}


def molar_mass(formula: str) -> dict:
    try:
        spec = parse_species(formula)
    except ParseError as exc:
        raise CalculationError(str(exc)) from exc
    masses = _masses()
    missing = [el for el in spec.composition if el not in masses]
    if missing:
        raise CalculationError(f"Sin masa atómica para: {', '.join(missing)}.")
    total = round(sum(count * masses[el] for el, count in spec.composition.items()), 3)
    return {
        "formula": spec.formula,
        "molar_mass_g_mol": total,
        "composition": spec.composition,
        "charge": spec.charge,
    }


def solution_prep(formula: str, *, molarity: float, volume_ml: float) -> dict:
    """Gramos de soluto (sólido) necesarios para preparar un volumen de disolución."""
    if molarity <= 0 or volume_ml <= 0:
        raise CalculationError("Molaridad y volumen deben ser positivos.")
    mm = molar_mass(formula)["molar_mass_g_mol"]
    moles = molarity * volume_ml / 1000.0
    mass_g = round(moles * mm, 3)
    return {
        "formula": formula,
        "molarity": molarity,
        "volume_ml": volume_ml,
        "moles": round(moles, 6),
        "molar_mass_g_mol": mm,
        "mass_to_weigh_g": mass_g,
        "step_mass_g": mass_g,
    }


def dilution(*, c1: float, v1_ml: float, c2_target: float) -> dict:
    """C1·V1 = C2·V2: volumen final necesario y agua a añadir."""
    if c1 <= 0 or v1_ml <= 0 or c2_target <= 0:
        raise CalculationError("Concentraciones y volumen iniciales deben ser positivos.")
    if c2_target >= c1:
        raise CalculationError("La concentración final debe ser menor que la inicial (se diluye).")
    v2 = (c1 * v1_ml) / c2_target
    return {
        "c1": c1,
        "v1_ml": v1_ml,
        "c2": c2_target,
        "v2_ml": round(v2, 2),
        "water_to_add_ml": round(v2 - v1_ml, 2),
    }
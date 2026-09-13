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


# Estados de oxidación (reglas deterministas simplificadas).
# Orden de prioridad:
#  1. F = −1 ; metales de los grupos 1/2 y Zn, Al, B = fijos
#  2. H = +1 (hydruros con metales → −1)
#  3. Halógenos = −1 salvo si hay oxígeno (entonces se resuelven)
#  4. O = −2 salvo peróxidos (O₂²⁻, detectados por balance) o flúor
#  5. Si queda un único elemento sin asignar, se despeja por carga total.

_ALCALINOS = {"Li", "Na", "K", "Rb", "Cs", "Fr"}
_ALCALINOTERREOS = {"Be", "Mg", "Ca", "Sr", "Ba", "Ra"}
_METALES = _ALCALINOS | _ALCALINOTERREOS | {
    "Al", "Zn", "Fe", "Cu", "Ag", "Pb", "Sn", "Hg", "Ni", "Co", "Mn",
    "Cr", "Ti", "V", "Mo", "W", "Cd", "Pt", "Au",
}


def _assign_states(comp, charge) -> tuple[dict[str, int | None], list[str]]:
    """Devuelve (estado por símbolo, notas)."""
    fixed: dict[str, int | None] = {}
    notes: list[str] = []
    unfixed = set(comp)

    for el in unfixed.copy():
        if el == "F":
            fixed[el] = -1
        elif el in _ALCALINOS:
            fixed[el] = 1
        elif el in _ALCALINOTERREOS:
            fixed[el] = 2
        elif el == "Zn":
            fixed[el] = 2
        elif el == "Al":
            fixed[el] = 3

    # Hydruros: si todos los no-H son metales → H = −1 (p.ej. NaH, CaH₂)
    others = {el for el in comp if el != "H"}
    if "H" in comp and others and others <= _METALES:
        fixed["H"] = -1
    elif "H" in comp:
        fixed["H"] = 1

    halogens = {"Cl", "Br", "I"}
    for el in halogens & unfixed:
        if "O" in comp:
            continue  # se resuelve más abajo (Cl₂O₇, HClO₄…)
        fixed[el] = -1

    # Peróxidos: 2 elementos, el otro con estado fijo, el O₂ guarda −1
    o_in = "O" in unfixed and "O" not in fixed
    if o_in:
        others = set(comp) - {"O"}
        if len(others) == 1:
            other = next(iter(others))
            if comp["O"] == 2 and other in fixed and comp[other] * fixed[other] - 2 == charge:
                fixed["O"] = -1
                notes.append("Peróxido: el oxígeno actúa con estado −1 (grupo O₂²⁻).")

    if "O" in unfixed and "O" not in fixed and "F" not in comp:
        fixed["O"] = -2

    # Despejar el elemento que queda
    remaining = unfixed - set(fixed)
    if len(remaining) == 1:
        el = remaining.pop()
        already = sum(n * fixed[s] for s, n in comp.items() if s in fixed)
        total_slots = (charge - already) / comp[el]
        est = round(total_slots)
        if abs(total_slots - est) > 0.01:
            notes.append(
                f"No hay un estado de oxidación único para {el}: "
                f"el balance exige {total_slots:+.2f}. Revisa carga o fórmula."
            )
            fixed[el] = None  # type: ignore[assignment]
        else:
            fixed[el] = est
    elif len(remaining) > 1:
        notes.append(
            "No se puede asignar estado único: varios elementos sin regla fija "
            f"({', '.join(sorted(remaining))}). Enseña el ion o la carga."
        )

    return fixed, notes


def oxidation_states(formula: str) -> dict:
    """Asigna estado de oxidación a cada elemento con reglas deterministas."""
    try:
        spec = parse_species(formula)
    except ParseError as exc:
        raise CalculationError(str(exc)) from exc
    assigned, notes = _assign_states(spec.composition, spec.charge)
    has_unknown = any(v is None for v in assigned.values())
    total = sum(n * (assigned.get(el) or 0) for el, n in spec.composition.items()) if not has_unknown else 0.0
    states = {el: None for el in spec.composition} if has_unknown else assigned
    return {
        "formula": spec.formula,
        "charge": spec.charge,
        "states": states,
        "total": round(total, 2),
        "balanced": round(total, 2) == spec.charge,
        "notes": notes,
    }
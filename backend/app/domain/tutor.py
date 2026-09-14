"""Tutor didáctico de balanceo sobre el kernel determinista.

Proporciona: pasos orientativos por elemento, generación de ejercicios desde un
banco curado y verificación de la solución del alumno contra la referencia.
"""

from __future__ import annotations

import random

from app.data import load_balanced_pool
from app.domain import balancer

# Orden pedagógico clásico para sugerir el balanceo
_ELEMENT_ORDER = ["charge", "e-", "C", "S", "N", "P", "Cl", "Fe", "Cu", "Zn", "Al", "Na", "K", "Ca", "Ag", "Ba", "Mn", "Cr", "O", "H"]


def balance_with_steps(equation: str) -> dict:
    """Balancea y genera pasos orientativos por elemento conservado."""
    r = balancer.balance(equation)
    eq = balancer.parse_equation(equation)
    species = eq.reactants + eq.products

    totals: dict[str, tuple[int, int]] = {}
    for key in {el for s in species for el in s.composition}:
        lhs = sum(s.composition.get(key, 0) for s in eq.reactants)
        rhs = sum(s.composition.get(key, 0) for s in eq.products)
        totals[key] = (lhs, rhs)
    if any(s.charge != 0 for s in species) or any("e-" in s.composition for s in species):
        lhs_q = sum(s.charge for s in eq.reactants)
        rhs_q = sum(s.charge for s in eq.products)
        totals["charge"] = (lhs_q, rhs_q)

    order = [el for el in _ELEMENT_ORDER if el in totals] + sorted(el for el in totals if el not in _ELEMENT_ORDER)

    steps = []
    for el in order:
        lhs, rhs = totals[el]
        if el == "charge":
            tip = "Equilibra la carga total: la suma de cargas en reactivos debe igualar a la de productos."
        elif el in ("H", "O"):
            tip = f"Ajusta {el} al final: suele equilibrarse a través de H2O / especies con H/O."
        else:
            tip = f"Cuenta {el}: reactivos {lhs}, productos {rhs}. Ajusta el coeficiente de la especie con {el}."
        steps.append(
            {
                "element": el,
                "reactants_total": lhs,
                "products_total": rhs,
                "initial_balanced": lhs == rhs,
                "tip": tip,
            }
        )

    return {
        "input": equation,
        "balanced": r["balanced"],
        "verified": r["verified"],
        "steps": steps,
        "coefficients": r["coefficients"],
    }


class PracticeError(ValueError):
    pass


def check_solution(original: str, proposed: str) -> dict:
    """Comprueba la solución propuesta por el alumno con los coeficientes escritos."""
    try:
        ref = balancer.balance(original)
        verified = balancer.verify_given(proposed)
        formatted_ref = ref["balanced"]
    except (balancer.ParseError, balancer.BalanceError) as exc:
        return {
            "correct": False,
            "detail": "No entendí la ecuación: " + str(exc),
            "verified": None,
            "reference": None,
        }
    correct = bool(verified["conserves_mass"] and verified["charge"] == 0)
    return {
        "correct": correct,
        "reference": formatted_ref,
        "proposed": proposed,
        "verified": verified,
        "detail": "Masa y carga conservadas." if correct else "Aún no se conservan los átomos (o la carga).",
    }


def generate_problem(*, topic: str | None = None, difficulty: int | None = None) -> dict:
    pool = load_balanced_pool()
    if topic:
        pool = [p for p in pool if p["topic"] == topic]
    if difficulty:
        pool = [p for p in pool if p["difficulty"] == difficulty]
    if not pool:
        raise PracticeError("No hay ejercicios para esos filtros.")
    pick = random.choice(pool)
    # la solución NO se expone; solo se usa para verificación
    return {
        "id": f"{pick['topic']}-{hash(pick['input']) % 100000}",
        "input": pick["input"],
        "topic": pick["topic"],
        "difficulty": pick["difficulty"],
    }
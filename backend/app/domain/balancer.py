"""Balanceador estequiométrico determinista.

Algoritmo: Gauss-Jordan sobre números racionales (Fraction) para resolver el espacio
nulo de la matriz de composición y posterior escalado a enteros mínimos.
Sirve como único kernel compartido: tutor académico, motor del simulador y futura
zona de investigación.
"""

from __future__ import annotations

import math
import re
from fractions import Fraction
from itertools import product
from typing import NamedTuple

from app.data import element_symbols

MAX_COEFF = 50


class ParseError(ValueError):
    """Fórmula o ecuación inválida."""


class BalanceError(ValueError):
    """No se pudo balancear la ecuación."""


class Species(NamedTuple):
    formula: str
    composition: dict[str, int]  # elemento -> cuenta
    charge: int


class Equation(NamedTuple):
    reactants: list[Species]
    products: list[Species]


# ---------------------------------------------------------------- parsing

_ELEMENT = re.compile(r"[A-Z][a-z]?")
_SPECIAL_ELEMENT = "e-"  # electrón (reacciones redox por ion-electrón)


def _extract_charge(s: str) -> tuple[str, int]:
    """Extrae la carga iónica del final de un fórmula.

    Formas soportadas (en orden de prioridad):
      - Paréntesis explícito:  'Cr2O7(2-)', 'Fe(3+)', 'H(+)'
      - Caret explícito:       'Fe^2+', 'SO4^2-'
      - Signo desnudo:         'NO3-'  → carga ±1, cualquier dígito previo
                                se interpreta como subíndice.
    Un 'Fe2+' a secas se lee como subíndice Fe2 con carga +1 y NO como Fe2 (2+);
    para magnitud real usa 'Fe(2+)' o 'Fe^2+'. Esa ambigüedad se documenta para
    que el catálogo quede inequívoco.
    """
    s = s.strip()

    m = re.search(r"\((\d*)\s*([+-])\)\s*$", s)
    if m:
        mag = int(m.group(1)) if m.group(1) else 1
        charge = -mag if m.group(2) == "-" else mag
        return s[: m.start()].rstrip(), charge

    m = re.search(r"\^(\d+)\s*([+-])\s*$", s)
    if m:
        charge = -int(m.group(1)) if m.group(2) == "-" else int(m.group(1))
        return s[: m.start()].rstrip(), charge

    m = re.search(r"([+-])\s*$", s)
    if m:
        charge = -1 if m.group(1) == "-" else 1
        return s[: m.start()].rstrip(), charge

    return s, 0


def _parse_formula(formula: str) -> tuple[dict[str, int], int]:
    """Devuelve (composition, charge) a partir de una fórmula tipo 'Ca(OH)2', 'NO3-', 'e-'."""
    if formula.strip() == _SPECIAL_ELEMENT:
        return {_SPECIAL_ELEMENT: 1}, -1
    body, charge = _extract_charge(formula)
    out: dict[str, int] = {}
    _parse_group(body, 1, out)
    return out, charge


def _parse_group(s: str, mult: int, out: dict[str, int]) -> None:
    i = 0
    n = len(s)
    while i < n:
        c = s[i]
        if c == "(":
            depth = 1
            j = i + 1
            while j < n and depth:
                if s[j] == "(":
                    depth += 1
                elif s[j] == ")":
                    depth -= 1
                j += 1
            if depth:
                raise ParseError(f"Paréntesis sin cerrar en: {s}")
            inner = s[i + 1 : j - 1]
            k = j
            num = ""
            while k < n and s[k].isdigit():
                num += s[k]
                k += 1
            gmult = int(num) if num else 1
            _parse_group(inner, mult * gmult, out)
            i = k
        elif c == "(":
            raise ParseError(f"Elemento inválido en: {s}")
        else:
            m = _ELEMENT.match(s, i)
            if m is None:
                raise ParseError(f"Elemento inválido en posición {i} de: {s}")
            el = m.group(0)
            if el not in element_symbols():
                raise ParseError(f"Símbolo de elemento desconocido: {el}")
            i = m.end()
            num = ""
            while i < n and s[i].isdigit():
                num += s[i]
                i += 1
            out[el] = out.get(el, 0) + mult * (int(num) if num else 1)


def parse_species(formula: str) -> Species:
    formula = formula.strip().replace(" ", "")
    if not formula:
        raise ParseError("Fórmula vacía.")
    label = re.fullmatch(r"^(.*)\(([^()]+)\)$", formula)
    if label and not re.fullmatch(r"\d*[+-]?", label.group(2)):
        formula = label.group(1)
    comp, charge = _parse_formula(formula)
    if not comp:
        raise ParseError(f"Fórmula vacía: {formula!r}")
    return Species(formula, comp, charge)


def parse_equation(equation: str) -> Equation:
    eq = equation.replace("→", "->").replace("=>", "->").strip()
    if "=" in eq and "==>" not in eq:
        eq = eq.replace("=", "->")
    if "->" not in eq:
        raise ParseError("Escribe la ecuación con '->' (ej: Na + Cl2 -> NaCl).")
    left, _, right = eq.partition("->")
    if not left.strip() or not right.strip():
        raise ParseError("Falta un lado de la ecuación.")

    rt, pt = _terms(left), _terms(right)
    return Equation([t[0] for t in rt], [t[0] for t in pt])


_COEFF = re.compile(r"^(\d+)\s*(.*)$")


def _terms(side: str) -> list[tuple[Species, int]]:
    """Separa especies (con su coeficiente explícito si lo llevan) y las parsea.

    La separación usa ' + ' (con espacios) para no partir cargas como 'Fe(3+)' y
    admite coeficientes delante: '2 HCl', '3 Cu', etc.
    """
    out: list[tuple[Species, int]] = []
    for t in re.split(r"\s\+\s", side.strip()):
        t = t.strip()
        if not t:
            continue
        m = _COEFF.match(t)
        if m:
            coeff, formula = int(m.group(1)), m.group(2).strip()
            if not formula:
                raise ParseError(f"Coeficiente sin fórmula: {t!r}")
        else:
            coeff, formula = 1, t
        out.append((parse_species(formula), coeff))
    return out


def parse_equation_with_coeffs(equation: str) -> tuple[Equation, list[int], list[int]]:
    """Ecuación con los coeficientes tal como fueron escritos por el usuario."""
    eq = equation.replace("→", "->").replace("=>", "->").strip()
    if "=" in eq and "==>" not in eq:
        eq = eq.replace("=", "->")
    left, _, right = eq.partition("->")
    if not left.strip() or not right.strip():
        raise ParseError("Falta un lado de la ecuación.")
    rt, pt = _terms(left), _terms(right)
    return Equation([t[0] for t in rt], [t[0] for t in pt]), [c for _, c in rt], [c for _, c in pt]


def verify_given(equation: str) -> dict:
    """Conservación de masa y carga usando los coeficientes ESCRITOS por el usuario."""
    eq, rc, pc = parse_equation_with_coeffs(equation)
    return _verify(eq, rc, pc)


# ---------------------------------------------------------------- solving

def _rref(rows: list[list[Fraction]]) -> tuple[list[list[Fraction]], int, list[int]]:
    """RREF (Reduced Row Echelon Form) en marcha. Devuelve (matriz, rango, columnas pivote)."""
    m = len(rows)
    if m == 0:
        return rows, 0, []
    n = len(rows[0])
    r = 0
    pivots: list[int] = []
    for c in range(n):
        piv = next((i for i in range(r, m) if rows[i][c] != 0), None)
        if piv is None:
            continue
        rows[r], rows[piv] = rows[piv], rows[r]
        scale = rows[r][c]
        rows[r] = [x / scale for x in rows[r]]
        for i in range(m):
            if i != r and rows[i][c] != 0:
                f = rows[i][c]
                rows[i] = [a - f * b for a, b in zip(rows[i], rows[r], strict=True)]
        pivots.append(c)
        r += 1
        if r == m:
            break
    return rows, r, pivots


def _to_fraction_mat(all_species: list[Species], n_reactants: int, rows_keys: list[str]) -> list[list[Fraction]]:
    """Construye la matriz de composición completa: reactivos (+) y productos (-).

    Una fila por elemento/balanza Q y una columna por especie (reactivos primero).
    """
    ncols = len(all_species)
    mat = []
    for key in rows_keys:
        row = [Fraction(0) for _ in range(ncols)]
        for j, spec in enumerate(all_species):
            sign = 1 if j < n_reactants else -1
            if key == "Q":
                row[j] = Fraction(spec.charge if sign > 0 else -spec.charge)
            else:
                row[j] = Fraction(sign * spec.composition.get(key, 0))
        mat.append(row)
    return mat


def _basis(rows: list[list[Fraction]], rank: int, pivots: list[int], ncols: int) -> list[list[Fraction]]:
    """Bases del espacio nulo: una por variable libre."""
    free = [c for c in range(ncols) if c not in pivots]
    basis: list[list[Fraction]] = []
    for f in free:
        vec = [Fraction(0)] * ncols
        vec[f] = Fraction(1)
        for i, p in enumerate(pivots):
            # fila i está en RREF: x[p] = -sum_j rref[i][j]*x[j], j libre
            s = Fraction(0)
            for j in free:
                s += rows[i][j] * vec[j]
            vec[p] = -s
        basis.append(vec)
    return basis


def _integerize(vec: list[Fraction]) -> list[int]:
    """Escala un vector racional a enteros mínimos."""
    denom_lcm = 1
    for v in vec:
        denom_lcm = math.lcm(denom_lcm, v.denominator)
    ints = [v.numerator * (denom_lcm // v.denominator) for v in vec]
    g = 0
    for i in ints:
        g = math.gcd(g, abs(i))
    if g > 1:
        ints = [i // g for i in ints]
    return ints


def _best_positive(basis: list[list[Fraction]], ncols: int) -> list[int]:
    """Busca la combinación entera pequeña cuyos coeficientes sean todos positivos y mínimos."""
    k = len(basis)
    if k == 1:
        vec = _integerize(basis[0])
        if all(x > 0 for x in vec):
            return vec
        # posible signo de la ecuación invertido
        neg = _integerize([-x for x in basis[0]])
        if all(x > 0 for x in neg):
            return neg
        raise BalanceError("La ecuación parece estar invertida o no tiene solución entera.")

    best: list[int] | None = None
    best_key: tuple[int, int] | None = None
    rng = range(-6, 7) if k < 4 else range(-2, 3)
    for combo in product(rng, repeat=k):
        if all(c == 0 for c in combo):
            continue
        vec = [sum(combo[i] * basis[i][j] for i in range(k)) for j in range(ncols)]
        ints = _integerize(vec)
        if not all(x > 0 for x in ints):
            continue
        if max(ints) > MAX_COEFF:
            continue
        key = (sum(ints), max(ints))
        if best_key is None or key < best_key:
            best, best_key = ints, key
    if best is None:
        raise BalanceError("No se encontró una solución entera sencilla (ecuación redundante o colisión).")
    return best


def balance(equation: str) -> dict:
    """Balancea y devuelve coeficientes + ecuación formateada + verificación."""
    eq = parse_equation(equation)
    all_species = eq.reactants + eq.products
    # 'e-' es un portador de carga, no un elemento conservado: se contabiliza en la fila Q
    rows_keys = sorted(
        {el for spec in all_species for el in spec.composition if el != _SPECIAL_ELEMENT}
    )
    if any(spec.charge != 0 for spec in all_species) or any(
        _SPECIAL_ELEMENT in spec.composition for spec in all_species
    ):
        rows_keys.append("Q")

    mat = _to_fraction_mat(all_species, len(eq.reactants), rows_keys)
    rref, rank, pivots = _rref(mat)
    basis = _basis(rref, rank, pivots, len(all_species))
    coeffs = _best_positive(basis, len(all_species))

    n_r = len(eq.reactants)
    reactants = coeffs[:n_r]
    products = coeffs[n_r:]

    verify = _verify(eq, reactants, products)
    formatted = _format(reactants, products, eq)
    return {
        "coefficients": {"reactants": reactants, "products": products},
        "balanced": formatted,
        "input": equation,
        "verified": verify,
        "species": {"reactants": [s.formula for s in eq.reactants], "products": [s.formula for s in eq.products]},
    }


def _verify(eq: Equation, reactants: list[int], products: list[int]) -> dict:
    atoms: dict[str, int] = {}
    charge = 0
    for c, spec in zip(reactants, eq.reactants, strict=True):
        for el, count in spec.composition.items():
            if el == _SPECIAL_ELEMENT:
                continue
            atoms[el] = atoms.get(el, 0) + c * count
        charge += c * spec.charge
    for c, spec in zip(products, eq.products, strict=True):
        for el, count in spec.composition.items():
            if el == _SPECIAL_ELEMENT:
                continue
            atoms[el] = atoms.get(el, 0) - c * count
        charge -= c * spec.charge
    ok = all(v == 0 for v in atoms.values()) and charge == 0
    return {"conserves_mass": ok, "residual_atoms": {k: v for k, v in atoms.items() if v}, "charge": charge}


def conserved(equation: str) -> bool:
    """Verificación externa: ¿se conserva masa (y carga) en la ecuación dada ya balanceada?"""
    r = balance(equation)
    return r["verified"]["conserves_mass"]


def _format(reactants: list[int], products: list[int], eq: Equation) -> str:
    def side(coeffs, species):
        terms = []
        for c, spec in zip(coeffs, species, strict=True):
            head = f"{c} " if c != 1 else ""
            terms.append(f"{head}{spec.formula}")
        return " + ".join(terms)

    return f"{side(reactants, eq.reactants)} -> {side(products, eq.products)}"
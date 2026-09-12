"""Servicio de la tabla periódica interactiva (datos curados del MVP)."""

from __future__ import annotations

from app.data import load_elements

GROUPS = {
    1: "Metales alcalinos",
    2: "Metales alcalinotérreos",
    13: "Grupo del boro (térreos)",
    14: "Grupo del carbono (carbonoideos)",
    15: "Grupo del nitrógeno (pnictógenos)",
    16: "Grupo del oxígeno (calcógenos)",
    17: "Halógenos",
    18: "Gases nobles",
}

BLOCK_COLOR = {
    "s": "#7b9e89",
    "p": "#7a8bb8",
    "d": "#b8855a",
    "f": "#9c7bb0",
}


def family(group: int | None, block: str | None) -> str:
    if group and group in GROUPS:
        return GROUPS[group]
    if block == "d":
        return "Metales de transición"
    if group is None and block == "f":
        return "Lantánidos / Actínidos"
    return "Otros"


def get_elements() -> list[dict]:
    out = []
    for e in load_elements():
        out.append(
            {
                **e,
                "family": family(e["g"], e["b"]),
                "color": BLOCK_COLOR.get(e["b"], "#999"),
            }
        )
    return out


def get_element(z: int) -> dict | None:
    for e in get_elements():
        if e["z"] == z:
            return e
    return None


def neighbors(z: int) -> list[dict]:
    """Vecinos en el mismo periodo (izq/der) y mismo grupo (arriba/abajo)."""
    table = get_elements()
    target = get_element(z)
    if target is None:
        return []
    same_period = [e for e in table if e["p"] == target["p"]]
    idx = next(i for i, e in enumerate(same_period) if e["z"] == z)
    result: list[dict] = []
    for k in (idx - 1, idx + 1):
        if 0 <= k < len(same_period):
            result.append({"relation": "mismo periodo", **same_period[k]})
    if target["g"] is not None:
        for e in table:
            if e["g"] == target["g"] and e["p"] == target["p"] - 1:
                result.append({"relation": "mismo grupo", **e})
            if e["g"] == target["g"] and e["p"] == target["p"] + 1:
                result.append({"relation": "mismo grupo", **e})
    return result


TRENDS = {
    "en": {"en": "Electronegatividad (Pauling)"},
    "m": {"m": "Masa atómica (u)"},
}


def trend_breakpoints(prop: str) -> dict:
    values = [e.get(prop) for e in load_elements() if e.get(prop) is not None]
    lo, hi = min(values), max(values)
    return {"property": prop, "min": lo, "max": hi, "units": "u" if prop == "m" else None}
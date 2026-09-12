"""Acceso a datos curados del MVP (tabla periódica, catálogo de experimentos, banco de balanceo)."""

from __future__ import annotations

import json
from functools import lru_cache
from pathlib import Path

DATA_DIR = Path(__file__).resolve().parents[1] / "data"


@lru_cache
def load_elements() -> list[dict]:
    return json.loads((DATA_DIR / "elements.json").read_text(encoding="utf-8"))


@lru_cache
def load_experiments() -> list[dict]:
    return json.loads((DATA_DIR / "experiments.json").read_text(encoding="utf-8"))


@lru_cache
def load_balanced_pool() -> list[dict]:
    return json.loads((DATA_DIR / "balanced_pool.json").read_text(encoding="utf-8"))


@lru_cache
def element_symbols() -> frozenset[str]:
    return frozenset(e["s"] for e in load_elements())


def element_by_symbol(symbol: str) -> dict | None:
    return next((e for e in load_elements() if e["s"] == symbol), None)
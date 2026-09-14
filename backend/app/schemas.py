"""Contratos Pydantic de la API v1."""

from __future__ import annotations

from pydantic import BaseModel, Field

# ---------------------------------------------------------------- auth

class RegisterIn(BaseModel):
    email: str = Field(min_length=6, max_length=254)
    username: str = Field(min_length=3, max_length=64)
    password: str = Field(min_length=8, max_length=128)


class LoginIn(BaseModel):
    email: str
    password: str


class UserOut(BaseModel):
    id: int
    email: str
    username: str
    role: str
    zone: str


class TokenPair(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in_seconds: int
    user: UserOut


class RefreshIn(BaseModel):
    refresh_token: str


# ---------------------------------------------------------------- académica

class Addition(BaseModel):
    substance: str
    unit: str = Field(pattern="^(mL|g|mol)$")
    value: float = Field(gt=0)
    concentration: float | None = Field(default=None, gt=0)


class SimulateIn(BaseModel):
    additions: list[Addition] = Field(min_length=1, max_length=8)
    equipment: str = "default"


class BalanceIn(BaseModel):
    equation: str = Field(min_length=1, max_length=300)


class CheckIn(BaseModel):
    exercise: str = Field(min_length=1, max_length=300)
    solution: str = Field(min_length=1, max_length=300)


class AtomSpec(BaseModel):
    id: str = Field(min_length=1, max_length=16)
    symbol: str = Field(min_length=1, max_length=2)
    x: float = 0.0
    y: float = 0.0
    charge: int = 0


class BondSpec(BaseModel):
    a: str
    b: str
    order: int = Field(default=1, ge=1, le=3)


class BuildingIn(BaseModel):
    atoms: list[AtomSpec] = Field(min_length=1, max_length=120)
    bonds: list[BondSpec] = Field(default_factory=list)


class MolarMassIn(BaseModel):
    formula: str = Field(min_length=1, max_length=120)


class SolutionPrepIn(BaseModel):
    formula: str = Field(min_length=1, max_length=120)
    molarity: float = Field(gt=0)
    volume_ml: float = Field(gt=0)


class DilutionIn(BaseModel):
    c1: float = Field(gt=0)
    v1_ml: float = Field(gt=0)
    c2: float = Field(gt=0)


class Mol3DIn(BaseModel):
    smiles: str = Field(min_length=1, max_length=200)


# ---------------------------------------------------------------- progreso

class ProgressIn(BaseModel):
    topic: str = Field(min_length=1, max_length=64)
    activity_type: str = Field(min_length=1, max_length=32)
    score: float | None = Field(default=None, ge=0, le=1)
    detail: str = Field(default="", max_length=2000)
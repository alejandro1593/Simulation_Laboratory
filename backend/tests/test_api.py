"""Smoke tests de la API v1 contra el motor (TestClient)."""

import os
import tempfile

import pytest

# DB aislada por corrida antes de tocar la configuración de la app
_fd, _db = tempfile.mkstemp(suffix=".db")
os.close(_fd)
os.environ["DATABASE_URL"] = f"sqlite:///{_db}"

# El paquete tests requiere importar app: usamos conftest para rootdir
pytest.importorskip("httpx")

from fastapi.testclient import TestClient  # noqa: E402

from app.core.db import init_db  # noqa: E402
from app.main import app as _app  # noqa: E402

init_db()

client = TestClient(_app)


def _token() -> str:
    import uuid

    uid = uuid.uuid4().hex[:8]
    r = client.post(
        "/api/v1/auth/register",
        json={"email": f"tutor-{uid}@molcore.dev", "username": f"tutor_{uid}", "password": "quimica123"},
    )
    assert r.status_code == 201, r.text
    return r.json()["access_token"]


def test_health():
    r = client.get("/api/v1/health")
    assert r.status_code == 200
    body = r.json()
    assert body["status"] == "ok"
    assert body["zones"]["academic"] is True


def test_whoami_guest():
    r = client.get("/api/v1/whoami")
    assert r.status_code == 200
    assert r.json()["role"] == "guest"


def test_simulator_catalog_public():
    r = client.get("/api/v1/academic/simulator/catalog")
    assert r.status_code == 200
    assert len(r.json()["experiments"]) >= 15


def test_simulator_catalog_integrity():
    from app.domain import balancer, simulator

    cat = simulator.catalog()
    keys = {s["key"] for s in cat["substances"]}
    assert len(cat["experiments"]) >= 20
    ids = [e["id"] for e in cat["experiments"]]
    assert len(ids) == len(set(ids))

    for exp in cat["experiments"]:
        assert set(exp["reactants"]) <= keys, exp["id"]
        b = balancer.balance(exp["equation_display"])
        assert b["verified"]["conserves_mass"], exp["id"]
        assert b["verified"]["charge"] == 0, exp["id"]
        additions = [
            {"substance": k, "unit": "mol", "value": 1.0} for k in set(exp["reactants"])
        ]
        out = simulator.run_scene(additions, equipment="matraz")
        assert out["verified"]["conserves_mass"], exp["id"]
        assert out["id"] == exp["id"], exp["id"]

    expected_unique = ["exp-gases-mg-hcl", "exp-redox-cu-hno3", "exp-combustion-ch4"]
    present = {exp["id"] for exp in cat["experiments"]}
    assert set(expected_unique) <= present


def test_balance_endpoint():
    r = client.post("/api/v1/academic/balance", json={"equation": "C3H8 + O2 -> CO2 + H2O"})
    assert r.status_code == 200
    assert r.json()["balanced"] == "C3H8 + 5 O2 -> 3 CO2 + 4 H2O"
    assert r.json()["verified"]["conserves_mass"] is True


def test_balance_invalid():
    r = client.post("/api/v1/academic/balance", json={"equation": "sin flecha"})
    assert r.status_code == 422
    assert r.json()["code"] == "ecuacion_invalida"


def test_problem_requires_auth():
    r = client.get("/api/v1/academic/tutor/problem")
    assert r.status_code == 401


def test_auth_flow():
    r = client.post(
        "/api/v1/auth/register",
        json={"email": "alumno@molcore.dev", "username": "alumno", "password": "quimica123"},
    )
    assert r.status_code == 201, r.text
    tokens = r.json()
    access = tokens["access_token"]

    r = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {access}"})
    assert r.status_code == 200
    assert r.json()["role"] == "student"

    r = client.post(
        "/api/v1/auth/login",
        json={"email": "alumno@molcore.dev", "password": "quimica123"},
    )
    assert r.status_code == 200

    r = client.post(
        "/api/v1/academic/simulator/run",
        json={
            "additions": [
                {"substance": "zn", "unit": "g", "value": 1.0},
                {"substance": "hcl", "unit": "mL", "value": 50},
            ]
        },
        headers={"Authorization": f"Bearer {access}"},
    )
    assert r.status_code == 200
    body = r.json()
    assert body["gas_volume_l"] is not None
    assert body["verified"]["conserves_mass"]


def test_calculators():
    r = client.post("/api/v1/academic/calculators/molar-mass", json={"formula": "H2SO4"})
    assert r.status_code == 200
    assert abs(r.json()["molar_mass_g_mol"] - 98.079) < 0.5

    r = client.post(
        "/api/v1/academic/calculators/solution-prep",
        json={"formula": "NaOH", "molarity": 1.0, "volume_ml": 500},
    )
    assert r.status_code == 200
    assert abs(r.json()["mass_to_weigh_g"] - 20.0) < 0.5


def test_oxidation_states():
    esperado = {
        "H2O": {"O": -2, "H": 1},
        "H2O2": {"O": -1, "H": 1},          # peróxido
        "CO2": {"C": 4, "O": -2},
        "CH4": {"C": -4, "H": 1},
        "HNO3": {"H": 1, "N": 5, "O": -2},
        "Cl2O7": {"Cl": 7, "O": -2},
        "Na2SO4": {"Na": 1, "S": 6, "O": -2},
        "NaCl": {"Na": 1, "Cl": -1},
        "Fe2O3": {"Fe": 3, "O": -2},
        "NaH": {"Na": 1, "H": -1},          # hidruro
    }
    for formula, estados in esperado.items():
        r = client.post("/api/v1/academic/calculators/oxidation-states", json={"formula": formula})
        assert r.status_code == 200, formula
        body = r.json()
        assert body["balanced"], formula
        for el, val in estados.items():
            assert body["states"][el] == val, f"{formula}: esperaba {el} {val}, obtuvo {body['states'][el]}"


def test_periodic():
    r = client.get("/api/v1/academic/periodic/elements")
    assert r.status_code == 200
    assert len(r.json()) == 118
    r = client.get("/api/v1/academic/periodic/neighbors/6")
    assert r.status_code == 200
    assert any(n["relation"] == "mismo periodo" and n["s"] == "N" for n in r.json())


def test_builder_validate():
    r = client.post(
        "/api/v1/academic/builder/validate",
        headers={"Authorization": f"Bearer {_token()}"},
        json={
            "atoms": [
                {"id": "A1", "symbol": "O", "x": 0, "y": 0},
                {"id": "A2", "symbol": "H", "x": -1, "y": 0},
                {"id": "A3", "symbol": "H", "x": 1, "y": 0},
            ],
            "bonds": [{"a": "A1", "b": "A2", "order": 1}, {"a": "A1", "b": "A3", "order": 1}],
        },
    )
    assert r.status_code == 200
    assert r.json()["valid"] is True


def test_research_is_sealed():
    r = client.get("/api/v1/research/status")
    assert r.status_code == 401  # sin credenciales researcher
    r = client.post("/api/v1/research/jobs")
    assert r.status_code == 401
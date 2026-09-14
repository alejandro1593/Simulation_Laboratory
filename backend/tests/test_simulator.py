"""Simulador experimental determinista — tests del catálogo curado."""

import pytest

from app.domain import simulator
from app.domain.simulator import SimulationError


def test_catalog_exists():
    cat = simulator.catalog()
    assert len(cat["experiments"]) >= 20
    assert len(cat["substances"]) >= 25


def test_all_experiments_balance_and_run():
    data = __import__("app.data", fromlist=["load_experiments"]).load_experiments()

    def unit_for(entry):
        if entry["state"] == "S":
            return "g"
        if entry["state"] == "G" or not entry.get("concentrations"):
            return "mol"
        return "mL"

    for full in data["experiments"]:
        additions = [
            {"substance": r, "unit": unit_for(next(s for s in data["substances"] if s["key"] == r)), "value": 1.0}
            for r in full["reactants"]
        ]
        res = simulator.run_scene(additions)
        assert res["verified"]["conserves_mass"], full["id"]
        assert res["stoichiometry"]["extent_mol"] > 0, full["id"]
        assert res["scene"]


def test_hcl_naoh_neutral_ph():
    res = simulator.run_scene(
        [{"substance": "hcl", "unit": "mL", "value": 50}, {"substance": "naoh", "unit": "mL", "value": 50}]
    )
    assert res["id"] == "exp-acidobase-hcl-naoh"
    assert res["ph_estimate"] == 7.0
    assert res["temperature_delta_c"] > 0  # exotérmica: la disolución sube de temperatura


def test_zn_hcl_gas_volume_scales_with_extent():
    a = simulator.run_scene([{"substance": "zn", "unit": "g", "value": 1.307}, {"substance": "hcl", "unit": "mL", "value": 400, "concentration": 1.0}])
    assert a["gas_volume_l"] is not None
    assert a["equation_balanced"] == "Zn + 2 HCl -> ZnCl2 + H2" or a["equation"] == "Zn + 2 HCl -> ZnCl2 + H2"
    assert a["stoichiometry"]["limiting_reagent"] == "Zinc (granalla)"
    assert round(a["gas_volume_l"] or 0, 3) > 0


def test_precipitation_yellow():
    res = simulator.run_scene(
        [{"substance": "pbno32", "unit": "mL", "value": 20}, {"substance": "ki", "unit": "mL", "value": 40}]
    )
    assert any(ev["action"] == "precipitate" and ev.get("colorHex") == "#f5c542" for ev in res["scene"])


def test_unknown_substance_rejected():
    with pytest.raises(SimulationError):
        simulator.run_scene([{"substance": "kryptonita", "unit": "g", "value": 1}])

def test_unavailable_reaction_rejected():
    with pytest.raises(SimulationError):
        simulator.run_scene([{"substance": "fe", "unit": "g", "value": 2}])


def test_deterministic():
    args = [{"substance": "hcl", "unit": "mL", "value": 50}, {"substance": "naoh", "unit": "mL", "value": 50}]
    assert simulator.run_scene(args) == simulator.run_scene(args)


def test_evolution_curve_is_consistent_with_excess_limited_stoic():
    res = simulator.run_scene(
        [{"substance": "zn", "unit": "g", "value": 1.307}, {"substance": "hcl", "unit": "mL", "value": 400, "concentration": 1.0}]
    )
    evo = res["evolution"]
    points = evo["points"]
    assert len(points) == 25
    assert points[0]["xi"] == 0.0
    assert round(points[-1]["xi"], 6) == round(res["stoichiometry"]["extent_mol"], 6)

    zn = next(s for s in evo["species"] if s["formula"] == "Zn")
    h2 = next(s for s in evo["species"] if s["formula"] == "H2")
    assert zn["role"] == "reactivo" and h2["role"] == "producto"

    assert points[0]["moles"]["Zn"] == zn["initial_mol"]
    assert points[-1]["moles"]["Zn"] <= 1e-9  # Zn es el limitante en este experimento
    assert points[0]["moles"]["H2"] == 0.0
    assert points[-1]["moles"]["H2"] == h2["coeff"] * res["stoichiometry"]["extent_mol"]

    # volumen de gas estrictamente creciente y consistente con moles(H2) * molar
    vols = [p["gas_volume_l"] for p in points]
    assert vols == sorted(vols)
    assert round(vols[-1], 3) == res["gas_volume_l"]


def test_evolution_curve_is_deterministic():
    args = [{"substance": "hcl", "unit": "mL", "value": 50}, {"substance": "naoh", "unit": "mL", "value": 50}]
    assert simulator.run_scene(args)["evolution"] == simulator.run_scene(args)["evolution"]
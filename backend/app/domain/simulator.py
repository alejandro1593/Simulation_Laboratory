"""Motor experimental determinista (Zona Académica).

Toda la química vive aquí, en el backend. El frontend solo reproduce la
secuencia de eventos que devuelve este motor: no se calcula ni se inventa
nada en el cliente. Los resultados son deterministas (sin random), cada
experimento está balanceado y verificado por el kernel de balanceo.
"""

from __future__ import annotations

import math

from app.data import load_experiments
from app.domain.balancer import ParseError, balance, parse_equation

GAS_MOLAR_VOLUME_L = 24.465  # L a 25 °C y 1 atm
WATER_CP_J_PER_G_K = 4.186


class SimulationError(Exception):
    """Receta imposible o catálogo inválido."""


def _default_concentration(entry: dict) -> float | None:
    concs = entry.get("concentrations") or []
    if not concs:
        return None
    return 1.0 if 1.0 in concs else concs[-1]


def _moles_for(entry: dict, addition: dict) -> float:
    unit = addition.get("unit")
    value = addition.get("value")
    if addition.get("substance") == "h2o":
        return 0.0
    if unit == "mol":
        return float(value)
    if unit == "g":
        if not entry.get("molar_mass"):
            raise SimulationError(f"No hay masa molar para {entry['key']}.")
        return float(value) / entry["molar_mass"]
    if unit == "mL":
        conc = addition.get("concentration") or _default_concentration(entry)
        if conc is None:
            raise SimulationError(f"{entry['key']} no admite volumen sin concentración.")
        return conc * float(value) / 1000.0
    raise SimulationError(f"Unidad '{unit}' no soportada.")


def _catalog() -> dict[str, dict]:
    return {s["key"]: s for s in load_experiments()["substances"]}


def _find_experiment(keys: list[str], exp_db: list[dict]) -> tuple[dict, list[str]]:
    """Empareja el conjunto de sustancias con experimentos del catálogo."""
    key_set = {k for k in keys if k != "h2o"}
    exact = [e for e in exp_db if set(e["reactants"]) == key_set]
    if exact:
        return exact[0], []
    subsets = [e for e in exp_db if key_set <= set(e["reactants"])]
    if subsets:
        subsets.sort(key=lambda e: len(e["reactants"]))
        return subsets[0], list(set(subsets[0]["reactants"]) - key_set)
    raise SimulationError("No existe un experimento en el catálogo con esas sustancias.")


def _formula_keys(species) -> str:  # helper: formula canónica de la especie
    return species.formula


def run_scene(additions: list[dict], equipment: str = "default") -> dict:
    """Ejecuta un experimento. Un addition: {substance, unit, value, concentration?}."""
    if not additions:
        raise SimulationError("La receta no tiene sustancias.")
    catalog = _catalog()
    exp_db = load_experiments()["experiments"]

    # 1) Validar sustancias
    for a in additions:
        if a["substance"] not in catalog:
            raise SimulationError(f"Sustancia desconocida: {a['substance']}.")

    # 2) Emparejar experimento
    keys = [a["substance"] for a in additions]
    exp, missing = _find_experiment(keys, exp_db)
    if missing:
        raise SimulationError(
            f"El experimento '{exp['titleEs']}' necesita además: {', '.join(missing)}."
        )

    # 3) Balancear la ecuación (kernel)
    try:
        parsed = parse_equation(exp["equation"])
        balanced = balance(exp["equation"])
    except ParseError as exc:
        raise SimulationError(f"La ecuación del catálogo es inválida: {exc}") from exc
    if not balanced["verified"]["conserves_mass"]:
        raise SimulationError("El catálogo contiene una ecuación no balanceada.")

    rcoef = {spec.formula: c for c, spec in zip(balanced["coefficients"]["reactants"], parsed.reactants, strict=True)}
    pcoef = {spec.formula: c for c, spec in zip(balanced["coefficients"]["products"], parsed.products, strict=True)}

    # 4) Moles de cada reactivo (suma si se repite)
    moles_in: dict[str, float] = {}
    for a in additions:
        entry = catalog[a["substance"]]
        mol = _moles_for(entry, a)
        moles_in[a["substance"]] = moles_in.get(a["substance"], 0.0) + mol

    # 5) Mapeo key -> fórmula del reactivo (los no mapeados y listados en el
    #    experimento son catalizadores/medios: se enumeran pero no se consumen)
    key_formula = {}
    for spec in parsed.reactants:
        for entry in exp["reactants"]:
            if catalog[entry].get("formula") == spec.formula:
                key_formula[entry] = spec.formula
    catalyst_keys = [k for k in exp["reactants"] if k not in key_formula]
    for a in additions:
        k = a["substance"]
        if k == "h2o" or k in catalyst_keys:
            continue
        if k not in key_formula:
            raise SimulationError(f"No se pudo mapear {k} a la ecuación.")

    # 6) Reactivo limitante y moles de productos
    ratios: dict[str, float] = {}
    for a in additions:
        k = a["substance"]
        if k == "h2o" or k not in key_formula:
            continue
        coef = rcoef[key_formula[k]]
        ratios[k] = moles_in[k] / coef if coef else float("inf")
    limiting_key = min(ratios, key=ratios.get)
    extent = ratios[limiting_key]
    product_moles = {formula: extent * c for formula, c in pcoef.items()}

    # 7) Volumen de gas (si lo hay)
    gas = exp.get("gas")
    gas_volume_l = None
    if gas:
        gas_moles = next((m for f, m in product_moles.items() if f == gas), 0.0)
        gas_volume_l = round(gas_moles * GAS_MOLAR_VOLUME_L, 3)

    # 8) Cambio de temperatura estimado (solo información didáctica)
    total_volume_ml = sum(a["value"] for a in additions if a["unit"] == "mL")
    dT_c = None
    dH = exp.get("dH_reference_kj_per_mol")
    if dH is not None and total_volume_ml:
        q_j = -dH * extent * 1000.0
        mass_g = 1.0 * total_volume_ml  # agua ≈ 1 g/mL
        dT_c = round(q_j / (mass_g * WATER_CP_J_PER_G_K), 2)

    # 8b) Curva de evolución determinista: moles de cada especie vs avance ξ.
    #      Es la estequiometría exacta del kernel: ningún dato inventado.
    reactant_init: dict[str, float] = {}
    for k, f in key_formula.items():
        reactant_init[f] = reactant_init.get(f, 0.0) + moles_in.get(k, 0.0)
    evo_species: list[dict] = [
        {"formula": f, "role": "reactivo", "coeff": c, "initial_mol": round(reactant_init.get(f, 0.0), 6)}
        for f, c in rcoef.items()
    ] + [
        {"formula": f, "role": "producto", "coeff": c, "initial_mol": 0.0}
        for f, c in pcoef.items()
    ]
    gas_coef = pcoef.get(gas, 0.0) if gas else 0.0
    n_points = 24
    evo_points: list[dict] = []
    for i in range(n_points + 1):
        xi = extent * i / n_points
        moles = {
            f: max(0.0, reactant_init.get(f, 0.0) - c * xi) for f, c in rcoef.items()
        }
        moles.update({f: max(0.0, c * xi) for f, c in pcoef.items()})
        pt: dict = {"xi": round(xi, 6), "moles": {f: round(m, 6) for f, m in moles.items()}}
        if gas:
            pt["gas_volume_l"] = round(gas_coef * xi * GAS_MOLAR_VOLUME_L, 3)
        if dH is not None and total_volume_ml:
            pt["dT_c"] = round(-dH * xi * 1000.0 / (mass_g * WATER_CP_J_PER_G_K), 2)
        evo_points.append(pt)
    evolution = {
        "x_label": "Grado de avance ξ (mol)",
        "extent_mol": round(extent, 6),
        "species": evo_species,
        "points": evo_points,
    }

    # 9) pH estimado (solo ácidos/bases fuertes)
    ph = None
    acid_keys = [a["substance"] for a in additions if catalog[a["substance"]].get("strong") == "acid"]
    base_keys = [a["substance"] for a in additions if catalog[a["substance"]].get("strong") == "base"]
    if total_volume_ml and acid_keys and base_keys:
        h_mol = sum(
            moles_in[a["substance"]] * catalog[a["substance"]].get("substance_protons", 1)
            for a in additions if a["substance"] in acid_keys
        )
        oh_mol = sum(
            moles_in[a["substance"]]
            for a in additions if a["substance"] in base_keys
        )
        if abs(h_mol - oh_mol) < 1e-9:
            ph = 7.0
        else:
            excess = abs(h_mol - oh_mol) / (total_volume_ml / 1000.0)
            ph = round(-math.log10(excess), 2) if h_mol > oh_mol else round(14 + math.log10(excess), 2)
            ph = min(14.0, max(0.0, ph))

    # 10) Escena determinista: eventos de la receta + efectos
    scene: list[dict] = [{"t": 0.0, "action": "equipment", "equipment": equipment, "volume_ml": total_volume_ml}]
    for a in additions:
        entry = catalog[a["substance"]]
        scene.append(
            {
                "t": 1.0 + len(scene) * 0.4,
                "action": "add" if entry["state"] == "S" else "pour",
                "substance": entry["key"],
                "label": entry["nameEs"],
                "formula": entry["formula"],
                "volume_ml": a["value"] if a["unit"] == "mL" else None,
                "mass_g": a["value"] if a["unit"] == "g" else None,
                "moles": round(moles_in.get(entry["key"], 0.0), 6),
                "color": entry.get("color"),
            }
        )
    for eff in exp.get("effects", []):
        ev: dict = {"t": round(2.0 + len(scene) * 0.4, 2), "action": eff["type"],
                    "note": eff.get("note", "")}
        if eff["type"] == "gas":
            ev["species"] = eff.get("species")
            ev["volume_ml"] = round(gas_volume_l * 1000, 1) if gas_volume_l else None
        if eff["type"] == "precipitate":
            ev["colorHex"] = eff.get("colorHex")
        if eff["type"] == "ph_change":
            ev["target"] = eff.get("target")
            ev["ph_estimate"] = ph
        if eff["type"] == "exothermic":
            ev["dT_estimate"] = dT_c
        scene.append(ev)

    equation_display = " + ".join(balanced["species"]["reactants"]) + " -> " + " + ".join(
        balanced["species"]["products"]
    )

    return {
        "id": exp["id"],
        "title": exp["titleEs"],
        "level": exp["level"],
        "topic": exp["topic"],
        "equation": equation_display,
        "equation_balanced": balanced["balanced"],
        "verified": balanced["verified"],
        "stoichiometry": {
            "limiting_reagent": catalog[limiting_key]["nameEs"],
            "extent_mol": round(extent, 6),
            "reactants_mol": {catalog[k]["nameEs"]: round(v, 6) for k, v in moles_in.items()},
            "products_mol": {f: round(m, 6) for f, m in product_moles.items()},
            "catalysts": [catalog[k]["nameEs"] for k in catalyst_keys],
        },
        "evolution": evolution,
        "gas_volume_l": gas_volume_l,
        "temperature_delta_c": dT_c,
        "ph_estimate": ph,
        "scene": scene,
        "explanation": exp["explanation"],
        "safety": exp["safety"],
        "snapshot": load_experiments()["snapshot"],
        "engine": "molcore-sim-v1",
        "deterministic": True,
        "simulated": True,
    }


def catalog() -> dict:
    data = load_experiments()
    return {
        "snapshot": data["snapshot"],
        "substances": data["substances"],
        "experiments": [
            {
                "id": e["id"],
                "titleEs": e["titleEs"],
                "level": e["level"],
                "topic": e["topic"],
                "reactants": e["reactants"],
                "equation_display": e["equation"],
            }
            for e in data["experiments"]
        ],
    }
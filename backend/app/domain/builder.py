"""Constructor de moléculas: reglas de valencia asistidas (feedback por átomo).

V1: validación estructural pura (grados de enlace y cargas). La generación 3D se
delega a RDKit cuando esté disponible (opcional, degradación elegante).
"""

from __future__ import annotations

import math

# Valencia típica de elementos de uso escolar/universitario (v1)
VALENCES: dict[str, tuple[int, ...]] = {
    "H": (1,), "Li": (1,), "Na": (1,), "K": (1,), "F": (1,), "Cl": (1,),
    "Br": (1,), "I": (1,),
    "Be": (2,), "Mg": (2,), "Ca": (2,), "Zn": (2,), "O": (2,), "S": (2,),
    "B": (3,), "Al": (3,), "N": (3,), "P": (3,),
    "C": (4,), "Si": (4,),
    "Cu": (1, 2), "Fe": (2, 3), "Cr": (3, 6),
}

# Carga formal sobre átomo → valencia efectiva permitida
_CHARGE_ADJUST = {"+": -1, "-": +1}  # e.g. N+ permite 4 enlaces


class Building:
    def __init__(self, atoms: list[dict], bonds: list[dict]) -> None:
        self.atoms = atoms
        self.bonds = bonds

    def validate(self) -> dict:
        """Valida valencia, cargas y conectividad. Devuelve mensajes por átomo."""
        issues: list[dict] = []
        by_id = {a["id"]: a for a in self.atoms}
        bond_sum: dict[str, int] = {a["id"]: 0 for a in self.atoms}
        errors = 0

        for bond in self.bonds:
            a, b = bond.get("a"), bond.get("b")
            order = bond.get("order", 1)
            if a not in by_id or b not in by_id:
                continue
            if a == b:
                issues.append({"kind": "self_bond", "atom": a, "msg": "Un átomo no puede enlazarse consigo mismo."})
                errors += 1
                continue
            bond_sum[a] += order
            bond_sum[b] += order

        for atom in self.atoms:
            aid = atom["id"]
            sym = atom.get("symbol", "?")
            charge = atom.get("charge", 0)
            valences = VALENCES.get(sym)
            if valences is None:
                issues.append({"kind": "unknown", "atom": aid, "msg": f"No hay reglas de valencia para {sym}."})
                errors += 1
                continue
            total = bond_sum[aid]
            effective = [v + (charge if charge > 0 else -charge) for v in valences]
            if total not in effective:
                expected = " o ".join(str(v) for v in effective)
                issues.append(
                    {
                        "kind": "valence",
                        "atom": aid,
                        "symbol": sym,
                        "bonds": total,
                        "allowed": expected,
                        "msg": f"{sym} tiene {total} enlace(s); necesita {expected}.",
                    }
                )
                errors += 1
            elif total == 0:
                issues.append(
                    {"kind": "isolated", "atom": aid, "symbol": sym, "msg": f"{sym} está aislado: conéctalo."}
                )

        total_charge = sum(a.get("charge", 0) for a in self.atoms)
        msg = ""
        if errors == 0 and total_charge == 0:
            msg = "La molécula respeta las reglas de valencia y es neutra."
        elif errors == 0:
            msg = f"Valencia correcta, pero carga formal neta {total_charge:+d} (debe ser 0 o indicar ion)."
        return {
            "valid": errors == 0,
            "errors": errors,
            "total_charge": total_charge,
            "issues": issues,
            "message": msg,
            "bond_order_by_atom": bond_sum,
        }


PRESETS: dict[str, dict] = {
    "agua": {
        "atoms": [
            {"id": "A1", "symbol": "O", "x": 0, "y": 0},
            {"id": "A2", "symbol": "H", "x": -1, "y": -0.7},
            {"id": "A3", "symbol": "H", "x": 1, "y": -0.7},
        ],
        "bonds": [{"a": "A1", "b": "A2", "order": 1}, {"a": "A1", "b": "A3", "order": 1}],
        "notes": "Geometría angular (~104.5°): el oxígeno tiene 2 pares libres.",
    },
    "dioxido_carbono": {
        "atoms": [
            {"id": "A1", "symbol": "C", "x": 0, "y": 0},
            {"id": "A2", "symbol": "O", "x": -1.3, "y": 0},
            {"id": "A3", "symbol": "O", "x": 1.3, "y": 0},
        ],
        "bonds": [{"a": "A1", "b": "A2", "order": 2}, {"a": "A1", "b": "A3", "order": 2}],
        "notes": "Molécula lineal, dobles enlaces C=O.",
    },
    "metano": {
        "atoms": [
            {"id": "A1", "symbol": "C", "x": 0, "y": 0},
            {"id": "A2", "symbol": "H", "x": 1, "y": 0.7},
            {"id": "A3", "symbol": "H", "x": 0, "y": 1.15},
            {"id": "A4", "symbol": "H", "x": -1, "y": 0.7},
            {"id": "A5", "symbol": "H", "x": 0, "y": -0.7},
        ],
        "bonds": [{"a": "A1", "b": a, "order": 1} for a in ["A2", "A3", "A4", "A5"]],
        "notes": "Tetraédrica: el carbono forma 4 enlaces simples.",
    },
    "amoniaco": {
        "atoms": [
            {"id": "A1", "symbol": "N", "x": 0, "y": 0.4},
            {"id": "A2", "symbol": "H", "x": -1, "y": -0.3},
            {"id": "A3", "symbol": "H", "x": 1, "y": -0.3},
            {"id": "A4", "symbol": "H", "x": 0, "y": -1.0},
        ],
        "bonds": [{"a": "A1", "b": a, "order": 1} for a in ["A2", "A3", "A4"]],
        "notes": "Pirámide trigonal con un par libre en el nitrógeno.",
    },
    "benceno": {
        "atoms": [
            {"id": f"C{i}", "symbol": "C", "x": round(1.3 * math.cos(math.radians(90 + i * 60)), 2), "y": round(1.3 * math.sin(math.radians(90 + i * 60)), 2)}
            for i in range(6)
        ]
        + [
            {"id": f"H{i}", "symbol": "H", "x": round(1.9 * math.cos(math.radians(90 + i * 60)), 2), "y": round(1.9 * math.sin(math.radians(90 + i * 60)), 2)}
            for i in range(6)
        ],
        "bonds": [
            {"a": f"C{i}", "b": f"C{(i + 1) % 6}", "order": 2 if i % 2 == 0 else 1}
            for i in range(6)
        ]
        + [{"a": f"C{i}", "b": f"H{i}", "order": 1} for i in range(6)],
        "notes": "Hexágono con dobles enlaces alternados (resonancia del anillo aromático).",
    },
    "etanol": {
        "atoms": [
            {"id": "C1", "symbol": "C", "x": -1, "y": 0},
            {"id": "C2", "symbol": "C", "x": 0, "y": 0},
            {"id": "O", "symbol": "O", "x": 1, "y": 0},
            {"id": "H1", "symbol": "H", "x": -1.8, "y": 0},
            {"id": "H2", "symbol": "H", "x": -1, "y": 0.8},
            {"id": "H3", "symbol": "H", "x": -1, "y": -0.8},
            {"id": "H4", "symbol": "H", "x": 0, "y": 0.8},
            {"id": "H5", "symbol": "H", "x": 0, "y": -0.8},
            {"id": "H6", "symbol": "H", "x": 1.8, "y": 0},
        ],
        "bonds": (
            [{"a": "C1", "b": c, "order": 1} for c in ["H1", "H2", "H3"]]
            + [{"a": "C2", "b": c, "order": 1} for c in ["H4", "H5"]]
            + [
                {"a": "C1", "b": "C2", "order": 1},
                {"a": "C2", "b": "O", "order": 1},
                {"a": "O", "b": "H6", "order": 1},
            ]
        ),
        "notes": "El alcohol: el oxígeno e hidroxilo (OH) es clave en su reactividad.",
    },
}


def presets() -> dict:
    return {name: {"name": name, "atoms": p["atoms"], "bonds": p["bonds"], "notes": p.get("notes", "")} for name, p in PRESETS.items()}


def mol3d(smiles: str) -> dict | None:
    """Genera coordenadas 3D con RDKit (opcional). Devuelve None si RDKit no está."""
    try:
        from rdkit import Chem
        from rdkit.Chem import AllChem
    except ImportError:
        return None
    mol = Chem.MolFromSmiles(smiles)
    if mol is None:
        raise ValueError("SMILES no válido para RDKit.")
    mol = Chem.AddHs(mol)
    if AllChem.EmbedMolecule(mol, randomSeed=0xF00D) != 0:
        AllChem.EmbedMolecule(mol, AllChem.ETKDGv3())
    AllChem.MMFFOptimizeMolecule(mol)
    conf = mol.GetConformer()
    return {
        "atoms": [{"symbol": a.GetSymbol(), "x": conf.GetAtomPosition(i).x, "y": conf.GetAtomPosition(i).y, "z": conf.GetAtomPosition(i).z} for i, a in enumerate(mol.GetAtoms())],
        "bonds": [{"a": b.GetBeginAtomIdx(), "b": b.GetEndAtomIdx(), "order": b.GetBondTypeAsDouble()} for b in mol.GetBonds()],
        "smiles": smiles,
        "engine": "rdkit-etkdg",
    }
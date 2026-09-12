import pytest

from app.domain.balancer import BalanceError, ParseError, balance, parse_species


def _coeffs(eq: str) -> tuple[list[int], list[int]]:
    r = balance(eq)
    return r["coefficients"]["reactants"], r["coefficients"]["products"]


GOLDENS = [
    ("C3H8 + O2 -> CO2 + H2O", ([1, 5], [3, 4])),
    ("CH4 + O2 -> CO2 + H2O", ([1, 2], [1, 2])),
    ("C2H5OH + O2 -> CO2 + H2O", ([1, 3], [2, 3])),
    ("C6H12O6 + O2 -> CO2 + H2O", ([1, 6], [6, 6])),
    ("H2 + O2 -> H2O", ([2, 1], [2])),
    ("Na + Cl2 -> NaCl", ([2, 1], [2])),
    ("Fe + O2 -> Fe2O3", ([4, 3], [2])),
    ("Al + O2 -> Al2O3", ([4, 3], [2])),
    ("N2 + H2 -> NH3", ([1, 3], [2])),
    ("P4 + O2 -> P4O10", ([1, 5], [1])),
    ("H2 + Cl2 -> HCl", ([1, 1], [2])),
    ("CaCO3 -> CaO + CO2", ([1], [1, 1])),
    ("H2O2 -> H2O + O2", ([2], [2, 1])),
    ("KClO3 -> KCl + O2", ([2], [2, 3])),
    ("CaCO3 + HCl -> CaCl2 + CO2 + H2O", ([1, 2], [1, 1, 1])),
    ("Na2CO3 + HCl -> NaCl + CO2 + H2O", ([1, 2], [2, 1, 1])),
    ("NaHCO3 + H2SO4 -> Na2SO4 + CO2 + H2O", ([2, 1], [1, 2, 2])),
    ("AgNO3 + NaCl -> AgCl + NaNO3", ([1, 1], [1, 1])),
    ("BaCl2 + Na2SO4 -> BaSO4 + NaCl", ([1, 1], [1, 2])),
    ("NaOH + H2SO4 -> Na2SO4 + H2O", ([2, 1], [1, 2])),
    ("HCl + NaOH -> NaCl + H2O", ([1, 1], [1, 1])),
    ("NH3 + HCl -> NH4Cl", ([1, 1], [1])),
    ("Cu + AgNO3 -> Cu(NO3)2 + Ag", ([1, 2], [1, 2])),
    ("Zn + HCl -> ZnCl2 + H2", ([1, 2], [1, 1])),
    ("Al + HCl -> AlCl3 + H2", ([2, 6], [2, 3])),
    ("KMnO4 + HCl -> KCl + MnCl2 + Cl2 + H2O", ([2, 16], [2, 2, 5, 8])),
    ("Cl2 + KOH -> KCl + KClO3 + H2O", ([3, 6], [5, 1, 3])),
]


@pytest.mark.parametrize("equation,expected", GOLDENS)
def test_golden_equations(equation, expected):
    r, p = _coeffs(equation)
    assert (r, p) == expected, f"{equation}: esperado {expected}, obtenido ({r},{p})"
    assert balance(equation)["verified"]["conserves_mass"]


def test_polyatomic_and_salts():
    assert _coeffs("Ca(OH)2 + H2SO4 -> CaSO4 + H2O") == ([1, 1], [1, 2])
    assert _coeffs("(NH4)2CO3 -> NH3 + CO2 + H2O") == ([1], [2, 1, 1])
    assert _coeffs("Al2(SO4)3 + NaOH -> Al(OH)3 + Na2SO4") == ([1, 6], [2, 3])


def test_ionic_redox_conserves_charge():
    r = balance("Cr2O7(2-) + Fe(2+) + H(+) -> Cr(3+) + Fe(3+) + H2O")
    assert r["coefficients"]["reactants"] == [1, 6, 14]
    assert r["coefficients"]["products"] == [2, 6, 7]
    assert r["verified"]["charge"] == 0


def test_electron_species():
    r = balance("Fe(3+) + e- -> Fe(2+)")
    assert r["coefficients"]["reactants"] == [1, 1]
    assert r["coefficients"]["products"] == [1]
    assert r["verified"]["charge"] == 0


def test_parse_species_examples():
    assert parse_species("Ca(OH)2").composition == {"Ca": 1, "O": 2, "H": 2}
    assert parse_species("NO3-").charge == -1
    assert parse_species("NO3-").composition == {"N": 1, "O": 3}
    assert parse_species("Fe^2+").charge == 2
    assert parse_species("Fe(2+)").charge == 2
    assert parse_species("(NH4)2CO3").composition == {"N": 2, "H": 8, "C": 1, "O": 3}
    assert parse_species("Cr2O7(2-)").charge == -2


def test_invalid_inputs():
    with pytest.raises(ParseError):
        balance("No hay flecha")
    with pytest.raises(ParseError):
        balance("Xx + O2 -> XxO")
    with pytest.raises((ParseError, BalanceError)):
        balance("H2 + O2 -> H2O + Na")  # Na solo aparece en un lado: no balanceable
    with pytest.raises(ParseError):
        parse_species("H(")


def test_random_generated_balanced():
    from app.data import load_balanced_pool

    for entry in load_balanced_pool():
        r = balance(entry["input"])
        assert r["verified"]["conserves_mass"], entry["input"]


def test_format_string():
    r = balance("H2 + O2 -> H2O")
    assert r["balanced"] == "2 H2 + O2 -> 2 H2O"
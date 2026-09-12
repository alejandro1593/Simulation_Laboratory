import pytest

from app.domain import tutor
from app.domain.tutor import PracticeError


def test_balance_with_steps_solution():
    r = tutor.balance_with_steps("C3H8 + O2 -> CO2 + H2O")
    assert r["balanced"] == "C3H8 + 5 O2 -> 3 CO2 + 4 H2O"
    assert r["verified"]["conserves_mass"]
    elements = [s["element"] for s in r["steps"]]
    assert {"C", "H", "O"} <= set(elements)
    assert all(s["initial_balanced"] in (True, False) for s in r["steps"])


def test_balance_with_steps_charge_order_last():
    r = tutor.balance_with_steps("Cr2O7(2-) + Fe(2+) + H(+) -> Cr(3+) + Fe(3+) + H2O")
    assert r["verified"]["charge"] == 0
    assert r["steps"][-1]["element"] == "H"


def test_check_solution_correct():
    ok = tutor.check_solution("H2 + O2 -> H2O", "2 H2 + O2 -> 2 H2O")
    assert ok["correct"] is True


def test_check_solution_wrong():
    ok = tutor.check_solution("H2 + O2 -> H2O", "H2 + O2 -> H2O")
    assert ok["correct"] is False


def test_check_solution_invalid():
    ok = tutor.check_solution("H2 + O2 -> H2O", "esto no es quimica")
    assert ok["correct"] is False


def test_generate_problem_hides_solution():
    p = tutor.generate_problem(topic="redox", difficulty=3)
    assert p["input"]
    assert "output" not in p
    from app.data import load_balanced_pool

    entry = next(x for x in load_balanced_pool() if x["input"] == p["input"])
    assert entry["output"]  # la solución existe en el banco pero no se expone


def test_generate_problem_no_match():
    with pytest.raises(PracticeError):
        tutor.generate_problem(topic="nuclear", difficulty=5)


def test_practice_pool_all_balanceable_and_checkable():
    from app.data import load_balanced_pool

    for entry in load_balanced_pool():
        ok = tutor.check_solution(entry["input"], entry["output"])
        assert ok["correct"], entry["input"]
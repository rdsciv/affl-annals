"""
Tests for non-PPR scoring calculation, opportunity formulas, and PAR metrics.
"""

import pytest
from pipeline.metrics import (
    calc_non_ppr_points,
    calc_wopr,
    calc_expected_fp,
    calc_custody_par,
    calc_draft_par
)

def test_standard_non_ppr_scoring():
    # Test Passing: 300 yds (12.0), 3 TD (12.0), 1 INT (-2.0) = 22.0
    pts_qb = calc_non_ppr_points(pass_yds=300, pass_td=3, pass_int=1)
    assert pts_qb == 22.0

    # Test Rushing + Receiving (0 PPR): 100 rush yds (10.0), 2 rush TD (12.0), 5 rec (0.0), 50 rec yds (5.0), 1 rec TD (6.0) = 33.0
    pts_rb = calc_non_ppr_points(rush_yds=100, rush_td=2, rec_yds=50, rec_td=1)
    assert pts_rb == 33.0

def test_wopr_formula():
    # 20% target share + 30% air yards share -> 1.5*(0.2) + 0.7*(0.3) = 0.3 + 0.21 = 0.51
    wopr = calc_wopr(0.20, 0.30)
    assert wopr == 0.51

def test_par_baselines():
    # 20 points for RB in 1 week (baseline 7.5) -> PAR = +12.5
    par_rb = calc_custody_par(20.0, 1, "RB")
    assert par_rb == 12.5

    # 150 points for QB in 10 weeks (baseline 14.2*10 = 142.0) -> PAR = +8.0
    par_qb = calc_custody_par(150.0, 10, "QB")
    assert par_qb == 8.0

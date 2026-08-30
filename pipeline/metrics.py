"""
AFFL Savant Analytical Metrics & Provenance Engine.
Implements standard non-PPR fantasy scoring, xFP, FPOE, WOPR, PAR, and Trade Alpha.
"""

from typing import Dict, Any, Optional

# Standard Non-PPR Scoring Weights (0 PPR)
SCORING_WEIGHTS = {
    "pass_yds": 0.04,      # 1 pt per 25 yds
    "pass_td": 4.0,        # 4 pts per pass TD
    "pass_int": -2.0,      # -2 pts per INT
    "rush_yds": 0.10,      # 1 pt per 10 yds
    "rush_td": 6.0,        # 6 pts per rush TD
    "rec_yds": 0.10,       # 1 pt per 10 yds
    "rec_td": 6.0,         # 6 pts per rec TD
    "receptions": 0.0,     # Standard 0 PPR
    "two_point_conv": 2.0, # 2 pts
    "fumble_lost": -2.0,   # -2 pts
}

# Positional Weekly Replacement Baselines (Standard Non-PPR 12-team league)
REPLACEMENT_BASELINES = {
    "QB": 14.2,
    "RB": 7.5,
    "WR": 6.8,
    "TE": 4.5,
    "K": 6.5,
    "D/ST": 5.5,
    "FLEX": 6.5,
    "UNKNOWN": 5.0,
}

def calc_non_ppr_points(
    pass_yds: float = 0,
    pass_td: float = 0,
    pass_int: float = 0,
    rush_yds: float = 0,
    rush_td: float = 0,
    rec_yds: float = 0,
    rec_td: float = 0,
    two_point_conv: float = 0,
    fumble_lost: float = 0
) -> float:
    return (
        pass_yds * SCORING_WEIGHTS["pass_yds"] +
        pass_td * SCORING_WEIGHTS["pass_td"] +
        pass_int * SCORING_WEIGHTS["pass_int"] +
        rush_yds * SCORING_WEIGHTS["rush_yds"] +
        rush_td * SCORING_WEIGHTS["rush_td"] +
        rec_yds * SCORING_WEIGHTS["rec_yds"] +
        rec_td * SCORING_WEIGHTS["rec_td"] +
        two_point_conv * SCORING_WEIGHTS["two_point_conv"] +
        fumble_lost * SCORING_WEIGHTS["fumble_lost"]
    )

def calc_wopr(target_share: float, air_yards_share: float) -> float:
    """Weighted Opportunity Rating (WOPR) = 1.5 * Target Share + 0.7 * Air Yards Share"""
    ts = max(0.0, min(1.0, float(target_share or 0)))
    ays = max(0.0, min(1.0, float(air_yards_share or 0)))
    return round(1.5 * ts + 0.7 * ays, 3)

def calc_expected_fp(
    position: str,
    pass_att: float = 0,
    rush_att: float = 0,
    targets: float = 0,
    red_zone_opps: float = 0,
    goal_to_go_opps: float = 0,
    air_yards: float = 0
) -> float:
    """
    Standard Non-PPR xFP Opportunity Model.
    Approximates expected standard fantasy points based on workload and context.
    """
    pos = (position or "").upper()
    xfp = 0.0
    if pos == "QB":
        xfp = (pass_att * 0.35) + (rush_att * 0.55) + (red_zone_opps * 0.8) + (goal_to_go_opps * 1.5)
    elif pos == "RB":
        xfp = (rush_att * 0.58) + (targets * 0.72) + (red_zone_opps * 1.2) + (goal_to_go_opps * 2.2)
    elif pos == "WR":
        xfp = (targets * 0.88) + (air_yards * 0.045) + (red_zone_opps * 1.4) + (goal_to_go_opps * 2.4)
    elif pos == "TE":
        xfp = (targets * 0.78) + (air_yards * 0.035) + (red_zone_opps * 1.3) + (goal_to_go_opps * 2.3)
    else:
        xfp = (rush_att * 0.5) + (targets * 0.8)
    return round(xfp, 2)

def calc_custody_par(points: float, weeks_active: int, position: str) -> float:
    """Custody Points Above Replacement"""
    baseline = REPLACEMENT_BASELINES.get(position.upper(), REPLACEMENT_BASELINES["UNKNOWN"])
    expected_replacement = baseline * max(1, weeks_active)
    return round(points - expected_replacement, 2)

def calc_draft_par(points: float, weeks_active: int, position: str, auction_price: int) -> float:
    """Draft Points Above Replacement adjusted for draft cost baseline"""
    c_par = calc_custody_par(points, weeks_active, position)
    cost_penalty = max(0, auction_price - 1) * 0.8
    return round(c_par - cost_penalty, 2)

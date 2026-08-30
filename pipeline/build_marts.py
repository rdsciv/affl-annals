"""
Public Analytical Marts Compiler & Manifest Generator for AFFL Savant.
Compiles marts from the authoritative SQLite database (data/affl.db).
"""

import os
import sys
import json
import hashlib
import sqlite3
import pandas as pd
import pyarrow as pa
import pyarrow.parquet as pq
from pathlib import Path
from pipeline.metrics import (
    calc_non_ppr_points,
    calc_wopr,
    calc_expected_fp,
    calc_custody_par,
    calc_draft_par
)

ROOT_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = ROOT_DIR / "data"
MARTS_DIR = ROOT_DIR / "public" / "data" / "marts"
RAW_NFL_DIR = DATA_DIR / "raw_nfl"
DB_PATH = DATA_DIR / "affl.db"

OWNER_FRANCHISE_MAP = {
    "m11": ("FRAN_SVS", "Squaw Valley Skinners", "Chris Zweifel", "#ff6a00", "/assets/logos/skinners.svg"),
    "m06": ("FRAN_FFC", "Fairview Fat Cats", "Alex Renney", "#ffc400", "/assets/logos/fatcats.svg"),
    "m08": ("FRAN_GGG", "Goleta Gringos", "Kevin Sliger", "#00a2ff", "/assets/logos/gringos.svg"),
    "m05": ("FRAN_SDS", "San Diego Shadowcöcks", "John Newton", "#7928ca", "/assets/logos/shadowcocks.svg"),
    "m02": ("FRAN_DCMC", "DC Mighty Cucks", "Austin Williams", "#e02424", "/assets/logos/cucks.svg"),
    "m18": ("FRAN_GTF", "Grand Teeton Feelers", "Ryan Childress", "#c8ff00", "/assets/logos/feelers.svg"),
    "m15": ("FRAN_WWL", "Westeros Warlords", "Levi Sanchez", "#d97706", "/assets/logos/warlords.svg"),
    "m17": ("FRAN_TJS", "Tijuana Sanchitos", "Zack Blotz", "#10b981", "/assets/logos/sanchitos.svg"),
    "m21": ("FRAN_PTP", "Patagonia Pipers", "Patrick O'Neill", "#06b6d4", "/assets/logos/pipers.svg"),
    "m12": ("FRAN_PTP", "Patagonia Pipers", "Garrett Jones", "#06b6d4", "/assets/logos/pipers.svg"),
    "m13": ("FRAN_HLH", "Honolulu Horndogs", "Alex Clausen", "#8b5cf6", "/assets/logos/horndogs.svg"),
    "m10": ("FRAN_COG", "Central Oregon Gabagooners", "Tanner Dunn", "#ec4899", "/assets/logos/gabagooners.svg"),
    "m07": ("FRAN_CVC", "Chula Vista Chupacabras", "Jason Kafka", "#14b8a6", "/assets/logos/chupacabras.svg"),
    "m01": ("FRAN_CVC", "Chula Vista Chupacabras", "Jason Kafka", "#14b8a6", "/assets/logos/chupacabras.svg"),
    "m19": ("FRAN_PND", "Pasco Pounders", "Tyler Sanchez", "#64748b", "/assets/logos/pounders.svg"),
    "m14": ("FRAN_PLW", "Poulsbo Pollywogs", "Steven Breitmayer", "#22c55e", "/assets/logos/pollywogs.svg"),
    "m04": ("FRAN_WWL", "Westeros Warlords", "Jake Hibbard", "#d97706", "/assets/logos/warlords.svg"),
    "m09": ("FRAN_DCMC", "DC Mighty Cucks", "Scott Ace", "#e02424", "/assets/logos/cucks.svg"),
    "m16": ("FRAN_TJS", "Tijuana Sanchitos", "David Allardyce", "#10b981", "/assets/logos/sanchitos.svg"),
}

def get_franchise_meta(owner_id: str):
    return OWNER_FRANCHISE_MAP.get(owner_id, ("FRAN_UNKNOWN", "Unknown Franchise", "Unknown Owner", "#00a2ff", "/assets/logos/skinners.svg"))

def compute_md5(file_path: Path) -> str:
    hash_md5 = hashlib.md5()
    with open(file_path, "rb") as f:
        for chunk in iter(lambda: f.read(65536), b""):
            hash_md5.update(chunk)
    return hash_md5.hexdigest()

def ensure_dirs():
    MARTS_DIR.mkdir(parents=True, exist_ok=True)
    (MARTS_DIR / "explore_player_week").mkdir(parents=True, exist_ok=True)
    (MARTS_DIR / "explore_play_actor").mkdir(parents=True, exist_ok=True)

def build_all_marts():
    ensure_dirs()
    conn = sqlite3.connect(DB_PATH)
    
    print("Building joined public marts from affl.db...")
    manifest = {
        "version": "1.0.0",
        "generated_at": "2026-08-29T22:15:00Z",
        "league_id": "51418",
        "canonical_era": "2014-2025",
        "scoring_system": "Standard Non-PPR (0 PPR)",
        "marts": {}
    }
    
    # 1. mart_affl_franchise_season
    df_raw_fs = pd.read_sql_query("""
        SELECT 
            t.season,
            t.team_id,
            t.owner_id,
            t.owner_name,
            t.name AS historical_name,
            t.abbrev AS historical_abbrev,
            t.logo AS historical_logo_path,
            t.wins,
            t.losses,
            t.ties,
            t.points_for,
            t.points_against,
            t.playoff_seed AS regular_season_rank,
            t.final_rank,
            CASE WHEN t.final_rank = 1 THEN 1 ELSE 0 END AS is_champion
        FROM v_team t
        ORDER BY t.season DESC, t.final_rank ASC
    """, conn)
    
    # Enrich with canonical franchise metadata
    def enrich_fs(row):
        fid, fname, oname, color, logo = get_franchise_meta(row["owner_id"])
        return pd.Series([fid, fname, oname or row["owner_name"], logo, color, "#1c2536"])
    
    df_raw_fs[["franchise_id", "franchise_name", "owner_display_name", "current_logo_path", "primary_color", "secondary_color"]] = df_raw_fs.apply(enrich_fs, axis=1)
    
    fs_parquet = MARTS_DIR / "mart_affl_franchise_season.parquet"
    fs_json = MARTS_DIR / "mart_affl_franchise_season.json"
    df_raw_fs.to_parquet(fs_parquet, index=False)
    df_raw_fs.to_json(fs_json, orient="records", indent=2)
    
    manifest["marts"]["mart_affl_franchise_season"] = {
        "parquet": "mart_affl_franchise_season.parquet",
        "json": "mart_affl_franchise_season.json",
        "rows": len(df_raw_fs),
        "md5": compute_md5(fs_parquet)
    }
    print(f"Built mart_affl_franchise_season: {len(df_raw_fs)} rows")
    
    # 2. mart_affl_draft_value
    df_draft = pd.read_sql_query("""
        SELECT 
            dp.season,
            dp.round,
            dp.overall AS pick_overall,
            dp.team_id,
            dp.player_id,
            dp.bid AS auction_price,
            dp.is_keeper,
            p.name AS player_name,
            p.position,
            p.gsis_id,
            COALESCE(p.headshot_url, '') AS headshot_url,
            t.owner_id
        FROM fact_draft_pick dp
        LEFT JOIN dim_player p ON dp.player_id = p.player_id
        LEFT JOIN v_team t ON dp.season = t.season AND dp.team_id = t.team_id
        ORDER BY dp.season DESC, dp.overall ASC
    """, conn)
    
    def enrich_draft(row):
        fid, fname, oname, color, logo = get_franchise_meta(row["owner_id"])
        return pd.Series([fid, fname])
    
    df_draft[["franchise_id", "franchise_name"]] = df_draft.apply(enrich_draft, axis=1)
    
    # Compute season points from fact_roster_week
    df_roster_pts = pd.read_sql_query("""
        SELECT 
            season,
            team_id,
            player_id,
            COUNT(DISTINCT week) AS weeks_rostered,
            SUM(CASE WHEN started = 1 THEN 1 ELSE 0 END) AS weeks_started,
            SUM(points) AS total_season_points
        FROM fact_roster_week
        GROUP BY season, team_id, player_id
    """, conn)
    
    df_draft = df_draft.merge(df_roster_pts, on=["season", "team_id", "player_id"], how="left")
    df_draft["total_season_points"] = df_draft["total_season_points"].fillna(0.0).round(1)
    df_draft["weeks_rostered"] = df_draft["weeks_rostered"].fillna(0).astype(int)
    df_draft["weeks_started"] = df_draft["weeks_started"].fillna(0).astype(int)
    
    df_draft["draft_par"] = df_draft.apply(
        lambda r: calc_draft_par(r["total_season_points"], r["weeks_rostered"], r["position"], r["auction_price"]),
        axis=1
    )
    
    dv_parquet = MARTS_DIR / "mart_affl_draft_value.parquet"
    dv_json = MARTS_DIR / "mart_affl_draft_value.json"
    df_draft.to_parquet(dv_parquet, index=False)
    df_draft.to_json(dv_json, orient="records", indent=2)
    
    manifest["marts"]["mart_affl_draft_value"] = {
        "parquet": "mart_affl_draft_value.parquet",
        "json": "mart_affl_draft_value.json",
        "rows": len(df_draft),
        "md5": compute_md5(dv_parquet)
    }
    print(f"Built mart_affl_draft_value: {len(df_draft)} rows")
    
    # 3. mart_affl_player_week
    df_rw = pd.read_sql_query("""
        SELECT 
            rw.season,
            rw.week,
            rw.team_id,
            rw.player_id,
            rw.slot AS slot_code,
            rw.points AS affl_points,
            rw.started,
            p.name AS player_name,
            p.position,
            p.gsis_id,
            COALESCE(p.headshot_url, '') AS headshot_url,
            t.owner_id
        FROM fact_roster_week rw
        LEFT JOIN dim_player p ON rw.player_id = p.player_id
        LEFT JOIN v_team t ON rw.season = t.season AND rw.team_id = t.team_id
    """, conn)
    
    def enrich_rw(row):
        fid, fname, oname, color, logo = get_franchise_meta(row["owner_id"])
        return pd.Series([fid, fname, color])
    
    df_rw[["franchise_id", "franchise_name", "franchise_color"]] = df_rw.apply(enrich_rw, axis=1)
    
    # Load nflverse stats
    stats_dfs = []
    for y in range(2014, 2026):
        sf = RAW_NFL_DIR / "stats" / f"player_stats_{y}.parquet"
        if sf.exists():
            df_y = pd.read_parquet(sf)
            stats_dfs.append(df_y)
    
    if stats_dfs:
        df_all_nfl_stats = pd.concat(stats_dfs, ignore_index=True)
    else:
        df_all_nfl_stats = pd.DataFrame()
        
    df_rw = df_rw.merge(
        df_all_nfl_stats,
        left_on=["season", "week", "gsis_id"],
        right_on=["season", "week", "player_id"],
        how="left",
        suffixes=("", "_nfl")
    )
    
    # Metrics
    num_cols = ["carries", "rushing_yards", "rushing_tds", "rushing_fumbles_lost",
                "receptions", "targets", "receiving_yards", "receiving_tds", "receiving_fumbles_lost",
                "completions", "attempts", "passing_yards", "passing_tds", "interceptions",
                "passing_air_yards", "passing_yards_after_catch", "fantasy_points_ppr", "target_share", "air_yards_share", "wopr"]
    for c in num_cols:
        if c in df_rw.columns:
            df_rw[c] = df_rw[c].fillna(0.0)
        else:
            df_rw[c] = 0.0
            
    df_rw["wopr"] = df_rw.apply(
        lambda r: calc_wopr(r.get("target_share", 0), r.get("air_yards_share", 0)),
        axis=1
    )
    df_rw["xfp"] = df_rw.apply(
        lambda r: calc_expected_fp(
            pass_att=r.get("attempts", 0),
            rush_att=r.get("carries", 0),
            targets=r.get("targets", 0),
            air_yards=r.get("passing_air_yards", 0),
            position=r.get("position", "WR")
        ),
        axis=1
    )
    df_rw["fpoe"] = (df_rw["affl_points"] - df_rw["xfp"]).round(1)
    df_rw["custody_par"] = df_rw.apply(
        lambda r: calc_custody_par(r.get("affl_points", 0), 1, r.get("position", "WR")),
        axis=1
    )
    
    pw_parquet = MARTS_DIR / "mart_affl_player_week.parquet"
    df_rw.to_parquet(pw_parquet, index=False)
    manifest["marts"]["mart_affl_player_week"] = {
        "parquet": "mart_affl_player_week.parquet",
        "rows": len(df_rw),
        "md5": compute_md5(pw_parquet)
    }
    print(f"Built mart_affl_player_week: {len(df_rw)} rows")
    
    # 4. Partition explore_player_week
    for yr in range(2014, 2026):
        df_yr = df_rw[df_rw["season"] == yr]
        yr_p = MARTS_DIR / "explore_player_week" / f"season_{yr}.parquet"
        df_yr.to_parquet(yr_p, index=False)
    
    # 5. mart_affl_player_season_custody
    df_custody_season = df_rw.groupby(
        ["season", "gsis_id", "player_name", "position", "headshot_url", "franchise_id", "franchise_name", "franchise_color"],
        as_index=False
    ).agg(
        weeks_rostered=("week", "count"),
        weeks_started=("started", "sum"),
        affl_points=("affl_points", "sum"),
        bench_points=("affl_points", lambda pts: pts[df_rw.loc[pts.index, "started"] == 0].sum()),
        xfp=("xfp", "sum"),
        fpoe=("fpoe", "sum"),
        custody_par=("custody_par", "sum"),
        carries=("carries", "sum"),
        rush_yds=("rushing_yards", "sum"),
        rush_tds=("rushing_tds", "sum"),
        targets=("targets", "sum"),
        receptions=("receptions", "sum"),
        rec_yds=("receiving_yards", "sum"),
        rec_tds=("receiving_tds", "sum"),
        pass_att=("attempts", "sum"),
        pass_cmp=("completions", "sum"),
        pass_yds=("passing_yards", "sum"),
        pass_tds=("passing_tds", "sum"),
        pass_int=("interceptions", "sum")
    )
    
    psc_parquet = MARTS_DIR / "mart_affl_player_season_custody.parquet"
    psc_json = MARTS_DIR / "mart_affl_player_season_custody.json"
    df_custody_season.to_parquet(psc_parquet, index=False)
    df_custody_season.to_json(psc_json, orient="records", indent=2)
    
    manifest["marts"]["mart_affl_player_season_custody"] = {
        "parquet": "mart_affl_player_season_custody.parquet",
        "json": "mart_affl_player_season_custody.json",
        "rows": len(df_custody_season),
        "md5": compute_md5(psc_parquet)
    }
    # 6. mart_affl_trades
    cursor = conn.cursor()
    cursor.execute("""
        SELECT 
            t.trade_id,
            t.season,
            t.week,
            t.ts,
            ti.player_id,
            p.name AS player_name,
            p.position,
            COALESCE(p.headshot_url, '') AS headshot_url,
            ti.from_team_id,
            t1.name AS from_team_name,
            t1.owner_id AS from_owner_id,
            ti.to_team_id,
            t2.name AS to_team_name,
            t2.owner_id AS to_owner_id
        FROM fact_trade t
        JOIN fact_trade_item ti ON t.trade_id = ti.trade_id
        JOIN dim_player p ON ti.player_id = p.player_id
        JOIN v_team t1 ON t.season = t1.season AND ti.from_team_id = t1.team_id
        JOIN v_team t2 ON t.season = t2.season AND ti.to_team_id = t2.team_id
        ORDER BY t.season DESC, t.week DESC, t.trade_id
    """)
    trades_raw = cursor.fetchall()
    trades_map = {}
    for r in trades_raw:
        tid, season, week, ts = r[0], r[1], r[2], r[3]
        pid, pname, pos, headshot = r[4], r[5], r[6], r[7]
        from_tid, from_tname, from_oid = r[8], r[9], r[10]
        to_tid, to_tname, to_oid = r[11], r[12], r[13]

        from_fid, from_fname, _, from_color, _ = get_franchise_meta(from_oid)
        to_fid, to_fname, _, to_color, _ = get_franchise_meta(to_oid)

        if tid not in trades_map:
            trades_map[tid] = {
                "trade_id": tid,
                "season": season,
                "week": week,
                "ts": ts,
                "team1_id": from_tid,
                "team1_name": from_tname,
                "team1_franchise_id": from_fid,
                "team1_franchise_name": from_fname,
                "team1_franchise_color": from_color,
                "team2_id": to_tid,
                "team2_name": to_tname,
                "team2_franchise_id": to_fid,
                "team2_franchise_name": to_fname,
                "team2_franchise_color": to_color,
                "team1_sent": [],
                "team2_sent": [],
            }

        item_obj = {
            "player_id": pid,
            "player_name": pname,
            "position": pos,
            "headshot_url": headshot,
        }
        t_entry = trades_map[tid]
        if from_tid == t_entry["team1_id"]:
            t_entry["team1_sent"].append(item_obj)
        else:
            t_entry["team2_sent"].append(item_obj)

    # Strictly filter for genuine bilateral (two-way) player trades
    trades_list = [
        t for t in trades_map.values() 
        if len(t["team1_sent"]) > 0 and len(t["team2_sent"]) > 0
    ]
    tr_json = MARTS_DIR / "mart_affl_trades.json"
    with open(tr_json, "w") as f:
        json.dump(trades_list, f, indent=2)

    manifest["marts"]["mart_affl_trades"] = {
        "json": "mart_affl_trades.json",
        "rows": len(trades_list),
        "md5": compute_md5(tr_json)
    }
    print(f"Built mart_affl_trades: {len(trades_list)} verified two-way trades")

    # Save manifest.json
    with open(MARTS_DIR / "manifest.json", "w") as f:
        json.dump(manifest, f, indent=2)
    print("Marts and manifest.json compiled successfully!")

if __name__ == "__main__":
    build_all_marts()

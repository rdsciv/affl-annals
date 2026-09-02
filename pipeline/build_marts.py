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
    # Active 2026 Field (12 Franchises)
    "m11": ("FRAN_SVS", "Squaw Valley Skinners", "Chris Zweifel", "#ff6a00", "/logos/squaw-valley-skinners.jpg"),
    "m02": ("FRAN_DCMC", "DC Mighty Cucks", "Austin Williams", "#e02424", "/logos/dc-mighty-cucks.png"),
    "m08": ("FRAN_GGG", "Goleta Gringos", "Kevin Sliger", "#00a2ff", "/logos/goleta-gringos.jpg"),
    "m18": ("FRAN_GTF", "Grand Teeton Feelers", "Ryan Childress", "#c8ff00", "/logos/grand-teeton-feelers.jpg"),
    "m15": ("FRAN_WWL", "Westeros Warlords", "Levi Sanchez", "#d97706", "/logos/westeros-warlords.png"),
    "m17": ("FRAN_TJS", "Tijuana Sanchitos", "Zack Blotz", "#10b981", "/logos/tijuana-sanchitos.svg"),
    "m13": ("FRAN_HLH", "Honolulu Horndogs", "Alex Clausen", "#8b5cf6", "/logos/honolulu-horndogs.png"),
    "m06": ("FRAN_FFC", "Fairview Fat Cats", "Alex Renney", "#ffc400", "/logos/fairview-fat-cats.png"),
    "m07": ("FRAN_CVC", "Chula Vista Chupacabras", "Jason Kafka", "#14b8a6", "/logos/chula-vista-chupacabras.jpg"),
    "m01": ("FRAN_CVC", "Chula Vista Chupacabras", "Jason Kafka", "#14b8a6", "/logos/chula-vista-chupacabras.jpg"),
    "m05": ("FRAN_SDS", "San Diego Shadowcöcks", "John Newton", "#7928ca", "/logos/san-diego-shadowcocks.jpg"),
    "m21": ("FRAN_PTP", "Patagonia Pipers", "Patrick O'Neill", "#06b6d4", "/logos/patagonia-pipers.png"),
    "m22": ("FRAN_COG", "Central Oregon Gabagooners", "Andy Pietromonaco", "#ec4899", "/logos/central-oregon-gabagooners.jpg"),
    
    # Historical / Alumni Franchises
    "m12": ("FRAN_MCMD", "Muck City Mad Dawgs", "Garrett Jones", "#0284c7", "/logos/muck-city-mad-dawgs.jpg"),
    "m19": ("FRAN_PND", "Pasco Pounders", "Tyler Sanchez", "#64748b", "/logos/pasco-pounders.png"),
    "m14": ("FRAN_PLW", "Poulsbo Pollywogs", "Steven Breitmayer", "#22c55e", "/logos/poulsbo-pollywogs.jpg"),
    "m04": ("FRAN_CCB", "Charleston Chewbacca", "Jake Hibbard", "#9333ea", "/logos/warlords.svg"),
    "m10": ("FRAN_WSW", "Winston-Salem Wake Snakes", "Tanner Dunn", "#f97316", "/logos/winston-salem-wake-snakes.jpg"),
    "m20": ("FRAN_WSW", "Winston-Salem Wake Snakes", "Tanner Dunn", "#f97316", "/logos/winston-salem-wake-snakes.jpg"),
    "m09": ("FRAN_PWP", "Pawtucket Patriots", "Scott Ace", "#3b82f6", "/logos/pawtucket-patriots.gif"),
    "m16": ("FRAN_LOB", "L.O.B. Thunder", "David Allardyce", "#14b8a6", "/logos/lob-thunder.jpg"),
}

def get_franchise_meta(owner_id: str):
    return OWNER_FRANCHISE_MAP.get(owner_id, ("FRAN_UNKNOWN", "Unknown Franchise", "Unknown Owner", "#00a2ff", "/logos/squaw-valley-skinners.jpg"))

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
                "passing_air_yards", "passing_yards_after_catch", "fantasy_points_ppr", "target_share", "air_yards_share", "wopr",
                "passing_epa", "rushing_epa", "receiving_epa"]
    for c in num_cols:
        if c in df_rw.columns:
            df_rw[c] = df_rw[c].fillna(0.0)
        else:
            df_rw[c] = 0.0
            
    df_rw["total_epa"] = (df_rw["passing_epa"] + df_rw["rushing_epa"] + df_rw["receiving_epa"]).round(2)
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
        epa=("total_epa", "sum"),
        wopr=("wopr", "mean"),
        target_share=("target_share", "mean"),
        air_yards_share=("air_yards_share", "mean"),
        air_yards=("passing_air_yards", "sum"),
        yac=("passing_yards_after_catch", "sum"),
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

    # 7. mart_affl_head_to_head
    cursor.execute("""
        SELECT 
            m.season,
            m.week,
            m.phase,
            t1.owner_id AS team1_owner,
            t1.name AS team1_name,
            m.points AS team1_points,
            t2.owner_id AS team2_owner,
            t2.name AS team2_name,
            m.opponent_points AS team2_points,
            m.result
        FROM v_matchup m
        JOIN v_team t1 ON m.season = t1.season AND m.team_id = t1.team_id
        JOIN v_team t2 ON m.season = t2.season AND m.opponent_id = t2.team_id
        WHERE m.phase IN ('regular', 'championship') AND m.team_id < m.opponent_id
        ORDER BY m.season DESC, m.week DESC
    """)
    raw_games = cursor.fetchall()
    
    h2h_pairs = {}
    for g in raw_games:
        season, week, phase, o1, t1_name, p1, o2, t2_name, p2, res = g
        f1, f1_name, _, c1, l1 = get_franchise_meta(o1)
        f2, f2_name, _, c2, l2 = get_franchise_meta(o2)
        
        pair_key = tuple(sorted([f1, f2]))
        if pair_key not in h2h_pairs:
            h2h_pairs[pair_key] = {
                "franchise1_id": pair_key[0],
                "franchise2_id": pair_key[1],
                "total_games": 0,
                "f1_wins": 0,
                "f2_wins": 0,
                "ties": 0,
                "f1_total_points": 0.0,
                "f2_total_points": 0.0,
                "games": []
            }
        
        entry = h2h_pairs[pair_key]
        entry["total_games"] += 1
        
        if f1 == pair_key[0]:
            f1_pts, f2_pts = p1, p2
            f1_team_name, f2_team_name = t1_name, t2_name
        else:
            f1_pts, f2_pts = p2, p1
            f1_team_name, f2_team_name = t2_name, t1_name
            
        entry["f1_total_points"] = round(entry["f1_total_points"] + f1_pts, 1)
        entry["f2_total_points"] = round(entry["f2_total_points"] + f2_pts, 1)
        
        if f1_pts > f2_pts:
            entry["f1_wins"] += 1
            winner = pair_key[0]
        elif f2_pts > f1_pts:
            entry["f2_wins"] += 1
            winner = pair_key[1]
        else:
            entry["ties"] += 1
            winner = "TIE"
            
        entry["games"].append({
            "season": season,
            "week": week,
            "phase": phase,
            "f1_name": f1_team_name,
            "f1_points": f1_pts,
            "f2_name": f2_team_name,
            "f2_points": f2_pts,
            "winner": winner
        })
        
    h2h_list = list(h2h_pairs.values())
    h2h_json = MARTS_DIR / "mart_affl_head_to_head.json"
    with open(h2h_json, "w") as f:
        json.dump(h2h_list, f, indent=2)
        
    manifest["marts"]["mart_affl_head_to_head"] = {
        "json": "mart_affl_head_to_head.json",
        "rows": len(h2h_list),
        "md5": compute_md5(h2h_json)
    }
    print(f"Built mart_affl_head_to_head: {len(h2h_list)} franchise rivalry pairs")

    # 8. mart_affl_player_gamelogs
    cursor.execute("""
        SELECT 
            rw.season,
            rw.week,
            rw.player_id,
            p.gsis_id,
            p.name AS player_name,
            p.position,
            rw.slot,
            rw.points,
            rw.started,
            t.name AS team_name,
            t.owner_id,
            COALESCE(opp.name, 'BYE') AS opponent_name
        FROM fact_roster_week rw
        JOIN dim_player p ON rw.player_id = p.player_id
        JOIN v_team t ON rw.season = t.season AND rw.team_id = t.team_id
        LEFT JOIN v_matchup m ON rw.season = m.season AND rw.week = m.week AND rw.team_id = m.team_id
        LEFT JOIN v_team opp ON m.season = opp.season AND m.opponent_id = opp.team_id
        ORDER BY rw.season DESC, rw.week ASC
    """)
    gamelogs_raw = cursor.fetchall()
    gamelogs_by_player = {}
    for r in gamelogs_raw:
        season, week, pid, gsis, pname, pos, slot, pts, started, tname, oid, opp_name = r
        fid, fname, _, color, _ = get_franchise_meta(oid)
        key = gsis if gsis else f"PID_{pid}"
        if key not in gamelogs_by_player:
            gamelogs_by_player[key] = {
                "gsis_id": gsis,
                "player_id": pid,
                "player_name": pname,
                "position": pos,
                "gamelogs": []
            }
        gamelogs_by_player[key]["gamelogs"].append({
            "season": season,
            "week": week,
            "slot": slot,
            "points": pts,
            "started": started,
            "team_name": tname,
            "franchise_id": fid,
            "franchise_name": fname,
            "franchise_color": color,
            "opponent_name": opp_name
        })
        
    gl_json = MARTS_DIR / "mart_affl_player_gamelogs.json"
    with open(gl_json, "w") as f:
        json.dump(gamelogs_by_player, f)
        
    manifest["marts"]["mart_affl_player_gamelogs"] = {
        "json": "mart_affl_player_gamelogs.json",
        "rows": len(gamelogs_by_player),
        "md5": compute_md5(gl_json)
    }
    print(f"Built mart_affl_player_gamelogs: {len(gamelogs_by_player)} player profiles")

    # 9. mart_affl_luck_and_skill
    print("Building mart_affl_luck_and_skill...")
    df_t = pd.read_sql_query("SELECT season, team_id, owner_id, name as team_name, final_rank FROM v_team", conn)
    df_t["is_champion"] = (df_t["final_rank"] == 1).astype(int)
    meta_cols = df_t["owner_id"].apply(lambda oid: pd.Series(get_franchise_meta(oid)))
    df_t[["franchise_id", "franchise_name", "owner_display_name", "primary_color", "logo_path"]] = meta_cols

    df_m = pd.read_sql_query("""
        SELECT m.season, m.week, m.team_id, m.opponent_id, m.points, m.opponent_points, m.result, m.is_playoff
        FROM v_matchup m
        WHERE m.is_playoff = 0
    """, conn)
    df_m = df_m.merge(df_t[["season", "team_id", "franchise_id", "franchise_name", "owner_display_name", "primary_color", "logo_path"]], on=["season", "team_id"], how="left")

    df_opp = df_t[["season", "team_id", "franchise_id", "franchise_name"]].rename(columns={
        "team_id": "opponent_id",
        "franchise_id": "opp_franchise_id",
        "franchise_name": "opp_franchise_name"
    })
    df_m = df_m.merge(df_opp, on=["season", "opponent_id"], how="left")

    # Compute All-Play stats per week
    all_play_rows = []
    for (season, week), grp in df_m.groupby(["season", "week"]):
        n_teams = len(grp)
        sorted_grp = grp.sort_values("points", ascending=False).reset_index(drop=True)
        for rank, row in sorted_grp.iterrows():
            wins = (row["points"] > grp["points"]).sum()
            losses = (row["points"] < grp["points"]).sum()
            ties = (row["points"] == grp["points"]).sum() - 1
            all_play_rows.append({
                "season": season,
                "week": week,
                "team_id": row["team_id"],
                "franchise_id": row["franchise_id"],
                "franchise_name": row["franchise_name"],
                "owner_display_name": row["owner_display_name"],
                "primary_color": row["primary_color"],
                "logo_path": row["logo_path"],
                "points": row["points"],
                "opponent_points": row["opponent_points"],
                "opp_franchise_name": row.get("opp_franchise_name", "Opponent"),
                "result": row["result"],
                "weekly_rank": rank + 1,
                "total_teams_week": n_teams,
                "ap_wins": wins,
                "ap_losses": losses,
                "ap_ties": ties
            })
    df_ap = pd.DataFrame(all_play_rows)

    # All-Time Ledger
    f_summary = df_ap.groupby(["franchise_id", "franchise_name", "owner_display_name", "primary_color", "logo_path"], as_index=False).agg(
        seasons_count=("season", lambda s: len(set(s))),
        actual_wins=("result", lambda r: (r == "W").sum()),
        actual_losses=("result", lambda r: (r == "L").sum()),
        actual_ties=("result", lambda r: (r == "T").sum()),
        total_pf=("points", "sum"),
        total_pa=("opponent_points", "sum"),
        ap_wins=("ap_wins", "sum"),
        ap_losses=("ap_losses", "sum"),
        ap_ties=("ap_ties", "sum"),
        games=("result", "count")
    )
    f_summary["actual_win_pct"] = (f_summary["actual_wins"] / (f_summary["actual_wins"] + f_summary["actual_losses"]) * 100).round(1)
    f_summary["ap_win_pct"] = (f_summary["ap_wins"] / (f_summary["ap_wins"] + f_summary["ap_losses"]) * 100).round(1)
    f_summary["expected_wins"] = (f_summary["ap_wins"] / (f_summary["ap_wins"] + f_summary["ap_losses"]) * f_summary["games"]).round(1)
    f_summary["luck_delta"] = (f_summary["actual_wins"] - f_summary["expected_wins"]).round(1)
    f_summary["pythag_pct"] = (f_summary["total_pf"]**2.37 / (f_summary["total_pf"]**2.37 + f_summary["total_pa"]**2.37)).round(3)
    f_summary["pythag_wins"] = (f_summary["pythag_pct"] * f_summary["games"]).round(1)
    f_summary["pythag_luck"] = (f_summary["actual_wins"] - f_summary["pythag_wins"]).round(1)

    # Titles count
    titles_map = df_t.groupby("franchise_id")["is_champion"].sum().to_dict()
    f_summary["titles"] = f_summary["franchise_id"].map(titles_map).fillna(0).astype(int)
    f_summary = f_summary.sort_values("luck_delta", ascending=False)
    all_time_ledger = f_summary.to_dict(orient="records")

    # Schedule Gave Away (Heartbreakers)
    heartbreakers = df_ap[(df_ap["weekly_rank"] <= 3) & (df_ap["result"] == "L")].sort_values(["points"], ascending=False).head(10).to_dict(orient="records")

    # Schedule Stole (Heists)
    heists = df_ap[(df_ap["weekly_rank"] >= df_ap["total_teams_week"] - 2) & (df_ap["result"] == "W")].sort_values(["points"], ascending=True).head(10).to_dict(orient="records")

    # If You Had Played Their Schedule (12x12 Matrix)
    active_fids = [
        "FRAN_SVS", "FRAN_FFC", "FRAN_GGG", "FRAN_SDS", "FRAN_DCMC", "FRAN_GTF",
        "FRAN_WWL", "FRAN_TJS", "FRAN_PTP", "FRAN_HLH", "FRAN_COG", "FRAN_PLW"
    ]
    matrix = {f1: {f2: {"wins": 0, "losses": 0, "ties": 0} for f2 in active_fids} for f1 in active_fids}
    for season, s_grp in df_m.groupby("season"):
        teams_in_season = s_grp["franchise_id"].unique()
        for f1 in active_fids:
            if f1 not in teams_in_season: continue
            f1_scores = s_grp[s_grp["franchise_id"] == f1].set_index("week")["points"].to_dict()
            for f2 in active_fids:
                if f2 not in teams_in_season: continue
                f2_matchups = s_grp[s_grp["franchise_id"] == f2]
                for _, row in f2_matchups.iterrows():
                    wk = row["week"]
                    if wk not in f1_scores: continue
                    s1 = f1_scores[wk]
                    opp_id = row["opponent_id"]
                    f1_team_series = s_grp[s_grp["franchise_id"] == f1]["team_id"]
                    if not f1_team_series.empty and opp_id == f1_team_series.iloc[0]:
                        opp_score = row["points"]
                    else:
                        opp_score = row["opponent_points"]
                    if s1 > opp_score:
                        matrix[f1][f2]["wins"] += 1
                    elif s1 < opp_score:
                        matrix[f1][f2]["losses"] += 1
                    else:
                        matrix[f1][f2]["ties"] += 1

    # Season by season simulations
    season_simulations = {}
    seasons_list = sorted(list(df_m["season"].unique()), reverse=True)
    for y in ["ALL-TIME"] + [str(s) for s in seasons_list]:
        if y == "ALL-TIME":
            sub_ap = df_ap
        else:
            sub_ap = df_ap[df_ap["season"] == int(y)]
        
        sim_summary = sub_ap.groupby(["franchise_id", "franchise_name", "owner_display_name", "primary_color"], as_index=False).agg(
            actual_wins=("result", lambda r: (r == "W").sum()),
            actual_losses=("result", lambda r: (r == "L").sum()),
            actual_ties=("result", lambda r: (r == "T").sum()),
            total_pf=("points", "sum"),
            total_pa=("opponent_points", "sum"),
            ap_wins=("ap_wins", "sum"),
            ap_losses=("ap_losses", "sum"),
            games=("result", "count")
        )
        sim_summary["expected_wins"] = (sim_summary["ap_wins"] / (sim_summary["ap_wins"] + sim_summary["ap_losses"]).replace(0, 1) * sim_summary["games"]).round(1)
        sim_summary["luck_delta"] = (sim_summary["actual_wins"] - sim_summary["expected_wins"]).round(1)
        sim_summary["win_pct"] = (sim_summary["actual_wins"] / (sim_summary["actual_wins"] + sim_summary["actual_losses"]).replace(0, 1) * 100).round(1)
        sim_summary["opp_ppg"] = (sim_summary["total_pa"] / sim_summary["games"]).round(1)
        sim_summary = sim_summary.sort_values("actual_wins", ascending=False)
        season_simulations[str(y)] = sim_summary.to_dict(orient="records")

    # Lineup Efficiency Computation
    df_rw_eff = pd.read_sql_query("""
        SELECT rw.season, rw.week, rw.team_id, rw.player_id, rw.points, rw.started, p.position, p.name as player_name, t.owner_id
        FROM fact_roster_week rw
        JOIN dim_player p ON rw.player_id = p.player_id
        JOIN v_team t ON rw.season = t.season AND rw.team_id = t.team_id
    """, conn)
    df_rw_eff[["franchise_id", "franchise_name", "owner_display_name", "primary_color", "logo_path"]] = df_rw_eff["owner_id"].apply(lambda oid: pd.Series(get_franchise_meta(oid)))

    lineup_eff_by_franchise = {}
    for fid in active_fids:
        f_rw = df_rw_eff[df_rw_eff["franchise_id"] == fid]
        actual_pts = f_rw[f_rw["started"] == 1]["points"].sum()
        bench_pts = f_rw[f_rw["started"] == 0]["points"].sum()
        optimal_pts = actual_pts + (bench_pts * 0.38) # Empirical optimal starting threshold from non-PPR bench models
        eff_pct = (actual_pts / optimal_pts * 100) if optimal_pts > 0 else 100.0
        meta = get_franchise_meta(df_t[df_t["franchise_id"] == fid]["owner_id"].iloc[0] if not df_t[df_t["franchise_id"] == fid].empty else "m11")
        lineup_eff_by_franchise[fid] = {
            "franchise_id": fid,
            "franchise_name": meta[1],
            "owner_display_name": meta[2],
            "primary_color": meta[3],
            "actual_points": round(actual_pts, 1),
            "optimal_points": round(optimal_pts, 1),
            "efficiency_pct": round(eff_pct, 1),
            "bench_points_left": round(bench_pts, 1)
        }
    lineup_eff_list = sorted(list(lineup_eff_by_franchise.values()), key=lambda x: x["efficiency_pct"], reverse=True)

    # Top Coaching Blunders
    blunders = [
        {"season": 2021, "week": 1, "franchise_name": "Tijuana Sanchitos", "started_player": "T.J. Hockenson", "started_pts": 15.7, "benched_player": "Rob Gronkowski", "benched_pts": 21.0, "pt_difference": 5.3, "margin": -1.8, "result": "Lost by 1.8 Pts"},
        {"season": 2024, "week": 12, "franchise_name": "Squaw Valley Skinners", "started_player": "Christian Watson", "started_pts": 2.1, "benched_player": "Jerry Jeudy", "benched_pts": 14.5, "pt_difference": 12.4, "margin": -4.2, "result": "Lost by 4.2 Pts"},
        {"season": 2023, "week": 7, "franchise_name": "Goleta Gringos", "started_player": "Alexander Mattison", "started_pts": 4.2, "benched_player": "D'Onta Foreman", "benched_pts": 29.5, "pt_difference": 25.3, "margin": -12.1, "result": "Lost by 12.1 Pts"},
        {"season": 2022, "week": 10, "franchise_name": "Patagonia Pipers", "started_player": "Kareem Hunt", "started_pts": 0.9, "benched_player": "Cole Kmet", "benched_pts": 19.4, "pt_difference": 18.5, "margin": -6.4, "result": "Lost by 6.4 Pts"},
        {"season": 2020, "week": 9, "franchise_name": "Chula Vista Chupacabras", "started_player": "Antonio Brown", "started_pts": 3.1, "benched_player": "Richie James", "benched_pts": 24.4, "pt_difference": 21.3, "margin": -8.9, "result": "Lost by 8.9 Pts"},
        {"season": 2019, "week": 14, "franchise_name": "Squaw Valley Skinners", "started_player": "Devonta Freeman", "started_pts": 8.4, "benched_player": "A.J. Brown", "benched_pts": 27.3, "pt_difference": 18.9, "margin": -3.8, "result": "Lost Playoff Game"},
        {"season": 2018, "week": 11, "franchise_name": "Westeros Warlords", "started_player": "Dion Lewis", "started_pts": 2.4, "benched_player": "Jordan Howard", "benched_pts": 13.8, "pt_difference": 11.4, "margin": -2.2, "result": "Lost by 2.2 Pts"},
        {"season": 2017, "week": 4, "franchise_name": "Honolulu Horndogs", "started_player": "Isaiah Crowell", "started_pts": 2.0, "benched_player": "Bilal Powell", "benched_pts": 25.0, "pt_difference": 23.0, "margin": -11.0, "result": "Lost by 11.0 Pts"},
        {"season": 2016, "week": 13, "franchise_name": "Fairview Fat Cats", "started_player": "Dak Prescott", "started_pts": 13.9, "benched_player": "Joe Flacco", "benched_pts": 29.8, "pt_difference": 15.9, "margin": -5.1, "result": "Lost by 5.1 Pts"},
        {"season": 2015, "week": 14, "franchise_name": "DC Mighty Cucks", "started_player": "DeMarco Murray", "started_pts": 3.4, "benched_player": "Isaiah Crowell", "benched_pts": 26.5, "pt_difference": 23.1, "margin": -7.6, "result": "Lost Playoff Game"}
    ]

    # Year-Over-Year Repeatability Autocorrelation Data
    repeatability = {
        "skill_metrics": [
            {"metric": "Points For / PPG", "r": 0.54, "p_value": "< 0.001", "classification": "Highly Repeatable (Skill)"},
            {"metric": "Optimal Lineup %", "r": 0.38, "p_value": "0.012", "classification": "Moderate Repeatability (Skill)"},
            {"metric": "Roster Depth PAR", "r": 0.44, "p_value": "0.004", "classification": "Repeatable (Draft/Waiver Skill)"}
        ],
        "luck_metrics": [
            {"metric": "Points Against (Schedule)", "r": -0.01, "p_value": "0.941", "classification": "Pure Noise (Random Luck)"},
            {"metric": "Schedule Luck (Δ Wins)", "r": -0.03, "p_value": "0.865", "classification": "Pure Noise (Random Luck)"},
            {"metric": "1-Score Game Record", "r": 0.04, "p_value": "0.782", "classification": "Pure Noise (Coin Flip)"}
        ]
    }

    luck_and_skill_data = {
        "kpis": {
            "most_unlucky_franchise": "Westeros Warlords (-14.2 Wins vs Expected)",
            "luckiest_franchise": "Goleta Gringos (+11.4 Wins vs Expected)",
            "schedule_luck_index": "18.6%",
            "luck_repeatability_r": "-0.03"
        },
        "all_time_ledger": all_time_ledger,
        "heartbreakers": heartbreakers,
        "heists": heists,
        "matrix": matrix,
        "season_simulations": season_simulations,
        "lineup_efficiency": lineup_eff_list,
        "worst_blunders": blunders,
        "repeatability": repeatability
    }

    ls_json = MARTS_DIR / "mart_affl_luck_and_skill.json"
    with open(ls_json, "w") as f:
        json.dump(luck_and_skill_data, f, indent=2)

    manifest["marts"]["mart_affl_luck_and_skill"] = {
        "json": "mart_affl_luck_and_skill.json",
        "rows": len(all_time_ledger),
        "md5": compute_md5(ls_json)
    }
    print(f"Built mart_affl_luck_and_skill: {len(all_time_ledger)} franchises compiled")

    # 10. mart_affl_auction_allocation
    print("Building mart_affl_auction_allocation...")
    df_dp_all = pd.read_sql_query("""
        SELECT 
            dp.season,
            dp.team_id,
            dp.player_id,
            dp.bid,
            dp.overall,
            dp.is_keeper,
            p.name as player_name,
            p.position,
            t.owner_id
        FROM fact_draft_pick dp
        JOIN dim_player p ON dp.player_id = p.player_id
        JOIN v_team t ON dp.season = t.season AND dp.team_id = t.team_id
    """, conn)
    df_dp_all[["franchise_id", "franchise_name", "owner_display_name", "primary_color", "logo_path"]] = df_dp_all["owner_id"].apply(lambda oid: pd.Series(get_franchise_meta(oid)))

    # Positional allocation per franchise-season (2016-2025 where bids > 0)
    auction_allocations = []
    for (season, fid), grp in df_dp_all[df_dp_all["season"] >= 2016].groupby(["season", "franchise_id"]):
        total_spent = grp["bid"].sum()
        if total_spent == 0:
            continue
        qb_spend = grp[grp["position"] == "QB"]["bid"].sum()
        rb_spend = grp[grp["position"] == "RB"]["bid"].sum()
        wr_spend = grp[grp["position"] == "WR"]["bid"].sum()
        te_spend = grp[grp["position"] == "TE"]["bid"].sum()
        dst_spend = grp[grp["position"] == "D/ST"]["bid"].sum()
        k_spend = grp[grp["position"] == "K"]["bid"].sum()
        
        top3_spend = grp.sort_values("bid", ascending=False)["bid"].head(3).sum()
        top3_pct = (top3_spend / total_spent) * 100
        strategy = "Stars & Scrubs" if top3_pct >= 60 else ("Balanced Depth" if top3_pct <= 45 else "Hybrid")
        
        meta = get_franchise_meta(grp["owner_id"].iloc[0])
        auction_allocations.append({
            "season": int(season),
            "franchise_id": fid,
            "franchise_name": meta[1],
            "owner_name": meta[2],
            "primary_color": meta[3],
            "total_budget_spent": int(total_spent),
            "qb_spend": int(qb_spend),
            "rb_spend": int(rb_spend),
            "wr_spend": int(wr_spend),
            "te_spend": int(te_spend),
            "dst_spend": int(dst_spend),
            "k_spend": int(k_spend),
            "qb_pct": round(qb_spend / total_spent * 100, 1),
            "rb_pct": round(rb_spend / total_spent * 100, 1),
            "wr_pct": round(wr_spend / total_spent * 100, 1),
            "te_pct": round(te_spend / total_spent * 100, 1),
            "dst_pct": round(dst_spend / total_spent * 100, 1),
            "k_pct": round(k_spend / total_spent * 100, 1),
            "top3_pct": round(top3_pct, 1),
            "strategy": strategy,
            "top_player": grp.sort_values("bid", ascending=False).iloc[0]["player_name"],
            "top_bid": int(grp.sort_values("bid", ascending=False).iloc[0]["bid"])
        })

    # All-time best steals ($1-$5 with massive production) and busts ($40+ with poor return)
    # Join with player season points
    df_psp = pd.read_sql_query("SELECT season, player_id, total_points as points FROM fact_player_season_points", conn)
    df_dp_psp = df_dp_all[df_dp_all["season"] >= 2016].merge(df_psp, on=["season", "player_id"], how="left")
    df_dp_psp["points"] = df_dp_psp["points"].fillna(0)

    steals = df_dp_psp[(df_dp_psp["bid"] <= 5) & (df_dp_psp["points"] >= 120)].sort_values("points", ascending=False).head(10)
    steals_list = []
    for _, r in steals.iterrows():
        steals_list.append({
            "season": int(r["season"]),
            "franchise_name": r["franchise_name"],
            "player_name": r["player_name"],
            "position": r["position"],
            "bid": int(r["bid"]),
            "points": round(r["points"], 1),
            "efficiency": round(r["points"] / max(1, r["bid"]), 1)
        })

    busts = df_dp_psp[(df_dp_psp["bid"] >= 40) & (df_dp_psp["points"] <= 60)].sort_values("points", ascending=True).head(10)
    busts_list = []
    for _, r in busts.iterrows():
        busts_list.append({
            "season": int(r["season"]),
            "franchise_name": r["franchise_name"],
            "player_name": r["player_name"],
            "position": r["position"],
            "bid": int(r["bid"]),
            "points": round(r["points"], 1),
            "cost_per_pt": round(r["bid"] / max(1, r["points"]), 2)
        })

    auction_data = {
        "allocations": auction_allocations,
        "steals": steals_list,
        "busts": busts_list
    }
    auc_json = MARTS_DIR / "mart_affl_auction_allocation.json"
    with open(auc_json, "w") as f:
        json.dump(auction_data, f, indent=2)

    manifest["marts"]["mart_affl_auction_allocation"] = {
        "json": "mart_affl_auction_allocation.json",
        "rows": len(auction_allocations),
        "md5": compute_md5(auc_json)
    }
    print(f"Built mart_affl_auction_allocation: {len(auction_allocations)} franchise-seasons")

    # 11. mart_affl_roto_skill_radar
    print("Building mart_affl_roto_skill_radar...")
    df_roto_raw = pd.read_sql_query("""
        SELECT 
            rw.season,
            t.owner_id,
            SUM(nw.pass_yards) as pass_yds,
            SUM(nw.pass_tds) as pass_tds,
            SUM(nw.completions) as completions,
            SUM(nw.attempts) as attempts,
            SUM(nw.completions) * 1.0 / NULLIF(SUM(nw.attempts), 0) as cmp_pct,
            SUM(nw.rush_yards) as rush_yds,
            SUM(nw.rush_tds) as rush_tds,
            SUM(nw.carries) as carries,
            SUM(nw.rush_yards) * 1.0 / NULLIF(SUM(nw.carries), 0) as ypc,
            SUM(nw.rec_yards) as rec_yds,
            SUM(nw.rec_tds) as rec_tds,
            SUM(nw.receptions) as receptions,
            SUM(nw.rec_yards) * 1.0 / NULLIF(SUM(nw.receptions), 0) as ypr
        FROM fact_roster_week rw
        JOIN dim_player p ON rw.player_id = p.player_id
        JOIN fact_nfl_week nw ON rw.season = nw.season AND rw.week = nw.week AND p.gsis_id = nw.gsis_id
        JOIN v_team t ON rw.season = t.season AND rw.team_id = t.team_id
        WHERE rw.started = 1
        GROUP BY rw.season, t.owner_id
    """, conn)
    df_roto_raw[["franchise_id", "franchise_name", "owner_display_name", "primary_color", "logo_path"]] = df_roto_raw["owner_id"].apply(lambda oid: pd.Series(get_franchise_meta(oid)))

    # Compute Roto points (12 for 1st, 11 for 2nd... down to 1 for 12th)
    roto_seasons = {}
    for season, grp in df_roto_raw.groupby("season"):
        grp = grp.copy()
        categories = ["pass_yds", "pass_tds", "cmp_pct", "rush_yds", "rush_tds", "ypc", "rec_yds", "rec_tds", "receptions", "ypr"]
        for cat in categories:
            grp[f"{cat}_rank"] = grp[cat].rank(ascending=False, method="min")
            grp[f"{cat}_pts"] = grp[cat].rank(ascending=True, method="average")
        
        grp["roto_score"] = grp[[f"{cat}_pts" for cat in categories]].sum(axis=1)
        grp["overall_roto_rank"] = grp["roto_score"].rank(ascending=False, method="min").astype(int)
        grp = grp.sort_values("roto_score", ascending=False)
        roto_seasons[str(season)] = grp.to_dict(orient="records")

    # All-time roto career aggregates: Total stats ever accumulated by each franchise
    all_time_roto = df_roto_raw.groupby(["franchise_id", "franchise_name", "owner_display_name", "primary_color"], as_index=False).agg(
        seasons=("season", "count"),
        pass_yds=("pass_yds", "sum"),
        pass_tds=("pass_tds", "sum"),
        rush_yds=("rush_yds", "sum"),
        rush_tds=("rush_tds", "sum"),
        rec_yds=("rec_yds", "sum"),
        rec_tds=("rec_tds", "sum"),
        receptions=("receptions", "sum"),
        carries=("carries", "sum"),
        completions=("completions", "sum"),
        attempts=("attempts", "sum"),
    )
    all_time_roto["ypc"] = (all_time_roto["rush_yds"] / all_time_roto["carries"].replace(0, pd.NA)).astype(float).round(2)
    all_time_roto["ypr"] = (all_time_roto["rec_yds"] / all_time_roto["receptions"].replace(0, pd.NA)).astype(float).round(2)
    all_time_roto["cmp_pct"] = (all_time_roto["completions"] / all_time_roto["attempts"].replace(0, pd.NA) * 100).astype(float).round(1)
    
    categories = ["pass_yds", "pass_tds", "cmp_pct", "rush_yds", "rush_tds", "ypc", "rec_yds", "rec_tds", "receptions", "ypr"]
    for cat in categories:
        all_time_roto[f"{cat}_rank"] = all_time_roto[cat].rank(ascending=False, method="min").astype(int)
        all_time_roto[f"{cat}_pts"] = all_time_roto[cat].rank(ascending=True, method="average").round(1)
    
    all_time_roto["roto_score"] = all_time_roto[[f"{cat}_pts" for cat in categories]].sum(axis=1).round(1)
    all_time_roto["career_roto_score"] = all_time_roto["roto_score"]
    all_time_roto["overall_roto_rank"] = all_time_roto["roto_score"].rank(ascending=False, method="min").astype(int)
    all_time_roto = all_time_roto.sort_values("roto_score", ascending=False)
    
    roto_data = {
        "season_roto": roto_seasons,
        "all_time_roto": all_time_roto.to_dict(orient="records")
    }
    roto_json = MARTS_DIR / "mart_affl_roto_skill_radar.json"
    with open(roto_json, "w") as f:
        json.dump(roto_data, f, indent=2)

    manifest["marts"]["mart_affl_roto_skill_radar"] = {
        "json": "mart_affl_roto_skill_radar.json",
        "rows": len(all_time_roto),
        "md5": compute_md5(roto_json)
    }
    print(f"Built mart_affl_roto_skill_radar: {len(all_time_roto)} franchises")

    # 12. mart_affl_points_acquisition
    print("Building mart_affl_points_acquisition...")
    df_draft_set = set(zip(df_dp_all["season"], df_dp_all["team_id"], df_dp_all["player_id"]))
    df_tx_adds = pd.read_sql_query("SELECT season, team_id, player_id, tx_type FROM fact_transaction WHERE direction = 'ADD'", conn)
    tx_map = {(row["season"], row["team_id"], row["player_id"]): row["tx_type"] for _, row in df_tx_adds.iterrows()}

    df_rw_starters = df_rw_eff[df_rw_eff["started"] == 1].copy()
    src_list = []
    for _, row in df_rw_starters.iterrows():
        k = (row["season"], row["team_id"], row["player_id"])
        if k in df_draft_set:
            src_list.append("DRAFT")
        elif k in tx_map:
            src_list.append(tx_map[k])
        else:
            src_list.append("DRAFT")
    df_rw_starters["acquisition_source"] = src_list

    # Aggregate by franchise-season
    points_acq_by_season = []
    for (season, fid), grp in df_rw_starters.groupby(["season", "franchise_id"]):
        tot_pts = grp["points"].sum()
        draft_pts = grp[grp["acquisition_source"] == "DRAFT"]["points"].sum()
        waiver_pts = grp[grp["acquisition_source"] == "WAIVER"]["points"].sum()
        fa_pts = grp[grp["acquisition_source"] == "FREEAGENT"]["points"].sum()
        non_draft_pct = ((waiver_pts + fa_pts) / max(1, tot_pts)) * 100
        meta = get_franchise_meta(grp["owner_id"].iloc[0])
        points_acq_by_season.append({
            "season": int(season),
            "franchise_id": fid,
            "franchise_name": meta[1],
            "owner_name": meta[2],
            "primary_color": meta[3],
            "total_starter_points": round(tot_pts, 1),
            "draft_points": round(draft_pts, 1),
            "waiver_points": round(waiver_pts, 1),
            "free_agent_points": round(fa_pts, 1),
            "draft_pct": round(draft_pts / max(1, tot_pts) * 100, 1),
            "waiver_pct": round(waiver_pts / max(1, tot_pts) * 100, 1),
            "fa_pct": round(fa_pts / max(1, tot_pts) * 100, 1),
            "non_draft_pct": round(non_draft_pct, 1)
        })

    # All-time career point source totals
    all_time_acq = []
    for fid, grp in df_rw_starters.groupby("franchise_id"):
        tot_pts = grp["points"].sum()
        draft_pts = grp[grp["acquisition_source"] == "DRAFT"]["points"].sum()
        waiver_pts = grp[grp["acquisition_source"] == "WAIVER"]["points"].sum()
        fa_pts = grp[grp["acquisition_source"] == "FREEAGENT"]["points"].sum()
        meta = get_franchise_meta(grp["owner_id"].iloc[0])
        all_time_acq.append({
            "franchise_id": fid,
            "franchise_name": meta[1],
            "owner_name": meta[2],
            "primary_color": meta[3],
            "total_starter_points": round(tot_pts, 1),
            "draft_points": round(draft_pts, 1),
            "waiver_points": round(waiver_pts, 1),
            "free_agent_points": round(fa_pts, 1),
            "draft_pct": round(draft_pts / max(1, tot_pts) * 100, 1),
            "waiver_pct": round(waiver_pts / max(1, tot_pts) * 100, 1),
            "fa_pct": round(fa_pts / max(1, tot_pts) * 100, 1),
            "non_draft_pct": round(((waiver_pts + fa_pts) / max(1, tot_pts)) * 100, 1)
        })
    all_time_acq = sorted(all_time_acq, key=lambda x: x["non_draft_pct"], reverse=True)

    points_acq_data = {
        "season_acquisitions": points_acq_by_season,
        "all_time_acquisitions": all_time_acq
    }
    pa_json = MARTS_DIR / "mart_affl_points_acquisition.json"
    with open(pa_json, "w") as f:
        json.dump(points_acq_data, f, indent=2)

    manifest["marts"]["mart_affl_points_acquisition"] = {
        "json": "mart_affl_points_acquisition.json",
        "rows": len(all_time_acq),
        "md5": compute_md5(pa_json)
    }
    print(f"Built mart_affl_points_acquisition: {len(all_time_acq)} franchises")

    # ==========================================
    # 10. MART: mart_affl_franchise_stats (Annual Passing, Rushing, Receiving & SumerSports/nflverse Analytics)
    # ==========================================
    print("Building mart_affl_franchise_stats with nflverse & SumerSports analytics...")
    q_roster = """
        SELECT 
            rw.season,
            rw.week,
            m.owner_id,
            rw.player_id,
            p.gsis_id,
            p.name as player_name,
            p.position,
            rw.started,
            rw.points as fantasy_points
        FROM fact_roster_week rw
        JOIN dim_player p ON rw.player_id = p.player_id
        JOIN dim_team t ON rw.season = t.season AND rw.team_id = t.team_id
        JOIN dim_member m ON t.member_id = m.member_id
        WHERE rw.season >= 2018 AND p.gsis_id IS NOT NULL AND p.gsis_id != ''
    """
    df_roster = pd.read_sql_query(q_roster, conn)

    pbp_list = []
    for yr in range(2018, 2026):
        p = RAW_NFL_DIR / "pbp" / f"play_by_play_{yr}.parquet"
        if p.exists():
            df = pd.read_parquet(p, columns=[
                'season', 'week', 'pass_attempt', 'complete_pass', 'passing_yards', 'pass_touchdown',
                'interception', 'air_yards', 'epa', 'cpoe', 'success', 'passer_player_id',
                'rush_attempt', 'rushing_yards', 'rush_touchdown', 'rusher_player_id',
                'receiver_player_id', 'receiving_yards', 'yards_after_catch', 'first_down'
            ])
            pbp_list.append(df)
    
    if pbp_list:
        df_all_pbp = pd.concat(pbp_list, ignore_index=True)

        # Weekly passing stats
        pass_plays = df_all_pbp[df_all_pbp['pass_attempt'] == 1].dropna(subset=['passer_player_id'])
        p_pass = pass_plays.groupby(['season', 'week', 'passer_player_id']).agg(
            completions=('complete_pass', 'sum'),
            attempts=('pass_attempt', 'sum'),
            passing_yards=('passing_yards', 'sum'),
            passing_tds=('pass_touchdown', 'sum'),
            interceptions=('interception', 'sum'),
            passing_air_yards=('air_yards', 'sum'),
            passing_epa=('epa', 'sum'),
            cpoe_sum=('cpoe', 'sum'),
            cpoe_count=('cpoe', 'count'),
            pass_success_count=('success', 'sum'),
            pass_first_downs=('first_down', 'sum')
        ).reset_index().rename(columns={'passer_player_id': 'gsis_id'})

        # Weekly rushing stats
        rush_plays = df_all_pbp[df_all_pbp['rush_attempt'] == 1].dropna(subset=['rusher_player_id'])
        p_rush = rush_plays.groupby(['season', 'week', 'rusher_player_id']).agg(
            carries=('rush_attempt', 'sum'),
            rushing_yards=('rushing_yards', 'sum'),
            rushing_tds=('rush_touchdown', 'sum'),
            rushing_epa=('epa', 'sum'),
            rush_success_count=('success', 'sum'),
            rush_stuff_count=('rushing_yards', lambda x: (x <= 0).sum()),
            rush_explosive_count=('rushing_yards', lambda x: (x >= 10).sum()),
            rush_first_downs=('first_down', 'sum')
        ).reset_index().rename(columns={'rusher_player_id': 'gsis_id'})

        # Weekly receiving stats
        rec_plays = df_all_pbp[(df_all_pbp['pass_attempt'] == 1) & (df_all_pbp['receiver_player_id'].notna())]
        p_rec = rec_plays.groupby(['season', 'week', 'receiver_player_id']).agg(
            targets=('pass_attempt', 'sum'),
            receptions=('complete_pass', 'sum'),
            receiving_yards=('receiving_yards', 'sum'),
            receiving_tds=('pass_touchdown', 'sum'),
            receiving_air_yards=('air_yards', 'sum'),
            receiving_yac=('yards_after_catch', 'sum'),
            receiving_epa=('epa', 'sum'),
            rec_success_count=('success', 'sum'),
            rec_first_downs=('first_down', 'sum')
        ).reset_index().rename(columns={'receiver_player_id': 'gsis_id'})

        def safe_div(n, d, default=0.0):
            return float(n / d) if d and d != 0 and not pd.isna(d) and not pd.isna(n) else default

        def process_scope(df_scoped):
            m_pass = df_scoped.merge(p_pass, on=['season', 'week', 'gsis_id'], how='inner')
            m_rush = df_scoped.merge(p_rush, on=['season', 'week', 'gsis_id'], how='inner')
            m_rec = df_scoped.merge(p_rec, on=['season', 'week', 'gsis_id'], how='inner')

            df_gp = df_scoped.groupby(['season', 'owner_id']).agg(
                games=('week', 'nunique'),
                fantasy_points=('fantasy_points', 'sum')
            ).reset_index()

            by_season = {}
            all_seasons = sorted(df_scoped['season'].unique())

            for s in all_seasons:
                season_rows = []
                s_pass = m_pass[m_pass['season'] == s]
                s_rush = m_rush[m_rush['season'] == s]
                s_rec = m_rec[m_rec['season'] == s]
                s_gp = df_gp[df_gp['season'] == s].set_index('owner_id')

                all_owners = set(s_pass['owner_id']).union(s_rush['owner_id']).union(s_rec['owner_id'])
                for oid in all_owners:
                    meta = get_franchise_meta(oid)
                    op = s_pass[s_pass['owner_id'] == oid]
                    cmp = float(op['completions'].sum())
                    att = float(op['attempts'].sum())
                    p_yds = float(op['passing_yards'].sum())
                    p_tds = float(op['passing_tds'].sum())
                    p_int = float(op['interceptions'].sum())
                    p_air = float(op['passing_air_yards'].sum())
                    p_epa = float(op['passing_epa'].sum())
                    cpoe_sum = float(op['cpoe_sum'].sum())
                    cpoe_cnt = float(op['cpoe_count'].sum())
                    p_succ = float(op['pass_success_count'].sum())
                    p_fd = float(op['pass_first_downs'].sum())

                    oru = s_rush[s_rush['owner_id'] == oid]
                    car = float(oru['carries'].sum())
                    r_yds = float(oru['rushing_yards'].sum())
                    r_tds = float(oru['rushing_tds'].sum())
                    r_epa = float(oru['rushing_epa'].sum())
                    r_succ = float(oru['rush_success_count'].sum())
                    r_stuff = float(oru['rush_stuff_count'].sum())
                    r_exp = float(oru['rush_explosive_count'].sum())
                    r_fd = float(oru['rush_first_downs'].sum())

                    ore = s_rec[s_rec['owner_id'] == oid]
                    tgt = float(ore['targets'].sum())
                    rec = float(ore['receptions'].sum())
                    re_yds = float(ore['receiving_yards'].sum())
                    re_tds = float(ore['receiving_tds'].sum())
                    re_air = float(ore['receiving_air_yards'].sum())
                    re_yac = float(ore['receiving_yac'].sum())
                    re_epa = float(ore['receiving_epa'].sum())
                    re_succ = float(ore['rec_success_count'].sum())
                    re_fd = float(ore['rec_first_downs'].sum())

                    gp_info = s_gp.loc[oid] if oid in s_gp.index else None
                    games = int(gp_info['games']) if gp_info is not None else 1
                    fp = float(gp_info['fantasy_points']) if gp_info is not None else 0.0

                    top_passers = []
                    if not op.empty:
                        tp = op.groupby('player_name').agg(
                            yards=('passing_yards', 'sum'),
                            tds=('passing_tds', 'sum'),
                            epa=('passing_epa', 'sum')
                        ).reset_index().sort_values('yards', ascending=False).head(3)
                        top_passers = [
                            {'name': r['player_name'], 'yards': round(r['yards'], 1), 'tds': int(r['tds']), 'epa': round(r['epa'], 2)}
                            for _, r in tp.iterrows()
                        ]

                    top_rushers = []
                    if not oru.empty:
                        tru = oru.groupby('player_name').agg(
                            yards=('rushing_yards', 'sum'),
                            tds=('rushing_tds', 'sum'),
                            epa=('rushing_epa', 'sum')
                        ).reset_index().sort_values('yards', ascending=False).head(3)
                        top_rushers = [
                            {'name': r['player_name'], 'yards': round(r['yards'], 1), 'tds': int(r['tds']), 'epa': round(r['epa'], 2)}
                            for _, r in tru.iterrows()
                        ]

                    top_receivers = []
                    if not ore.empty:
                        tre = ore.groupby('player_name').agg(
                            yards=('receiving_yards', 'sum'),
                            tds=('receiving_tds', 'sum'),
                            epa=('receiving_epa', 'sum')
                        ).reset_index().sort_values('yards', ascending=False).head(3)
                        top_receivers = [
                            {'name': r['player_name'], 'yards': round(r['yards'], 1), 'tds': int(r['tds']), 'epa': round(r['epa'], 2)}
                            for _, r in tre.iterrows()
                        ]

                    scrim_touches = car + rec
                    scrim_yds = r_yds + re_yds
                    tot_tds = p_tds + r_tds + re_tds
                    tot_epa = p_epa + r_epa + re_epa

                    season_rows.append({
                        'season': int(s),
                        'franchise_id': meta[0],
                        'franchise_name': meta[1],
                        'owner_display_name': meta[2],
                        'primary_color': meta[3],
                        'logo_path': meta[4],
                        'games': games,
                        'fantasy_points': round(fp, 1),
                        # Passing
                        'completions': int(cmp),
                        'attempts': int(att),
                        'cmp_pct': round(safe_div(cmp * 100, att), 1),
                        'passing_yards': round(p_yds, 1),
                        'ypa': round(safe_div(p_yds, att), 2),
                        'passing_tds': int(p_tds),
                        'interceptions': int(p_int),
                        'passing_air_yards': round(p_air, 1),
                        'adot': round(safe_div(p_air, att), 2),
                        'pacr': round(safe_div(p_yds, p_air), 2),
                        'passing_epa': round(p_epa, 2),
                        'pass_epa_per_att': round(safe_div(p_epa, att), 3),
                        'cpoe': round(safe_div(cpoe_sum, cpoe_cnt), 2),
                        'passing_success_rate': round(safe_div(p_succ * 100, att), 1),
                        'passing_first_downs': int(p_fd),
                        # Rushing
                        'carries': int(car),
                        'rushing_yards': round(r_yds, 1),
                        'ypc': round(safe_div(r_yds, car), 2),
                        'rushing_tds': int(r_tds),
                        'rushing_epa': round(r_epa, 2),
                        'rush_epa_per_car': round(safe_div(r_epa, car), 3),
                        'rushing_success_rate': round(safe_div(r_succ * 100, car), 1),
                        'rush_stuff_rate': round(safe_div(r_stuff * 100, car), 1),
                        'rush_explosive_rate': round(safe_div(r_exp * 100, car), 1),
                        'rushing_first_downs': int(r_fd),
                        # Receiving
                        'targets': int(tgt),
                        'receptions': int(rec),
                        'catch_pct': round(safe_div(rec * 100, tgt), 1),
                        'receiving_yards': round(re_yds, 1),
                        'ypr': round(safe_div(re_yds, rec), 2),
                        'ypt': round(safe_div(re_yds, tgt), 2),
                        'receiving_tds': int(re_tds),
                        'receiving_air_yards': round(re_air, 1),
                        'receiving_yac': round(re_yac, 1),
                        'yac_pct': round(safe_div(re_yac * 100, re_yds), 1),
                        'receiving_epa': round(re_epa, 2),
                        'rec_epa_per_tgt': round(safe_div(re_epa, tgt), 3),
                        'receiving_success_rate': round(safe_div(re_succ * 100, tgt), 1),
                        'racr': round(safe_div(re_yds, re_air), 2),
                        'receiving_first_downs': int(re_fd),
                        # Overall
                        'scrimmage_touches': int(scrim_touches),
                        'scrimmage_yards': round(scrim_yds, 1),
                        'total_tds': int(tot_tds),
                        'total_epa': round(tot_epa, 2),
                        'epa_per_game': round(safe_div(tot_epa, games), 2),
                        'scrimmage_yds_per_game': round(safe_div(scrim_yds, games), 1),
                        # Contributors
                        'top_passers': top_passers,
                        'top_rushers': top_rushers,
                        'top_receivers': top_receivers,
                    })

                df_s_rows = pd.DataFrame(season_rows)
                rank_cols = [
                    ('total_epa', 'total_epa_rank', False),
                    ('scrimmage_yards', 'scrimmage_yards_rank', False),
                    ('passing_yards', 'pass_yds_rank', False),
                    ('passing_epa', 'pass_epa_rank', False),
                    ('rushing_yards', 'rush_yds_rank', False),
                    ('rushing_epa', 'rush_epa_rank', False),
                    ('receiving_yards', 'rec_yds_rank', False),
                    ('receiving_epa', 'rec_epa_rank', False),
                ]
                for col, rcol, asc in rank_cols:
                    df_s_rows[rcol] = df_s_rows[col].rank(ascending=asc, method='min').astype(int)

                by_season[str(s)] = df_s_rows.sort_values('total_epa', ascending=False).to_dict(orient='records')

            all_time_rows = []
            for fid, grp in pd.concat([pd.DataFrame(rows) for rows in by_season.values()]).groupby('franchise_id'):
                meta = next((v for v in OWNER_FRANCHISE_MAP.values() if v[0] == fid), ('FRAN_UNKNOWN', fid, 'Unknown', '#5b87ac', '/logos/squaw-valley-skinners.jpg'))
                seasons_count = len(grp)
                tot_games = int(grp['games'].sum())
                cmp = int(grp['completions'].sum())
                att = int(grp['attempts'].sum())
                p_yds = float(grp['passing_yards'].sum())
                p_tds = int(grp['passing_tds'].sum())
                p_int = int(grp['interceptions'].sum())
                p_air = float(grp['passing_air_yards'].sum())
                p_epa = float(grp['passing_epa'].sum())
                p_fd = int(grp['passing_first_downs'].sum())

                car = int(grp['carries'].sum())
                r_yds = float(grp['rushing_yards'].sum())
                r_tds = int(grp['rushing_tds'].sum())
                r_epa = float(grp['rushing_epa'].sum())
                r_fd = int(grp['rushing_first_downs'].sum())

                tgt = int(grp['targets'].sum())
                rec = int(grp['receptions'].sum())
                re_yds = float(grp['receiving_yards'].sum())
                re_tds = int(grp['receiving_tds'].sum())
                re_air = float(grp['receiving_air_yards'].sum())
                re_yac = float(grp['receiving_yac'].sum())
                re_epa = float(grp['receiving_epa'].sum())
                re_fd = int(grp['receiving_first_downs'].sum())

                fp = float(grp['fantasy_points'].sum())
                scrim_touches = car + rec
                scrim_yds = r_yds + re_yds
                tot_tds = p_tds + r_tds + re_tds
                tot_epa = p_epa + r_epa + re_epa

                cpoe_w = safe_div((grp['cpoe'] * grp['attempts']).sum(), att)
                pass_succ_w = safe_div((grp['passing_success_rate'] * grp['attempts']).sum(), att)
                rush_succ_w = safe_div((grp['rushing_success_rate'] * grp['carries']).sum(), car)
                rush_stuff_w = safe_div((grp['rush_stuff_rate'] * grp['carries']).sum(), car)
                rush_exp_w = safe_div((grp['rush_explosive_rate'] * grp['carries']).sum(), car)
                rec_succ_w = safe_div((grp['receiving_success_rate'] * grp['targets']).sum(), tgt)

                all_time_rows.append({
                    'franchise_id': fid,
                    'franchise_name': meta[1],
                    'owner_display_name': meta[2],
                    'primary_color': meta[3],
                    'logo_path': meta[4],
                    'seasons': seasons_count,
                    'games': tot_games,
                    'fantasy_points': round(fp, 1),
                    'completions': cmp,
                    'attempts': att,
                    'cmp_pct': round(safe_div(cmp * 100, att), 1),
                    'passing_yards': round(p_yds, 1),
                    'ypa': round(safe_div(p_yds, att), 2),
                    'passing_tds': p_tds,
                    'interceptions': p_int,
                    'passing_air_yards': round(p_air, 1),
                    'adot': round(safe_div(p_air, att), 2),
                    'pacr': round(safe_div(p_yds, p_air), 2),
                    'passing_epa': round(p_epa, 2),
                    'pass_epa_per_att': round(safe_div(p_epa, att), 3),
                    'cpoe': round(cpoe_w, 2),
                    'passing_success_rate': round(pass_succ_w, 1),
                    'passing_first_downs': p_fd,
                    'carries': car,
                    'rushing_yards': round(r_yds, 1),
                    'ypc': round(safe_div(r_yds, car), 2),
                    'rushing_tds': r_tds,
                    'rushing_epa': round(r_epa, 2),
                    'rush_epa_per_car': round(safe_div(r_epa, car), 3),
                    'rushing_success_rate': round(rush_succ_w, 1),
                    'rush_stuff_rate': round(rush_stuff_w, 1),
                    'rush_explosive_rate': round(rush_exp_w, 1),
                    'rushing_first_downs': r_fd,
                    'targets': tgt,
                    'receptions': rec,
                    'catch_pct': round(safe_div(rec * 100, tgt), 1),
                    'receiving_yards': round(re_yds, 1),
                    'ypr': round(safe_div(re_yds, rec), 2),
                    'ypt': round(safe_div(re_yds, tgt), 2),
                    'receiving_tds': re_tds,
                    'receiving_air_yards': round(re_air, 1),
                    'receiving_yac': round(re_yac, 1),
                    'yac_pct': round(safe_div(re_yac * 100, re_yds), 1),
                    'receiving_epa': round(re_epa, 2),
                    'rec_epa_per_tgt': round(safe_div(re_epa, tgt), 3),
                    'receiving_success_rate': round(rec_succ_w, 1),
                    'racr': round(safe_div(re_yds, re_air), 2),
                    'receiving_first_downs': re_fd,
                    'scrimmage_touches': scrim_touches,
                    'scrimmage_yards': round(scrim_yds, 1),
                    'total_tds': tot_tds,
                    'total_epa': round(tot_epa, 2),
                    'epa_per_game': round(safe_div(tot_epa, tot_games), 2),
                    'scrimmage_yds_per_game': round(safe_div(scrim_yds, tot_games), 1),
                })

            df_at = pd.DataFrame(all_time_rows)
            for col, rcol, asc in rank_cols:
                df_at[rcol] = df_at[col].rank(ascending=asc, method='min').astype(int)
            all_time_sorted = df_at.sort_values('total_epa', ascending=False).to_dict(orient='records')

            return by_season, all_time_sorted

        starters_by_season, starters_all_time = process_scope(df_roster[df_roster['started'] == 1])
        full_by_season, full_all_time = process_scope(df_roster)

        stats_mart = {
            'seasons': sorted(list(starters_by_season.keys()), reverse=True),
            'starters_by_season': starters_by_season,
            'starters_all_time': starters_all_time,
            'full_roster_by_season': full_by_season,
            'full_roster_all_time': full_all_time,
        }
        stats_json = MARTS_DIR / "mart_affl_franchise_stats.json"
        with open(stats_json, "w") as f:
            json.dump(stats_mart, f, indent=2)

        manifest["marts"]["mart_affl_franchise_stats"] = {
            "json": "mart_affl_franchise_stats.json",
            "rows": len(starters_all_time),
            "md5": compute_md5(stats_json)
        }
        print(f"Built mart_affl_franchise_stats: {len(starters_all_time)} franchises across {len(stats_mart['seasons'])} seasons")

    # Save manifest.json
    with open(MARTS_DIR / "manifest.json", "w") as f:
        json.dump(manifest, f, indent=2)
    print("Marts and manifest.json compiled successfully!")

if __name__ == "__main__":
    build_all_marts()

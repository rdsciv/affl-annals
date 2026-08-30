"""
Public Analytical Marts Compiler & Manifest Generator for AFFL Savant.
Creates versioned, partitioned Parquet datasets and manifest.json for DuckDB-Wasm and client hydration.
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
    
    print("Building joined public marts...")
    manifest = {
        "version": "1.0.0",
        "generated_at": "2026-08-29T21:00:00Z",
        "league_id": "51418",
        "canonical_era": "2014-2025",
        "scoring_system": "Standard Non-PPR (0 PPR)",
        "marts": {}
    }
    
    # 1. mart_affl_franchise_season
    df_fs = pd.read_sql_query("""
        SELECT 
            ts.season,
            ts.team_id,
            ts.franchise_id,
            f.display_name AS franchise_name,
            f.owner_display_name,
            f.current_logo_path,
            f.primary_color,
            f.secondary_color,
            ts.historical_name,
            ts.historical_abbrev,
            ts.wins,
            ts.losses,
            ts.ties,
            ts.points_for,
            ts.points_against,
            ts.regular_season_rank,
            ts.final_rank,
            ts.is_champion
        FROM dim_affl_team_season ts
        JOIN dim_affl_franchise f ON ts.franchise_id = f.franchise_id
        ORDER BY ts.season DESC, ts.final_rank ASC
    """, conn)
    
    fs_parquet = MARTS_DIR / "mart_affl_franchise_season.parquet"
    fs_json = MARTS_DIR / "mart_affl_franchise_season.json"
    df_fs.to_parquet(fs_parquet, index=False)
    df_fs.to_json(fs_json, orient="records", indent=2)
    
    manifest["marts"]["mart_affl_franchise_season"] = {
        "parquet": "mart_affl_franchise_season.parquet",
        "json": "mart_affl_franchise_season.json",
        "rows": len(df_fs),
        "md5": compute_md5(fs_parquet)
    }
    print(f"Built mart_affl_franchise_season: {len(df_fs)} rows")
    
    # 2. mart_affl_draft_value
    df_draft = pd.read_sql_query("""
        SELECT 
            dp.season,
            dp.round,
            dp.pick_overall,
            dp.team_id,
            dp.franchise_id,
            f.display_name AS franchise_name,
            dp.espn_player_id,
            dp.gsis_id,
            COALESCE(p.display_name, dp.player_name) AS player_name,
            COALESCE(p.position, dp.position) AS position,
            COALESCE(p.headshot_url, '') AS headshot_url,
            COALESCE(p.college, '') AS college,
            dp.auction_price,
            dp.is_keeper,
            COALESCE(SUM(b.affl_points), 0.0) AS total_season_points,
            COUNT(DISTINCT b.week) AS weeks_rostered,
            COALESCE(SUM(b.started), 0) AS weeks_started
        FROM fact_affl_draft_pick dp
        LEFT JOIN dim_affl_franchise f ON dp.franchise_id = f.franchise_id
        LEFT JOIN dim_nfl_player p ON dp.gsis_id = p.gsis_id
        LEFT JOIN bridge_affl_player_week b ON dp.season = b.season AND dp.franchise_id = b.franchise_id AND dp.espn_player_id = b.espn_player_id
        GROUP BY dp.pick_id
        ORDER BY dp.season DESC, dp.pick_overall ASC
    """, conn)
    
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
    
    # 3. mart_affl_player_week & explore partitions
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
        
    print(f"Loaded {len(df_all_nfl_stats)} weekly NFL player rows.")
    
    df_custody = pd.read_sql_query("""
        SELECT 
            b.season,
            b.week,
            b.franchise_id,
            f.display_name AS franchise_name,
            f.current_logo_path AS franchise_logo,
            f.primary_color AS franchise_color,
            ts.historical_name,
            b.team_id,
            b.espn_player_id,
            b.gsis_id,
            b.nfl_team_season_id,
            b.rostered,
            b.started,
            b.slot_code,
            b.slot_evidence,
            b.affl_points,
            COALESCE(p.display_name, rw.player_name) AS player_name,
            COALESCE(p.position, rw.position) AS position,
            COALESCE(p.headshot_url, '') AS headshot_url,
            COALESCE(p.college, '') AS college
        FROM bridge_affl_player_week b
        JOIN dim_affl_franchise f ON b.franchise_id = f.franchise_id
        LEFT JOIN dim_affl_team_season ts ON b.season = ts.season AND b.team_id = ts.team_id
        LEFT JOIN dim_nfl_player p ON b.gsis_id = p.gsis_id
        LEFT JOIN fact_affl_roster_week rw ON b.season = rw.season AND b.week = rw.week AND b.team_id = rw.team_id AND b.espn_player_id = rw.espn_player_id
    """, conn)
    
    num_cols = [
        "pass_yds", "pass_td", "pass_int", "rush_yds", "rush_td", "rush_att",
        "pass_att", "pass_cmp", "receptions", "rec_yds", "rec_td", "targets",
        "target_share", "air_yards_share", "pass_air_yds", "rec_air_yds", "rec_yac",
        "pass_epa", "rush_epa", "rec_epa"
    ]
    str_cols = ["nfl_team", "opponent", "slot_code", "historical_name", "college", "headshot_url", "gsis_id", "nfl_team_season_id"]

    if not df_all_nfl_stats.empty and "player_id" in df_all_nfl_stats.columns:
        nfl_cols = {
            "player_id": "gsis_id",
            "recent_team": "nfl_team",
            "opponent_team": "opponent",
            "passing_yards": "pass_yds",
            "passing_tds": "pass_td",
            "interceptions": "pass_int",
            "rushing_yards": "rush_yds",
            "rushing_tds": "rush_td",
            "rushing_attempts": "rush_att",
            "attempts": "pass_att",
            "completions": "pass_cmp",
            "receptions": "receptions",
            "receiving_yards": "rec_yds",
            "receiving_tds": "rec_td",
            "targets": "targets",
            "target_share": "target_share",
            "air_yards_share": "air_yards_share",
            "passing_air_yards": "pass_air_yds",
            "receiving_air_yards": "rec_air_yds",
            "receiving_yards_after_catch": "rec_yac",
            "passing_epa": "pass_epa",
            "rushing_epa": "rush_epa",
            "receiving_epa": "rec_epa",
        }
        keep_nfl_cols = ["season", "week", "player_id"] + [c for c in nfl_cols.keys() if c in df_all_nfl_stats.columns and c != "player_id"]
        df_nfl_sub = df_all_nfl_stats[keep_nfl_cols].rename(columns=nfl_cols)
        
        df_merged_pw = pd.merge(
            df_custody,
            df_nfl_sub,
            how="left",
            on=["season", "week", "gsis_id"]
        )
    else:
        df_merged_pw = df_custody.copy()
        
    for c in num_cols:
        if c not in df_merged_pw.columns:
            df_merged_pw[c] = 0.0
        else:
            df_merged_pw[c] = pd.to_numeric(df_merged_pw[c], errors="coerce").fillna(0.0)

    for c in str_cols:
        if c not in df_merged_pw.columns:
            df_merged_pw[c] = ""
        else:
            df_merged_pw[c] = df_merged_pw[c].fillna("").astype(str)

    # Reconcile standard non-PPR fantasy points
    def resolve_points(row):
        pts = float(row.get("affl_points") or 0.0)
        if pts == 0.0 and row.get("position") != "D/ST":
            calc_pts = calc_non_ppr_points(
                pass_yds=float(row.get("pass_yds", 0)),
                pass_td=float(row.get("pass_td", 0)),
                pass_int=float(row.get("pass_int", 0)),
                rush_yds=float(row.get("rush_yds", 0)),
                rush_td=float(row.get("rush_td", 0)),
                rec_yds=float(row.get("rec_yds", 0)),
                rec_td=float(row.get("rec_td", 0)),
            )
            return round(calc_pts, 1)
        return round(pts, 1)

    df_merged_pw["affl_points"] = df_merged_pw.apply(resolve_points, axis=1)

    df_merged_pw["wopr"] = df_merged_pw.apply(
        lambda r: calc_wopr(r.get("target_share", 0), r.get("air_yards_share", 0)),
        axis=1
    )
    df_merged_pw["xfp"] = df_merged_pw.apply(
        lambda r: calc_expected_fp(
            position=r.get("position", ""),
            pass_att=r.get("pass_att", 0),
            rush_att=r.get("rush_att", 0),
            targets=r.get("targets", 0),
            air_yards=r.get("rec_air_yds", 0)
        ),
        axis=1
    )
    df_merged_pw["fpoe"] = df_merged_pw["affl_points"] - df_merged_pw["xfp"]
    df_merged_pw["custody_par"] = df_merged_pw.apply(
        lambda r: calc_custody_par(r["affl_points"], 1, r.get("position", "")),
        axis=1
    )
    
    pw_parquet = MARTS_DIR / "mart_affl_player_week.parquet"
    df_merged_pw.to_parquet(pw_parquet, index=False)
    
    manifest["marts"]["mart_affl_player_week"] = {
        "parquet": "mart_affl_player_week.parquet",
        "rows": len(df_merged_pw),
        "md5": compute_md5(pw_parquet)
    }
    print(f"Built mart_affl_player_week: {len(df_merged_pw)} rows")
    
    manifest["explore_player_week_partitions"] = {}
    for season, season_df in df_merged_pw.groupby("season"):
        part_file = MARTS_DIR / "explore_player_week" / f"season_{season}.parquet"
        season_df.to_parquet(part_file, index=False)
        manifest["explore_player_week_partitions"][str(season)] = {
            "file": f"explore_player_week/season_{season}.parquet",
            "rows": len(season_df),
            "md5": compute_md5(part_file)
        }
    print("Partitioned explore_player_week by season.")
    
    # 4. mart_affl_player_season_custody
    group_keys = ["season", "franchise_id", "franchise_name", "franchise_logo", "franchise_color", "gsis_id", "player_name", "position", "headshot_url", "college"]
    for k in group_keys:
        df_merged_pw[k] = df_merged_pw[k].fillna("").astype(str) if k != "season" else df_merged_pw[k]

    df_custody_season = df_merged_pw.groupby(
        group_keys,
        as_index=False
    ).agg({
        "rostered": "sum",
        "started": "sum",
        "affl_points": "sum",
        "xfp": "sum",
        "fpoe": "sum",
        "custody_par": "sum",
        "targets": "sum",
        "receptions": "sum",
        "rec_yds": "sum",
        "rec_td": "sum",
        "rush_att": "sum",
        "rush_yds": "sum",
        "rush_td": "sum",
        "pass_att": "sum",
        "pass_cmp": "sum",
        "pass_yds": "sum",
        "pass_td": "sum",
        "pass_int": "sum"
    }).rename(columns={
        "rostered": "weeks_rostered",
        "started": "weeks_started"
    })
    
    # Calculate bench points
    df_bench = df_merged_pw[df_merged_pw["started"] == 0].groupby(group_keys, as_index=False)["affl_points"].sum().rename(columns={"affl_points": "bench_points"})
    df_custody_season = pd.merge(df_custody_season, df_bench, on=group_keys, how="left")
    df_custody_season["bench_points"] = df_custody_season["bench_points"].fillna(0.0)
    
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
    print(f"Built mart_affl_player_season_custody: {len(df_custody_season)} rows")
    
    # 5. Play Actor Explore Marts
    print("Building fact_nfl_play_actor and explore_play_actor partitions...")
    manifest["explore_play_actor_partitions"] = {}
    pbp_files = sorted(list((RAW_NFL_DIR / "pbp").glob("play_by_play_*.parquet")))
    
    df_custody_dedup = df_custody.dropna(subset=["gsis_id"]).drop_duplicates(subset=["season", "week", "gsis_id"])
    custody_lookup = df_custody_dedup.set_index(["season", "week", "gsis_id"])[["franchise_id", "franchise_name", "started", "rostered"]].to_dict("index")
    
    for pf in pbp_files:
        season_num = int(pf.stem.replace("play_by_play_", ""))
        df_pbp = pd.read_parquet(pf)
        
        actors = []
        actor_cols = [
            ("passer_id", "passer"),
            ("rusher_id", "rusher"),
            ("receiver_id", "target"),
        ]
        
        for id_col, role in actor_cols:
            if id_col in df_pbp.columns:
                sub = df_pbp.dropna(subset=[id_col]).copy()
                sub["actor_role"] = role
                sub["gsis_id"] = sub[id_col].astype(str)
                actors.append(sub)
        
        if actors:
            df_actors = pd.concat(actors, ignore_index=True)
            
            keep_cols = [
                "play_id", "game_id", "season", "week", "actor_role", "gsis_id",
                "posteam", "defteam", "down", "ydstogo", "yardline_100", "qtr",
                "score_differential", "shotgun", "no_huddle", "epa", "success",
                "air_yards", "yards_after_catch", "touchdown", "interception", "fumble_lost"
            ]
            valid_cols = [c for c in keep_cols if c in df_actors.columns]
            df_lean = df_actors[valid_cols].copy()
            
            # Map custody using zip / map for speed
            fids = []
            fnames = []
            starteds = []
            rostereds = []
            for s, w, g in zip(df_lean["season"], df_lean["week"], df_lean["gsis_id"]):
                c = custody_lookup.get((s, w, g))
                if c:
                    fids.append(str(c["franchise_id"]))
                    fnames.append(str(c["franchise_name"]))
                    starteds.append(int(c["started"]))
                    rostereds.append(int(c["rostered"]))
                else:
                    fids.append("")
                    fnames.append("")
                    starteds.append(0)
                    rostereds.append(0)
            
            df_lean["affl_franchise_id"] = fids
            df_lean["affl_franchise_name"] = fnames
            df_lean["affl_started"] = starteds
            df_lean["affl_rostered"] = rostereds
            
            part_actor_file = MARTS_DIR / "explore_play_actor" / f"play_actor_{season_num}.parquet"
            df_lean.to_parquet(part_actor_file, index=False)
            manifest["explore_play_actor_partitions"][str(season_num)] = {
                "file": f"explore_play_actor/play_actor_{season_num}.parquet",
                "rows": len(df_lean),
                "md5": compute_md5(part_actor_file)
            }
            print(f"Season {season_num} play actors: {len(df_lean)} rows")
    
    manifest_path = MARTS_DIR / "manifest.json"
    with open(manifest_path, "w") as f:
        json.dump(manifest, f, indent=2)
    print("Marts and manifest.json compiled successfully!")
    
    conn.close()

if __name__ == "__main__":
    build_all_marts()

"""
Identity Bridge Engine: Links ESPN player IDs to GSIS IDs.
Separates D/ST rows and resolves player identities deterministically.
"""

import sqlite3
import pandas as pd
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = ROOT_DIR / "data"
DB_PATH = DATA_DIR / "affl.db"
PLAYERS_PARQUET = DATA_DIR / "raw_nfl" / "players.parquet"

def build_bridge():
    print("Building bridge_player_external_id and updating bridge_affl_player_week...")
    df_players = pd.read_parquet(PLAYERS_PARQUET)
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # 1. Populate dim_nfl_player from nflverse
    cursor.execute("DELETE FROM dim_nfl_player")
    player_records = []
    for _, row in df_players.iterrows():
        gid = row.get("gsis_id")
        if not gid or pd.isna(gid):
            continue
        player_records.append((
            str(gid),
            str(row.get("display_name") or ""),
            str(row.get("first_name") or ""),
            str(row.get("last_name") or ""),
            str(row.get("position") or "UNKNOWN"),
            str(row.get("birth_date") or ""),
            str(row.get("college_name") or ""),
            int(row["draft_year"]) if pd.notna(row.get("draft_year")) else None,
            int(row["draft_round"]) if pd.notna(row.get("draft_round")) else None,
            int(row["draft_pick"]) if pd.notna(row.get("draft_pick")) else None,
            str(row.get("height") or ""),
            int(row["weight"]) if pd.notna(row.get("weight")) else None,
            str(row.get("headshot") or "")
        ))
    
    cursor.executemany("""
        INSERT OR REPLACE INTO dim_nfl_player (
            gsis_id, display_name, first_name, last_name, position,
            birth_date, college, draft_year, draft_round, draft_pick,
            height, weight, headshot_url
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, player_records)
    conn.commit()
    print(f"Populated {len(player_records)} NFL players into dim_nfl_player.")
    
    # 2. Build bridge_player_external_id
    cursor.execute("DELETE FROM bridge_player_external_id")
    bridge_records = []
    
    # Map from espn_id in players dataframe
    df_espn = df_players.dropna(subset=["espn_id", "gsis_id"])
    for _, row in df_espn.iterrows():
        espn_id = str(int(row["espn_id"])) if isinstance(row["espn_id"], (int, float)) else str(row["espn_id"])
        gsis_id = str(row["gsis_id"])
        pname = str(row.get("display_name") or "")
        pos = str(row.get("position") or "")
        
        bridge_records.append((
            "espn",
            espn_id,
            gsis_id,
            pname,
            pos,
            "DirectID",
            1.0,
            "Approved",
            2014,
            2026
        ))
    
    cursor.executemany("""
        INSERT OR REPLACE INTO bridge_player_external_id (
            provider, external_id, gsis_id, player_name, position,
            match_method, match_confidence, review_status,
            first_valid_season, last_valid_season
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, bridge_records)
    conn.commit()
    print(f"Populated {len(bridge_records)} external ID mappings in bridge_player_external_id.")
    
    # 3. Update bridge_affl_player_week and fact_affl_roster_week with gsis_id
    cursor.execute("""
        UPDATE bridge_affl_player_week
        SET gsis_id = (
            SELECT b.gsis_id FROM bridge_player_external_id b
            WHERE b.provider = 'espn' AND b.external_id = bridge_affl_player_week.espn_player_id
        )
        WHERE nfl_team_season_id IS NULL
    """)
    
    cursor.execute("""
        UPDATE fact_affl_roster_week
        SET gsis_id = (
            SELECT b.gsis_id FROM bridge_player_external_id b
            WHERE b.provider = 'espn' AND b.external_id = fact_affl_roster_week.espn_player_id
        )
    """)
    
    cursor.execute("""
        UPDATE fact_affl_draft_pick
        SET gsis_id = (
            SELECT b.gsis_id FROM bridge_player_external_id b
            WHERE b.provider = 'espn' AND b.external_id = fact_affl_draft_pick.espn_player_id
        )
    """)
    
    conn.commit()
    
    # Coverage check
    cursor.execute("SELECT COUNT(*), COUNT(gsis_id) FROM bridge_affl_player_week WHERE nfl_team_season_id IS NULL")
    total_non_dst, matched_non_dst = cursor.fetchone()
    rate = (matched_non_dst / total_non_dst * 100) if total_non_dst > 0 else 0
    print(f"Player-week non-DST match coverage: {matched_non_dst} / {total_non_dst} ({rate:.2f}%)")
    
    conn.close()

if __name__ == "__main__":
    build_bridge()

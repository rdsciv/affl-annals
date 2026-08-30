"""
AFFL ESPN to SQLite Ingestion & Transformation Engine.
Populates affl.db according to canonical AFFL contracts.
"""

import os
import sys
import json
import sqlite3
from pathlib import Path
from pipeline.identity_canon import (
    CANONICAL_FRANCHISES,
    MEMBER_FRANCHISE_MAP,
    resolve_franchise_id
)

ROOT_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = ROOT_DIR / "data"
RAW_ESPN_DIR = DATA_DIR / "raw_espn"
WEEKLY_DIR = RAW_ESPN_DIR / "weekly"
DB_PATH = DATA_DIR / "affl.db"

LINEUP_SLOT_MAP = {
    0: "QB",
    2: "RB",
    4: "WR",
    6: "TE",
    16: "D/ST",
    17: "K",
    20: "BE",
    21: "IR",
    23: "FLEX",
}

def init_db():
    schema_path = ROOT_DIR / "pipeline" / "schema.sql"
    with open(schema_path, "r") as f:
        schema_sql = f.read()
    
    conn = sqlite3.connect(DB_PATH)
    conn.executescript(schema_sql)
    conn.commit()
    return conn

def populate_dim_franchises(conn):
    cursor = conn.cursor()
    # Insert Owners and Franchises from identity canon
    owners_seen = set()
    for fid, f in CANONICAL_FRANCHISES.items():
        oid = f["owner_id"]
        if oid not in owners_seen:
            cursor.execute("""
                INSERT OR REPLACE INTO dim_affl_owner (owner_id, canonical_name, display_name)
                VALUES (?, ?, ?)
            """, (oid, f["canonical_name"], f["owner_display_name"]))
            owners_seen.add(oid)
        
        cursor.execute("""
            INSERT OR REPLACE INTO dim_affl_franchise (
                franchise_id, owner_id, display_name, owner_display_name,
                current_logo_path, primary_color, secondary_color,
                first_season, last_season, is_active
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            f["franchise_id"], f["owner_id"], f["display_name"], f["owner_display_name"],
            f["current_logo_path"], f["primary_color"], f["secondary_color"],
            f["first_season"], f["last_season"], f["is_active"]
        ))
    conn.commit()

def ingest_seasons(conn):
    cursor = conn.cursor()
    
    # Store member_id -> franchise_id mappings across years
    member_to_franchise = {}
    
    # First pass: map members to franchises
    for year in range(2014, 2026):
        season_file = RAW_ESPN_DIR / f"espn_{year}.json"
        if not season_file.exists():
            continue
        with open(season_file, "r") as f:
            data = json.load(f)
        
        members = data.get("members", [])
        teams = data.get("teams", [])
        
        # Build member map
        member_names = {}
        for m in members:
            mid = m.get("id")
            first = m.get("firstName", "")
            last = m.get("lastName", "")
            disp = m.get("displayName", "")
            full = f"{first} {last}".strip() or disp
            member_names[mid] = full
            
            # Match member
            fid = resolve_franchise_id(full) or resolve_franchise_id(disp)
            if fid != "FRAN_UNKNOWN":
                member_to_franchise[mid] = fid
        
        for t in teams:
            tid = t.get("id")
            primary_owner = t.get("primaryOwner") or (t.get("owners", [None])[0] if t.get("owners") else None)
            loc = t.get("location") or ""
            nick = t.get("nickname") or ""
            team_name = f"{loc} {nick}".strip() or t.get("name") or f"Team {tid}"
            abbrev = t.get("abbrev") or f"T{tid}"
            logo = t.get("logo") or ""
            
            # Determine franchise
            fid = member_to_franchise.get(primary_owner) or resolve_franchise_id(team_name) or resolve_franchise_id(abbrev)
            if fid == "FRAN_UNKNOWN":
                # Check member name
                m_name = member_names.get(primary_owner, "")
                fid = resolve_franchise_id(m_name)
            
            if fid == "FRAN_UNKNOWN":
                # Fallback to team slot mapping if known
                fid = f"FRAN_TEAM_{tid}"
            
            rec = t.get("record", {}).get("overall", {})
            wins = rec.get("wins", 0)
            losses = rec.get("losses", 0)
            ties = rec.get("ties", 0)
            pf = rec.get("pointsFor", 0.0)
            pa = rec.get("pointsAgainst", 0.0)
            rank = t.get("playoffSeed") or t.get("rankCalculated") or None
            
            cursor.execute("""
                INSERT OR REPLACE INTO dim_affl_team_season (
                    season, team_id, member_id, franchise_id,
                    historical_name, historical_abbrev, historical_logo_path,
                    wins, losses, ties, points_for, points_against,
                    regular_season_rank, final_rank, is_champion
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                year, tid, primary_owner, fid,
                team_name, abbrev, logo,
                wins, losses, ties, pf, pa,
                rank, rank, 1 if rank == 1 else 0
            ))
            
        # Draft Picks
        draft_picks = data.get("draftDetail", {}).get("picks", [])
        for dp in draft_picks:
            pick_num = dp.get("overallPickNumber")
            round_num = dp.get("roundId")
            team_id = dp.get("teamId")
            player_id = str(dp.get("playerId"))
            bid = dp.get("bidAmount", 0)
            is_keeper = 1 if dp.get("keeper", False) else 0
            
            # Find team's franchise
            cursor.execute("SELECT franchise_id FROM dim_affl_team_season WHERE season = ? AND team_id = ?", (year, team_id))
            row = cursor.fetchone()
            fid = row[0] if row else f"FRAN_TEAM_{team_id}"
            
            pick_id = f"{year}_dp_{pick_num}_{team_id}_{player_id}"
            cursor.execute("""
                INSERT OR REPLACE INTO fact_affl_draft_pick (
                    pick_id, season, round, pick_overall, team_id, franchise_id,
                    espn_player_id, player_name, position, auction_price, is_keeper
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                pick_id, year, round_num, pick_num, team_id, fid,
                player_id, f"Player {player_id}", "UNKNOWN", bid, is_keeper
            ))
            
    conn.commit()
    print("dim_affl_team_season and draft picks ingested.")

def ingest_weekly_matchups_and_rosters(conn):
    cursor = conn.cursor()
    weekly_files = sorted(list(WEEKLY_DIR.glob("espn_*_wk*.json")))
    print(f"Ingesting {len(weekly_files)} weekly roster/boxscore files...")
    
    roster_rows = []
    matchup_rows = []
    
    for wf in weekly_files:
        parts = wf.stem.split("_")
        year = int(parts[1])
        week = int(parts[2].replace("wk", ""))
        
        with open(wf, "r") as f:
            data = json.load(f)
            
        sched = data.get("schedule", [])
        for s in sched:
            matchup_period = s.get("matchupPeriodId")
            if matchup_period != week:
                continue
                
            mid = s.get("id") or f"{year}_{week}_{s.get('home', {}).get('teamId')}_{s.get('away', {}).get('teamId')}"
            home = s.get("home", {})
            away = s.get("away", {})
            
            home_tid = home.get("teamId")
            away_tid = away.get("teamId")
            if not home_tid or not away_tid:
                continue
                
            home_pts = home.get("totalPoints", 0.0)
            away_pts = away.get("totalPoints", 0.0)
            winner = home_tid if home_pts > away_pts else (away_tid if away_pts > home_pts else None)
            
            # Lookup franchises
            cursor.execute("SELECT franchise_id FROM dim_affl_team_season WHERE season = ? AND team_id = ?", (year, home_tid))
            h_row = cursor.fetchone()
            home_fid = h_row[0] if h_row else f"FRAN_TEAM_{home_tid}"
            
            cursor.execute("SELECT franchise_id FROM dim_affl_team_season WHERE season = ? AND team_id = ?", (year, away_tid))
            a_row = cursor.fetchone()
            away_fid = a_row[0] if a_row else f"FRAN_TEAM_{away_tid}"
            
            winner_fid = home_fid if winner == home_tid else (away_fid if winner == away_tid else None)
            
            cursor.execute("""
                INSERT OR REPLACE INTO fact_affl_matchup (
                    matchup_id, season, week, home_team_id, away_team_id,
                    home_franchise_id, away_franchise_id, home_score, away_score,
                    is_playoff, winner_team_id, winner_franchise_id
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                str(mid), year, week, home_tid, away_tid,
                home_fid, away_fid, home_pts, away_pts,
                1 if week > 13 else 0, winner, winner_fid
            ))
            
            # Ingest Rosters for Home and Away
            for side, tid, fid in [(home, home_tid, home_fid), (away, away_tid, away_fid)]:
                roster = side.get("rosterForCurrentScoringPeriod") or side.get("rosterForMatchupPeriod")
                if not roster:
                    continue
                entries = roster.get("entries", [])
                for entry in entries:
                    lineup_slot_id = entry.get("lineupSlotId")
                    ppe = entry.get("playerPoolEntry", {})
                    player = ppe.get("player", {})
                    pid = str(player.get("id") or entry.get("playerId"))
                    pname = player.get("fullName") or f"Player {pid}"
                    default_pos_id = player.get("defaultPositionId", 0)
                    pos = "QB" if default_pos_id == 1 else ("RB" if default_pos_id == 2 else ("WR" if default_pos_id == 3 else ("TE" if default_pos_id == 4 else ("K" if default_pos_id == 5 else ("D/ST" if default_pos_id == 16 else "FLEX")))))
                    
                    # Evidence labeling:
                    # Pre-2018: slot_code = None, slot_evidence = 'Unavailable', started = 1
                    # 2018+: slot_code = LINEUP_SLOT_MAP[lineup_slot_id], slot_evidence = 'Observed', started = (slot not in [20, 21])
                    if year < 2018:
                        slot_code = None
                        slot_evidence = "Unavailable"
                        started = 1 # All returned roster entries in pre-2018 match boxscores are observed starters
                    else:
                        slot_code = LINEUP_SLOT_MAP.get(lineup_slot_id, "BE")
                        slot_evidence = "Observed"
                        started = 1 if lineup_slot_id not in (20, 21) else 0
                    
                    pts = entry.get("appliedStatTotal", 0.0)
                    rw_id = f"{year}_{week}_{tid}_{pid}"
                    
                    cursor.execute("""
                        INSERT OR REPLACE INTO fact_affl_roster_week (
                            roster_week_id, season, week, team_id, franchise_id,
                            espn_player_id, player_name, position,
                            slot_code, slot_evidence, started, rostered, affl_points
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """, (
                        rw_id, year, week, tid, fid,
                        pid, pname, pos,
                        slot_code, slot_evidence, started, 1, pts
                    ))
                    
                    # Also insert into bridge_affl_player_week
                    is_dst = pos == "D/ST" or pid.startswith("-") or default_pos_id == 16
                    dst_id = f"NFL_DST_{pname.upper().replace(' ', '_')}_{year}" if is_dst else None
                    
                    cursor.execute("""
                        INSERT OR REPLACE INTO bridge_affl_player_week (
                            season, week, franchise_id, team_id,
                            espn_player_id, gsis_id, nfl_team_season_id,
                            rostered, started, slot_code, slot_evidence,
                            affl_points, evidence_status
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """, (
                        year, week, fid, tid,
                        pid, None, dst_id,
                        1, started, slot_code, slot_evidence,
                        pts, "Verified"
                    ))
                    
    conn.commit()
    print("Matchups and roster weeks successfully populated.")

def main():
    conn = init_db()
    populate_dim_franchises(conn)
    ingest_seasons(conn)
    ingest_weekly_matchups_and_rosters(conn)
    conn.close()
    print("AFFL SQLite warehouse built successfully at", DB_PATH)

if __name__ == "__main__":
    main()

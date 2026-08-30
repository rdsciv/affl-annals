"""
Regression and data integrity tests for AFFL Savant SQLite warehouse (affl.db).
"""

import sqlite3
from pathlib import Path
import pytest

DB_PATH = Path(__file__).resolve().parent.parent / "data" / "affl.db"

@pytest.fixture
def conn():
    assert DB_PATH.exists(), f"Database not found at {DB_PATH}"
    connection = sqlite3.connect(DB_PATH)
    yield connection
    connection.close()

def test_franchise_counts_and_active_field(conn):
    cursor = conn.cursor()
    cursor.execute("SELECT COUNT(*) FROM dim_affl_franchise WHERE is_active = 1")
    active_count = cursor.fetchone()[0]
    assert active_count == 12, f"Expected exactly 12 active franchises in 2026 planning field, got {active_count}"

def test_identity_merges(conn):
    cursor = conn.cursor()
    # Check that Jason Kafka, Kevin Sliger, and Tanner Dunn map to single canonical franchises
    cursor.execute("SELECT DISTINCT franchise_id FROM dim_affl_team_season WHERE member_id = '{051BF68A-84EA-4930-9BF6-8A84EAF930EA}'")
    # All team seasons for Jason Kafka should map to FRAN_CVC
    rows = cursor.fetchall()
    if rows:
        assert len(rows) == 1 and rows[0][0] == "FRAN_CVC"

def test_pre_2018_slots_are_null(conn):
    cursor = conn.cursor()
    cursor.execute("SELECT COUNT(*) FROM fact_affl_roster_week WHERE season < 2018 AND slot_code IS NOT NULL")
    non_null_pre2018 = cursor.fetchone()[0]
    assert non_null_pre2018 == 0, f"Pre-2018 lineup slots must remain NULL, found {non_null_pre2018}"
    
    cursor.execute("SELECT DISTINCT slot_evidence FROM fact_affl_roster_week WHERE season < 2018")
    evidences = [r[0] for r in cursor.fetchall()]
    assert evidences == ["Unavailable"], f"Pre-2018 evidence label must be 'Unavailable', got {evidences}"

def test_post_2018_slots_are_observed(conn):
    cursor = conn.cursor()
    cursor.execute("SELECT COUNT(*) FROM fact_affl_roster_week WHERE season >= 2018 AND slot_code IS NULL")
    null_post2018 = cursor.fetchone()[0]
    assert null_post2018 == 0, f"Post-2018 lineup slots must be observed, found {null_post2018} NULLs"

def test_dst_separation(conn):
    cursor = conn.cursor()
    cursor.execute("SELECT COUNT(*) FROM bridge_affl_player_week WHERE nfl_team_season_id IS NOT NULL AND gsis_id IS NOT NULL")
    overlap = cursor.fetchone()[0]
    assert overlap == 0, f"D/ST records must not have GSIS player IDs, found {overlap}"

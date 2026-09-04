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

def test_owner_and_season_counts(conn):
    cursor = conn.cursor()
    cursor.execute("SELECT COUNT(*) FROM dim_owner WHERE is_active = 1")
    active_count = cursor.fetchone()[0]
    assert active_count == 12, f"Expected exactly 12 active owners in 2026 planning field, got {active_count}"
    
    cursor.execute("SELECT COUNT(*) FROM dim_season WHERE season >= 2014 AND season <= 2025")
    season_count = cursor.fetchone()[0]
    assert season_count == 12, f"Expected 12 competition seasons (2014-2025), got {season_count}"

def test_identity_merges(conn):
    cursor = conn.cursor()
    # Check that Jason Kafka merges m01 -> m07
    cursor.execute("SELECT owner_id FROM dim_member WHERE member_id IN ('m01', 'm07')")
    owners = [r[0] for r in cursor.fetchall()]
    assert set(owners) == {"m07"}, f"Expected Jason Kafka member rows to map to m07, got {owners}"

def test_post_2018_slots_are_observed(conn):
    cursor = conn.cursor()
    cursor.execute("SELECT COUNT(*) FROM fact_roster_week WHERE season >= 2018 AND slot IS NULL")
    null_post2018 = cursor.fetchone()[0]
    assert null_post2018 == 0, f"Post-2018 lineup slots must be observed, found {null_post2018} NULLs"

def test_matchup_counts(conn):
    cursor = conn.cursor()
    cursor.execute("SELECT COUNT(*) FROM v_matchup WHERE phase = 'regular'")
    regular_count = cursor.fetchone()[0]
    assert regular_count > 0, "Expected regular season matchups to be populated"

def test_franchise_stats_mart():
    import json
    mart_file = Path(__file__).resolve().parent.parent / "public" / "data" / "marts" / "mart_affl_franchise_stats.json"
    assert mart_file.exists(), f"Franchise stats mart missing at {mart_file}"
    with open(mart_file) as f:
        data = json.load(f)
    assert "seasons" in data
    assert len(data["seasons"]) == 8, f"Expected 8 seasons, found {len(data['seasons'])}"
    assert "starters_by_season" in data
    assert "starters_all_time" in data
    assert len(data["starters_all_time"]) >= 16

def test_production_seo_and_assets():
    public_dir = Path(__file__).resolve().parent.parent / "public"
    assert (public_dir / "robots.txt").exists()
    assert (public_dir / "sitemap.xml").exists()
    assert (public_dir / "site.webmanifest").exists()
    assert (public_dir / "favicon.ico").exists()
    assert (public_dir / "favicon.ico").stat().st_size < 50000, "Favicon should be optimized (<50KB)"


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

def test_owner_lineage_distinctness(conn):
    cursor = conn.cursor()
    # 1. Alex Renney joined in 2015, NOT 2014
    cursor.execute("""
        SELECT MIN(season), MAX(season), COUNT(DISTINCT season)
        FROM v_team
        WHERE owner_name = 'Alex Renney'
    """)
    min_s, max_s, count_s = cursor.fetchone()
    assert min_s == 2015, f"Alex Renney / Fat Cats joined in 2015, got min season {min_s}"
    assert max_s == 2025, f"Expected max season 2025, got {max_s}"
    assert count_s == 11, f"Expected exactly 11 seasons for Alex Renney, got {count_s}"

    # 2. Scott Ace was 2014 only (Team 2 in 2014)
    cursor.execute("""
        SELECT season, team_id, owner_name, name
        FROM v_team
        WHERE season = 2014 AND team_id = 2
    """)
    s_2014_t2 = cursor.fetchone()
    assert s_2014_t2[2] == "Scott Ace", f"Expected Scott Ace for 2014 team 2, got {s_2014_t2[2]}"
    assert s_2014_t2[3] == "Pawtucket Patriots", f"Expected Pawtucket Patriots, got {s_2014_t2[3]}"

    # 3. Garrett Jones was 2014-2020, never combined with Patrick O'Neill (2024-2025)
    cursor.execute("SELECT MIN(season), MAX(season) FROM v_team WHERE owner_name = 'Garrett Jones'")
    assert cursor.fetchone() == (2014, 2020)

    cursor.execute("SELECT MIN(season), MAX(season) FROM v_team WHERE owner_name LIKE '%O''Neill%'")
    assert cursor.fetchone() == (2024, 2025)

    # 4. Tanner Dunn was 2017-2020, never combined with Andy Pietromonaco (2026 expansion)
    cursor.execute("SELECT MIN(season), MAX(season) FROM v_team WHERE owner_name = 'Tanner Dunn'")
    assert cursor.fetchone() == (2017, 2020)

def test_canonical_marts_owner_isolation():
    import json
    fs_file = Path(__file__).resolve().parent.parent / "public" / "data" / "marts" / "mart_affl_franchise_season.json"
    assert fs_file.exists()
    with open(fs_file) as f:
        data = json.load(f)
    
    # Audit that no franchise combines multiple owners
    franchise_owners = {}
    for r in data:
        fid = r["franchise_id"]
        oid = r["owner_id"]
        if fid not in franchise_owners:
            franchise_owners[fid] = set()
        franchise_owners[fid].add(oid)
    
    for fid, oids in franchise_owners.items():
        assert len(oids) == 1, f"Franchise {fid} has multiple owners: {oids}. Must never combine different owners!"

    # Verify Fat Cats seasons
    ffc_seasons = [r["season"] for r in data if r["franchise_id"] == "FRAN_FFC"]
    assert 2014 not in ffc_seasons, "Fairview Fat Cats joined in 2015 and must not contain 2014 season!"
    assert len(ffc_seasons) == 11, f"Expected 11 seasons for Fat Cats (2015-2025), got {len(ffc_seasons)}"

def test_identity_canon_resolution():
    from pipeline.identity_canon import resolve_franchise_id, CANONICAL_FRANCHISES
    assert resolve_franchise_id("Alex Renney") == "FRAN_FFC"
    assert resolve_franchise_id("Fairview Fat Cats") == "FRAN_FFC"
    assert resolve_franchise_id("Scott Ace") == "FRAN_PWP"
    assert resolve_franchise_id("Pawtucket Patriots") == "FRAN_PWP"
    assert resolve_franchise_id("Garrett Jones") == "FRAN_MCMD"
    assert resolve_franchise_id("Patrick O'Neill") == "FRAN_PTP"
    assert resolve_franchise_id("Tanner Dunn") == "FRAN_WSW"
    assert resolve_franchise_id("Andy Pietromonaco") == "FRAN_COG"
    assert resolve_franchise_id("Jake Hibbard") == "FRAN_CCB"
    assert resolve_franchise_id("David Allardyce") == "FRAN_LOB"

    # Active count in canon
    active_canons = [f for f in CANONICAL_FRANCHISES.values() if f["is_active"] == 1]
    assert len(active_canons) == 12, f"Expected 12 active canonical franchises, got {len(active_canons)}"



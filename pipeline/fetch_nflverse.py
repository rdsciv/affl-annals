"""
NFL Ingestion Script: Pulls nflverse player directory, weekly stats, rosters, and play-by-play (2014-2025).
"""

import os
import sys
import time
import requests
import pyarrow.parquet as pq
import pandas as pd
from pathlib import Path

DATA_DIR = Path(__file__).resolve().parent.parent / "data"
RAW_NFL_DIR = DATA_DIR / "raw_nfl"

def ensure_dirs():
    RAW_NFL_DIR.mkdir(parents=True, exist_ok=True)
    (RAW_NFL_DIR / "pbp").mkdir(exist_ok=True)
    (RAW_NFL_DIR / "stats").mkdir(exist_ok=True)

def download_file(url: str, dest: Path, min_size_kb: int = 10):
    if dest.exists() and dest.stat().st_size > min_size_kb * 1024:
        print(f"Already exists: {dest.name} ({dest.stat().st_size // 1024} KB)")
        return True
    print(f"Downloading {url} -> {dest.name}...")
    headers = {"User-Agent": "Mozilla/5.0"}
    try:
        r = requests.get(url, headers=headers, stream=True, timeout=60)
        if r.status_code == 200:
            with open(dest, "wb") as f:
                for chunk in r.iter_content(chunk_size=65536):
                    f.write(chunk)
            print(f"Downloaded {dest.name} ({dest.stat().st_size // 1024} KB)")
            return True
        else:
            print(f"Failed to download {url}: HTTP {r.status_code}")
            return False
    except Exception as e:
        print(f"Error downloading {url}: {e}")
        return False

def fetch_players():
    # nflverse players master file
    url = "https://github.com/nflverse/nflverse-data/releases/download/players/players.parquet"
    dest = RAW_NFL_DIR / "players.parquet"
    download_file(url, dest)

def fetch_weekly_stats():
    # player_stats weekly parquet (or per-season)
    # nflverse has player_stats.parquet or seasonal player_stats_20XX.parquet
    for year in range(2014, 2026):
        url = f"https://github.com/nflverse/nflverse-data/releases/download/player_stats/player_stats_{year}.parquet"
        dest = RAW_NFL_DIR / "stats" / f"player_stats_{year}.parquet"
        download_file(url, dest)

def fetch_pbp():
    # Play-by-play per season (2014-2025)
    for year in range(2014, 2026):
        url = f"https://github.com/nflverse/nflverse-data/releases/download/pbp/play_by_play_{year}.parquet"
        dest = RAW_NFL_DIR / "pbp" / f"play_by_play_{year}.parquet"
        download_file(url, dest)

def main():
    ensure_dirs()
    print("Fetching nflverse player directory...")
    fetch_players()
    print("Fetching nflverse weekly player statistics (2014-2025)...")
    fetch_weekly_stats()
    print("Fetching nflverse play-by-play (2014-2025)...")
    fetch_pbp()
    print("nflverse data download complete!")

if __name__ == "__main__":
    main()

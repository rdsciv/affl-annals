"""
ESPN Fantasy Football Ingestion Client for AFFL (2014-2025).
Pulls historical league metadata, teams, rosters, matchups, drafts, and transactions.
"""

import os
import sys
import json
import time
import requests
from pathlib import Path

def load_env():
    env_file = Path(__file__).resolve().parent.parent / ".env.local"
    config = {}
    if env_file.exists():
        with open(env_file, "r") as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    k, v = line.split("=", 1)
                    config[k.strip()] = v.strip()
    return config

def fetch_season(year: int, league_id: str, swid: str, espn_s2: str):
    cookies = {
        "SWID": swid,
        "espn_s2": espn_s2
    }
    headers = {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko)"
    }
    views = ["mRoster", "mMatchup", "mTeam", "mSettings", "mDraftDetail", "mTransactions2", "mBoxscore"]
    view_params = "&".join([f"view={v}" for v in views])
    
    if year >= 2019:
        url = f"https://lm-api-reads.fantasy.espn.com/apis/v3/games/ffl/seasons/{year}/segments/0/leagues/{league_id}?{view_params}"
    else:
        url = f"https://lm-api-reads.fantasy.espn.com/apis/v3/games/ffl/leagueHistory/{league_id}?seasonId={year}&{view_params}"
    
    try:
        res = requests.get(url, cookies=cookies, headers=headers, timeout=15)
        if res.status_code == 200:
            data = res.json()
            if isinstance(data, list) and len(data) > 0:
                data = data[0]
            return data
        else:
            print(f"[{year}] Error {res.status_code}: {res.text[:200]}")
            return None
    except Exception as e:
        print(f"[{year}] Exception: {e}")
        return None

def main():
    config = load_env()
    league_id = config.get("ESPN_LEAGUE_ID", "51418")
    swid = config.get("ESPN_SWID", "")
    espn_s2 = config.get("ESPN_S2", "")
    
    out_dir = Path(__file__).resolve().parent.parent / "data" / "raw_espn"
    out_dir.mkdir(parents=True, exist_ok=True)
    
    print(f"Fetching AFFL ESPN data for League ID {league_id} (2014-2025)...")
    for year in range(2014, 2026):
        out_file = out_dir / f"espn_{year}.json"
        if out_file.exists():
            print(f"Year {year} already cached at {out_file.name}")
            continue
        print(f"Fetching year {year}...")
        data = fetch_season(year, league_id, swid, espn_s2)
        if data:
            with open(out_file, "w") as f:
                json.dump(data, f)
            print(f"Saved {out_file.name}")
        time.sleep(1)

if __name__ == "__main__":
    main()

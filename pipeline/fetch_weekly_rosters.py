"""
Fetches weekly scoring period boxscores for AFFL seasons 2014-2025.
Saves to data/raw_espn/weekly/espn_{year}_wk{week}.json.
"""

import os
import sys
import json
import time
import requests
from pathlib import Path
from pipeline.fetch_espn import load_env

def fetch_weekly_data():
    config = load_env()
    league_id = config.get("ESPN_LEAGUE_ID", "51418")
    swid = config.get("ESPN_SWID", "")
    espn_s2 = config.get("ESPN_S2", "")
    
    cookies = {"SWID": swid, "espn_s2": espn_s2}
    headers = {"User-Agent": "Mozilla/5.0"}
    
    out_dir = Path(__file__).resolve().parent.parent / "data" / "raw_espn" / "weekly"
    out_dir.mkdir(parents=True, exist_ok=True)
    
    print("Fetching weekly boxscore rosters (2014-2025)...")
    for year in range(2014, 2026):
        num_weeks = 17 if year >= 2021 else 16
        for week in range(1, num_weeks + 1):
            out_file = out_dir / f"espn_{year}_wk{week}.json"
            if out_file.exists() and out_file.stat().st_size > 500:
                continue
            
            if year >= 2018:
                url = f"https://lm-api-reads.fantasy.espn.com/apis/v3/games/ffl/seasons/{year}/segments/0/leagues/{league_id}?scoringPeriodId={week}&view=mBoxscore&view=mRoster&view=mMatchup&view=mMatchupScore&view=mTeam"
            else:
                url = f"https://lm-api-reads.fantasy.espn.com/apis/v3/games/ffl/leagueHistory/{league_id}?seasonId={year}&scoringPeriodId={week}&view=mBoxscore&view=mRoster&view=mMatchup&view=mMatchupScore"
            
            try:
                res = requests.get(url, cookies=cookies, headers=headers, timeout=15)
                if res.status_code == 200:
                    data = res.json()
                    if isinstance(data, list) and len(data) > 0:
                        data = data[0]
                    with open(out_file, "w") as f:
                        json.dump(data, f)
                    print(f"Saved {out_file.name}")
                else:
                    print(f"[{year} Wk {week}] HTTP {res.status_code}")
            except Exception as e:
                print(f"[{year} Wk {week}] Error: {e}")
            time.sleep(0.3)

if __name__ == "__main__":
    fetch_weekly_data()

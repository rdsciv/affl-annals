-- AFFL Canonical Warehouse SQLite Schema (affl.db)

CREATE TABLE IF NOT EXISTS dim_affl_owner (
    owner_id TEXT PRIMARY KEY,
    canonical_name TEXT NOT NULL,
    display_name TEXT NOT NULL,
    notes TEXT
);

CREATE TABLE IF NOT EXISTS dim_affl_franchise (
    franchise_id TEXT PRIMARY KEY,
    owner_id TEXT NOT NULL,
    display_name TEXT NOT NULL,
    owner_display_name TEXT NOT NULL,
    current_logo_path TEXT,
    primary_color TEXT,
    secondary_color TEXT,
    first_season INTEGER NOT NULL,
    last_season INTEGER NOT NULL,
    is_active INTEGER NOT NULL DEFAULT 1,
    FOREIGN KEY (owner_id) REFERENCES dim_affl_owner(owner_id)
);

CREATE TABLE IF NOT EXISTS dim_affl_team_season (
    season INTEGER NOT NULL,
    team_id INTEGER NOT NULL,
    member_id TEXT,
    franchise_id TEXT NOT NULL,
    historical_name TEXT NOT NULL,
    historical_abbrev TEXT NOT NULL,
    historical_logo_path TEXT,
    wins INTEGER NOT NULL DEFAULT 0,
    losses INTEGER NOT NULL DEFAULT 0,
    ties INTEGER NOT NULL DEFAULT 0,
    points_for REAL NOT NULL DEFAULT 0.0,
    points_against REAL NOT NULL DEFAULT 0.0,
    regular_season_rank INTEGER,
    final_rank INTEGER,
    is_champion INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (season, team_id),
    FOREIGN KEY (franchise_id) REFERENCES dim_affl_franchise(franchise_id)
);

CREATE TABLE IF NOT EXISTS dim_nfl_player (
    gsis_id TEXT PRIMARY KEY,
    display_name TEXT NOT NULL,
    first_name TEXT,
    last_name TEXT,
    position TEXT NOT NULL,
    birth_date TEXT,
    college TEXT,
    draft_year INTEGER,
    draft_round INTEGER,
    draft_pick INTEGER,
    height TEXT,
    weight INTEGER,
    headshot_url TEXT
);

CREATE TABLE IF NOT EXISTS dim_nfl_team_season (
    team_abbr TEXT NOT NULL,
    season INTEGER NOT NULL,
    full_name TEXT NOT NULL,
    nickname TEXT NOT NULL,
    conference TEXT NOT NULL,
    division TEXT NOT NULL,
    logo_url TEXT,
    PRIMARY KEY (team_abbr, season)
);

CREATE TABLE IF NOT EXISTS bridge_player_external_id (
    provider TEXT NOT NULL,
    external_id TEXT NOT NULL,
    gsis_id TEXT NOT NULL,
    player_name TEXT,
    position TEXT,
    match_method TEXT NOT NULL,
    match_confidence REAL NOT NULL DEFAULT 1.0,
    review_status TEXT NOT NULL DEFAULT 'Approved',
    first_valid_season INTEGER,
    last_valid_season INTEGER,
    PRIMARY KEY (provider, external_id),
    FOREIGN KEY (gsis_id) REFERENCES dim_nfl_player(gsis_id)
);

CREATE TABLE IF NOT EXISTS fact_affl_matchup (
    matchup_id TEXT PRIMARY KEY,
    season INTEGER NOT NULL,
    week INTEGER NOT NULL,
    home_team_id INTEGER NOT NULL,
    away_team_id INTEGER NOT NULL,
    home_franchise_id TEXT NOT NULL,
    away_franchise_id TEXT NOT NULL,
    home_score REAL NOT NULL,
    away_score REAL NOT NULL,
    is_playoff INTEGER NOT NULL DEFAULT 0,
    playoff_tier TEXT,
    winner_team_id INTEGER,
    winner_franchise_id TEXT
);

CREATE TABLE IF NOT EXISTS fact_affl_draft_pick (
    pick_id TEXT PRIMARY KEY,
    season INTEGER NOT NULL,
    round INTEGER,
    pick_overall INTEGER,
    team_id INTEGER NOT NULL,
    franchise_id TEXT NOT NULL,
    espn_player_id TEXT NOT NULL,
    gsis_id TEXT,
    player_name TEXT NOT NULL,
    position TEXT NOT NULL,
    auction_price INTEGER NOT NULL DEFAULT 0,
    is_keeper INTEGER NOT NULL DEFAULT 0,
    keeper_cost INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS fact_affl_roster_week (
    roster_week_id TEXT PRIMARY KEY,
    season INTEGER NOT NULL,
    week INTEGER NOT NULL,
    team_id INTEGER NOT NULL,
    franchise_id TEXT NOT NULL,
    espn_player_id TEXT NOT NULL,
    gsis_id TEXT,
    player_name TEXT NOT NULL,
    position TEXT NOT NULL,
    slot_code TEXT,
    slot_evidence TEXT NOT NULL, -- 'Observed', 'Unavailable', 'NotApplicable'
    started INTEGER NOT NULL DEFAULT 0,
    rostered INTEGER NOT NULL DEFAULT 1,
    affl_points REAL NOT NULL DEFAULT 0.0,
    acquisition_source TEXT,
    source_record_id TEXT
);

CREATE TABLE IF NOT EXISTS fact_affl_transaction (
    transaction_id TEXT PRIMARY KEY,
    season INTEGER NOT NULL,
    week INTEGER NOT NULL,
    team_id INTEGER NOT NULL,
    franchise_id TEXT NOT NULL,
    transaction_type TEXT NOT NULL, -- 'WAIVER_ADD', 'FREEAGENT_ADD', 'DROP', 'TRADE'
    espn_player_id TEXT NOT NULL,
    gsis_id TEXT,
    player_name TEXT,
    bid_amount INTEGER DEFAULT 0,
    execution_date TEXT,
    status TEXT
);

CREATE TABLE IF NOT EXISTS fact_affl_trade (
    trade_id TEXT PRIMARY KEY,
    season INTEGER NOT NULL,
    week INTEGER NOT NULL,
    team1_id INTEGER NOT NULL,
    team2_id INTEGER NOT NULL,
    franchise1_id TEXT NOT NULL,
    franchise2_id TEXT NOT NULL,
    execution_date TEXT,
    trade_alpha_franchise1 REAL DEFAULT 0.0,
    trade_alpha_franchise2 REAL DEFAULT 0.0,
    realized_value_franchise1 REAL DEFAULT 0.0,
    realized_value_franchise2 REAL DEFAULT 0.0,
    notes TEXT
);

CREATE TABLE IF NOT EXISTS fact_affl_trade_item (
    item_id TEXT PRIMARY KEY,
    trade_id TEXT NOT NULL,
    from_franchise_id TEXT NOT NULL,
    to_franchise_id TEXT NOT NULL,
    item_type TEXT NOT NULL, -- 'PLAYER', 'DRAFT_PICK', 'FAAB'
    espn_player_id TEXT,
    gsis_id TEXT,
    player_name TEXT,
    draft_season INTEGER,
    draft_round INTEGER,
    faab_amount INTEGER,
    subsequent_affl_points REAL DEFAULT 0.0,
    subsequent_custody_par REAL DEFAULT 0.0,
    FOREIGN KEY (trade_id) REFERENCES fact_affl_trade(trade_id)
);

CREATE TABLE IF NOT EXISTS bridge_affl_player_week (
    season INTEGER NOT NULL,
    week INTEGER NOT NULL,
    franchise_id TEXT NOT NULL,
    team_id INTEGER NOT NULL,
    espn_player_id TEXT NOT NULL,
    gsis_id TEXT,
    nfl_team_season_id TEXT,
    rostered INTEGER NOT NULL DEFAULT 1,
    started INTEGER NOT NULL DEFAULT 0,
    slot_code TEXT,
    slot_evidence TEXT NOT NULL, -- 'Observed', 'Unavailable', 'NotApplicable'
    affl_points REAL NOT NULL DEFAULT 0.0,
    ownership_stint_id TEXT,
    acquisition_source TEXT,
    source_record_id TEXT,
    evidence_status TEXT NOT NULL DEFAULT 'Verified',
    PRIMARY KEY (season, week, franchise_id, espn_player_id)
);

CREATE INDEX IF NOT EXISTS idx_bridge_custody ON bridge_affl_player_week(season, week, gsis_id);
CREATE INDEX IF NOT EXISTS idx_bridge_franchise ON bridge_affl_player_week(franchise_id, season);
CREATE INDEX IF NOT EXISTS idx_roster_week_player ON fact_affl_roster_week(season, week, gsis_id);

export type CustodyScope = "rostered" | "started" | "ever";

export type ResultGrain = 
  | "player" 
  | "franchise" 
  | "team_season" 
  | "nfl_team" 
  | "position" 
  | "season" 
  | "week" 
  | "game" 
  | "play";

export interface FranchiseInfo {
  franchise_id: string;
  display_name: string;
  owner_id: string;
  owner_display_name: string;
  canonical_name: string;
  current_logo_path: string;
  primary_color: string;
  secondary_color: string;
  first_season: number;
  last_season: number;
  is_active: number;
}

export interface FranchiseSeasonRecord {
  season: number;
  team_id: number;
  franchise_id: string;
  franchise_name: string;
  owner_display_name: string;
  current_logo_path: string;
  primary_color: string;
  secondary_color: string;
  historical_name: string;
  historical_abbrev: string;
  wins: number;
  losses: number;
  ties: number;
  points_for: number;
  points_against: number;
  regular_season_rank: number | null;
  final_rank: number | null;
  is_champion: number;
}

export interface PlayerSeasonCustody {
  season: number;
  franchise_id: string;
  franchise_name: string;
  franchise_logo: string;
  franchise_color: string;
  gsis_id: string;
  player_name: string;
  position: string;
  headshot_url: string;
  college: string;
  weeks_rostered: number;
  weeks_started: number;
  affl_points: number;
  bench_points: number;
  xfp: number;
  fpoe: number;
  custody_par: number;
  targets: number;
  receptions: number;
  rec_yds: number;
  rec_td: number;
  rush_att: number;
  rush_yds: number;
  rush_td: number;
  pass_att: number;
  pass_cmp: number;
  pass_yds: number;
  pass_td: number;
  pass_int: number;
}

export interface DraftPickRecord {
  season: number;
  round: number;
  pick_overall: number;
  team_id: number;
  franchise_id: string;
  franchise_name: string;
  espn_player_id: string;
  gsis_id: string | null;
  player_name: string;
  position: string;
  headshot_url?: string;
  college?: string;
  auction_price: number;
  is_keeper: number;
  total_season_points: number;
  weeks_rostered: number;
  weeks_started: number;
  draft_par: number;
}

export interface ExploreQueryState {
  presetId?: string;
  scope: CustodyScope;
  grain: ResultGrain;
  metrics: string[];
  franchiseId?: string;
  position?: string;
  nflTeam?: string;
  startSeason: number;
  endSeason: number;
  minSampleValue?: number;
  minSampleMetric?: string;
  sortBy: string;
  sortDir: "asc" | "desc";
  limit: number;
}

export interface MetricDefinition {
  id: string;
  name: string;
  shortName: string;
  category: "volume" | "efficiency" | "fantasy" | "opportunity" | "context";
  description: string;
  denominator?: string;
  minSampleRule?: string;
  isRate?: boolean;
  compatibleGrains: ResultGrain[];
  format: (val: number | null | undefined) => string;
}

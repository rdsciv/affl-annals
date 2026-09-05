"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Search, Users, Shield, TrendingUp, Sparkles, Filter, Zap, Award } from "lucide-react";
import { CANONICAL_FRANCHISES } from "@/lib/constants";
import { fetchMartJson } from "@/lib/api";

export default function PlayersPage() {
  const [players, setPlayers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [positionFilter, setPositionFilter] = useState("ALL");
  const [franchiseFilter, setFranchiseFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPlayers() {
      try {
        const data = await fetchMartJson("mart_affl_player_season_custody.json");
        const playerMap: Record<string, any> = {};
        for (const row of data) {
          const key = row.gsis_id || row.player_name;
          if (!playerMap[key]) {
            playerMap[key] = {
              gsis_id: row.gsis_id,
              player_name: row.player_name,
              position: row.position,
              headshot_url: row.headshot_url,
              college: row.college,
              franchises: new Set(),
              seasons: new Set(),
              total_points: 0,
              total_started: 0,
              total_rostered: 0,
              total_xfp: 0,
              total_fpoe: 0,
              total_par: 0,
              // NFLverse totals
              total_epa: 0,
              total_pass_yds: 0,
              total_pass_tds: 0,
              total_rush_yds: 0,
              total_rush_tds: 0,
              total_rec_yds: 0,
              total_rec_tds: 0,
              total_air_yds: 0,
              total_yac: 0,
            };
          }
          const p = playerMap[key];
          if (row.franchise_name) p.franchises.add(row.franchise_name);
          p.seasons.add(row.season);
          p.total_points += Number(row.affl_points || 0);
          p.total_started += Number(row.weeks_started || 0);
          p.total_rostered += Number(row.weeks_rostered || 0);
          p.total_xfp += Number(row.xfp || 0);
          p.total_fpoe += Number(row.fpoe || 0);
          p.total_par += Number(row.custody_par || 0);

          p.total_epa += Number(row.epa || 0);
          p.total_pass_yds += Number(row.pass_yds || 0);
          p.total_pass_tds += Number(row.pass_tds || 0);
          p.total_rush_yds += Number(row.rush_yds || 0);
          p.total_rush_tds += Number(row.rush_tds || 0);
          p.total_rec_yds += Number(row.rec_yds || 0);
          p.total_rec_tds += Number(row.rec_tds || 0);
          p.total_air_yds += Number(row.air_yards || 0);
          p.total_yac += Number(row.yac || 0);
        }
        const list = Object.values(playerMap).map((p) => ({
          ...p,
          total_tds: p.total_pass_tds + p.total_rush_tds + p.total_rec_tds,
          franchises_list: Array.from(p.franchises),
          seasons_list: Array.from(p.seasons).sort(),
        }));
        list.sort((a, b) => b.total_points - a.total_points);
        setPlayers(list);
      } catch (err) {
        console.error("Error loading players:", err);
      } finally {
        setLoading(false);
      }
    }
    loadPlayers();
  }, []);

  const [sortBy, setSortBy] = useState<string>("points");

  const filtered = useMemo(() => {
    const raw = players.filter((p) => {
      if (search) {
        const q = search.toLowerCase();
        const matchesName = (p.player_name || "").toLowerCase().includes(q);
        const matchesCollege = p.college && p.college.toLowerCase().includes(q);
        if (!matchesName && !matchesCollege) return false;
      }
      if (positionFilter !== "ALL" && p.position !== positionFilter) return false;
      if (franchiseFilter !== "ALL" && !p.franchises_list.includes(franchiseFilter)) return false;
      return true;
    });

    return [...raw].sort((a, b) => {
      if (sortBy === "points") return b.total_points - a.total_points;
      if (sortBy === "epa") return b.total_epa - a.total_epa;
      if (sortBy === "tds") return b.total_tds - a.total_tds;
      if (sortBy === "pass_yds") return b.total_pass_yds - a.total_pass_yds;
      if (sortBy === "rush_yds") return b.total_rush_yds - a.total_rush_yds;
      if (sortBy === "rec_yds") return b.total_rec_yds - a.total_rec_yds;
      if (sortBy === "par") return b.total_par - a.total_par;
      if (sortBy === "xfp") return b.total_xfp - a.total_xfp;
      if (sortBy === "fpoe") return b.total_fpoe - a.total_fpoe;
      if (sortBy === "starts") return b.total_started - a.total_started;
      if (sortBy === "name") return (a.player_name || "").localeCompare(b.player_name || "");
      return 0;
    });
  }, [players, search, positionFilter, franchiseFilter, sortBy]);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-rule pb-6">
        <div>
          <h1 className="font-mono text-2xl md:text-3xl font-black text-ink tracking-tight flex items-center gap-3">
            <Users className="h-7 w-7 text-brand-blue" />
            <span>AFFL Player Custody Directory</span>
          </h1>
          <p className="text-xs md:text-sm text-ink-muted mt-1">
            Browse all NFL players rostered across the 2014–2025 AFFL history, enriched with nflverse box score totals, Expected Points Added (EPA), and custody PAR.
          </p>
        </div>
        <div className="flex items-center gap-2 font-mono text-xs text-ink-dim">
          <span>Total Players: <strong className="text-ink">{players.length.toLocaleString()}</strong></span>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-rule bg-card p-4">
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-ink-dim" />
          <input
            type="text"
            placeholder="Search by player name or college..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg bg-card-elevated pl-9 pr-4 py-1.5 text-xs text-ink placeholder-ink-dim border border-rule focus:border-brand-blue focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Position Selector */}
          <div className="flex items-center gap-1.5 text-xs">
            <Filter className="h-3.5 w-3.5 text-ink-dim" />
            <select
              value={positionFilter}
              onChange={(e) => setPositionFilter(e.target.value)}
              className="rounded-md bg-card-elevated px-2.5 py-1.5 text-xs text-ink font-medium border border-rule focus:outline-none"
            >
              <option value="ALL">All Positions</option>
              <option value="QB">QB</option>
              <option value="RB">RB</option>
              <option value="WR">WR</option>
              <option value="TE">TE</option>
              <option value="K">K</option>
              <option value="D/ST">D/ST</option>
            </select>
          </div>

          {/* Franchise Selector */}
          <div className="flex items-center gap-1.5 text-xs">
            <Shield className="h-3.5 w-3.5 text-ink-dim" />
            <select
              value={franchiseFilter}
              onChange={(e) => setFranchiseFilter(e.target.value)}
              className="rounded-md bg-card-elevated px-2.5 py-1.5 text-xs text-ink font-medium border border-rule focus:outline-none max-w-[200px]"
            >
              <option value="ALL">All Franchises</option>
              {CANONICAL_FRANCHISES.map((f) => (
                <option key={f.franchise_id} value={f.display_name}>
                  {f.display_name}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="font-mono text-ink-dim uppercase text-[10px]">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="rounded-md bg-card-elevated px-2.5 py-1.5 text-xs text-ink font-medium border border-rule focus:outline-none"
            >
              <option value="points">Total AFFL Points</option>
              <option value="epa">Highest Career EPA (nflverse)</option>
              <option value="tds">Most Touchdowns</option>
              <option value="pass_yds">Most Passing Yards</option>
              <option value="rush_yds">Most Rushing Yards</option>
              <option value="rec_yds">Most Receiving Yards</option>
              <option value="par">Career Custody PAR</option>
              <option value="xfp">Expected Points (xFP)</option>
              <option value="fpoe">Efficiency (FPOE)</option>
              <option value="starts">Most Starts</option>
              <option value="name">Name (A-Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Players Grid */}
      {loading ? (
        <div className="py-20 text-center text-xs font-mono text-ink-dim">
          Loading player database and nflverse metrics...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.slice(0, 60).map((player, idx) => (
            <Link
              key={player.gsis_id || idx}
              href={`/players/${player.gsis_id || player.player_name}`}
              className="glass-card group rounded-xl p-4 hover:border-brand-blue/50 flex flex-col justify-between space-y-4 transition-all"
            >
              <div className="flex items-start gap-3">
                <div className="h-12 w-12 rounded-full overflow-hidden border border-rule bg-canvas shrink-0">
                  {player.headshot_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={player.headshot_url}
                      alt={player.player_name}
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = "none";
                      }}
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center font-mono font-bold text-xs text-ink-dim bg-card-elevated">
                      {player.position}
                    </div>
                  )}
                </div>

                <div className="space-y-1 flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-mono text-sm font-bold text-ink group-hover:text-brand-blue transition-colors truncate">
                      {player.player_name}
                    </h3>
                    <span className="rounded bg-card-elevated px-1.5 py-0.5 text-[10px] font-mono font-semibold text-brand-lime border border-rule">
                      {player.position}
                    </span>
                  </div>

                  {/* NFLverse Stat Snippet */}
                  {player.position === "QB" && player.total_pass_yds > 0 && (
                    <p className="text-[11px] font-mono text-ink truncate">
                      NFL: <span className="text-brand-blue font-bold">{Math.round(player.total_pass_yds).toLocaleString()} Pass Yds</span> · <span className="text-brand-yellow font-bold">{player.total_pass_tds} TD</span>
                    </p>
                  )}
                  {player.position === "RB" && player.total_rush_yds > 0 && (
                    <p className="text-[11px] font-mono text-ink truncate">
                      NFL: <span className="text-brand-lime font-bold">{Math.round(player.total_rush_yds).toLocaleString()} Rush Yds</span> · <span className="text-brand-yellow font-bold">{player.total_rush_tds} TD</span>
                    </p>
                  )}
                  {(player.position === "WR" || player.position === "TE") && player.total_rec_yds > 0 && (
                    <p className="text-[11px] font-mono text-ink truncate">
                      NFL: <span className="text-purple-400 font-bold">{Math.round(player.total_rec_yds).toLocaleString()} Rec Yds</span> · <span className="text-brand-yellow font-bold">{player.total_rec_tds} TD</span>
                    </p>
                  )}

                  <p className="text-[11px] text-ink-muted truncate">
                    Custody: <strong className="text-brand-blue">{player.franchises_list.join(", ") || "Free Agent"}</strong>
                  </p>
                </div>
              </div>

              {/* Stat Badges */}
              <div className="grid grid-cols-4 gap-1.5 border-t border-rule pt-3 text-center stat-mono">
                <div className="rounded bg-card-elevated py-1 px-1">
                  <span className="text-[9px] uppercase text-ink-dim block">AFFL Pts</span>
                  <span className="text-xs font-bold text-ink">{player.total_points.toFixed(1)}</span>
                </div>
                <div className="rounded bg-card-elevated py-1 px-1">
                  <span className="text-[9px] uppercase text-ink-dim block">Career EPA</span>
                  <span className={`text-xs font-bold ${player.total_epa >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                    {player.total_epa > 0 ? `+${player.total_epa.toFixed(1)}` : player.total_epa.toFixed(1)}
                  </span>
                </div>
                <div className="rounded bg-card-elevated py-1 px-1">
                  <span className="text-[9px] uppercase text-ink-dim block">FPOE</span>
                  <span className="text-xs font-bold text-brand-orange">
                    {player.total_fpoe > 0 ? `+${player.total_fpoe.toFixed(1)}` : player.total_fpoe.toFixed(1)}
                  </span>
                </div>
                <div className="rounded bg-card-elevated py-1 px-1">
                  <span className="text-[9px] uppercase text-ink-dim block">Starts</span>
                  <span className="text-xs font-bold text-brand-lime">{player.total_started}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

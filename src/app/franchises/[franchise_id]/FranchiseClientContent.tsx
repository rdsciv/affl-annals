"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { 
  Shield, 
  Trophy, 
  Users, 
  Sparkles, 
  Calendar, 
  ArrowLeft, 
  TrendingUp,
  Award,
  Layers,
  BarChart2,
  Swords,
  ChevronRight,
  Flame,
  CheckCircle2,
  Loader2
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";
import { CANONICAL_FRANCHISES } from "@/lib/constants";
import { fetchMartJson } from "@/lib/api";
import FranchiseLogo from "@/components/FranchiseLogo";

export default function FranchiseClientContent({
  franchiseId,
}: {
  franchiseId: string;
}) {
  const fid = franchiseId;

  const franchise = CANONICAL_FRANCHISES.find((f) => f.franchise_id === fid) || {
    franchise_id: fid,
    display_name: fid.replace("FRAN_", "").replace("_", " "),
    owner_display_name: "Franchise Owner",
    current_logo_path: "",
    primary_color: "#5b87ac",
    secondary_color: "#c05a34",
    first_season: 2014,
    last_season: 2026,
    is_active: 1,
  };

  const [seasons, setSeasons] = useState<any[]>([]);
  const [h2hRecords, setH2hRecords] = useState<any[]>([]);
  const [topCustodians, setTopCustodians] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [seasonSort, setSeasonSort] = useState<{ key: string; dir: "asc" | "desc" }>({
    key: "season",
    dir: "desc"
  });

  // Load Franchise Data from Marts
  useEffect(() => {
    async function loadFranchiseData() {
      try {
        setLoading(true);
        // 1. Fetch seasons
        const allSeasons = await fetchMartJson("mart_affl_franchise_season.json");
        const matchingSeasons = (allSeasons || []).filter((s: any) => s.franchise_id === fid);
        setSeasons(matchingSeasons);

        // 2. Fetch H2H Rivalries
        try {
          const allH2h = await fetchMartJson("mart_affl_head_to_head.json");
          const myH2h = (allH2h || [])
            .filter((h: any) => h.franchise1_id === fid || h.franchise2_id === fid)
            .map((h: any) => {
              const isF1 = h.franchise1_id === fid;
              const oppId = isF1 ? h.franchise2_id : h.franchise1_id;
              const oppFranchise = CANONICAL_FRANCHISES.find((f) => f.franchise_id === oppId);
              const wins = isF1 ? h.f1_wins : h.f2_wins;
              const losses = isF1 ? h.f2_wins : h.f1_wins;
              const pf = isF1 ? h.f1_total_points : h.f2_total_points;
              const pa = isF1 ? h.f2_total_points : h.f1_total_points;
              const winPct = h.total_games > 0 ? (wins / h.total_games * 100).toFixed(1) : "0.0";

              return {
                oppId,
                oppName: oppFranchise?.display_name || oppId.replace("FRAN_", "").replace("_", " "),
                oppColor: oppFranchise?.primary_color || "#94a3b8",
                totalGames: h.total_games,
                wins,
                losses,
                ties: h.ties || 0,
                winPct,
                pf: pf || 0,
                pa: pa || 0,
              };
            })
            .sort((a: any, b: any) => b.totalGames - a.totalGames);
          setH2hRecords(myH2h);
        } catch (err) {
          console.error("Error loading H2H records:", err);
        }

        // 3. Fetch Top Player Custodians
        try {
          const allCustody = await fetchMartJson("mart_affl_player_season_custody.json");
          const myCustody = (allCustody || []).filter((c: any) => c.franchise_id === fid);
          
          // Group by player
          const playerMap = new Map<string, any>();
          for (const c of myCustody) {
            const key = c.gsis_id || c.player_name;
            if (!playerMap.has(key)) {
              playerMap.set(key, {
                gsis_id: c.gsis_id,
                player_name: c.player_name,
                position: c.position,
                headshot_url: c.headshot_url,
                total_points: 0,
                weeks_started: 0,
                seasons: new Set(),
                custody_par: 0,
              });
            }
            const p = playerMap.get(key);
            p.total_points += Number(c.affl_points || 0);
            p.weeks_started += Number(c.weeks_started || 0);
            p.custody_par += Number(c.custody_par || 0);
            p.seasons.add(c.season);
          }

          const sortedPlayers = Array.from(playerMap.values())
            .map((p) => {
              const sArr = Array.from(p.seasons) as number[];
              return {
                ...p,
                season_count: p.seasons.size,
                season_span: sArr.length > 0 ? `${Math.min(...sArr)}-${Math.max(...sArr)}` : "—"
              };
            })
            .sort((a, b) => b.total_points - a.total_points)
            .slice(0, 10);

          setTopCustodians(sortedPlayers);
        } catch (err) {
          console.error("Error loading custody records:", err);
        }

      } catch (err) {
        console.error("Error loading franchise season data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadFranchiseData();
  }, [fid]);

  const sortedSeasons = useMemo(() => {
    return [...seasons].sort((a, b) => {
      let valA = a[seasonSort.key];
      let valB = b[seasonSort.key];
      if (seasonSort.key === "winPct") {
        valA = (a.wins + a.losses) > 0 ? (a.wins / (a.wins + a.losses)) : 0;
        valB = (b.wins + b.losses) > 0 ? (b.wins / (b.wins + b.losses)) : 0;
      }
      if (typeof valA === "string") {
        valA = valA.toLowerCase();
        valB = (valB || "").toLowerCase();
      } else {
        valA = Number(valA || 0);
        valB = Number(valB || 0);
      }
      if (valA < valB) return seasonSort.dir === "asc" ? -1 : 1;
      if (valA > valB) return seasonSort.dir === "asc" ? 1 : -1;
      return 0;
    });
  }, [seasons, seasonSort]);

  const handleSeasonSort = (key: string) => {
    if (seasonSort.key === key) {
      setSeasonSort({ key, dir: seasonSort.dir === "asc" ? "desc" : "asc" });
    } else {
      setSeasonSort({ key, dir: ["season", "points_for", "points_against", "wins", "winPct"].includes(key) ? "desc" : "asc" });
    }
  };

  const renderSortHeader = (label: string, key: string, align: "left" | "center" | "right" = "left") => {
    const isSorted = seasonSort.key === key;
    return (
      <th
        onClick={() => handleSeasonSort(key)}
        className={`py-3 px-3 cursor-pointer select-none hover:text-brand-blue transition-colors ${
          align === "center" ? "text-center" : align === "right" ? "text-right" : "text-left"
        } ${isSorted ? "text-brand-orange bg-brand-orange/5" : "text-ink-dim"}`}
      >
        <div className={`inline-flex items-center gap-1 ${align === "right" ? "justify-end" : align === "center" ? "justify-center" : "justify-start"}`}>
          <span>{label}</span>
          {isSorted ? (
            seasonSort.dir === "desc" ? (
              <span className="text-brand-orange">▼</span>
            ) : (
              <span className="text-brand-orange">▲</span>
            )
          ) : (
            <span className="opacity-20">↕</span>
          )}
        </div>
      </th>
    );
  };

  const totalWins = seasons.reduce((acc, s) => acc + Number(s.wins || 0), 0);
  const totalLosses = seasons.reduce((acc, s) => acc + Number(s.losses || 0), 0);
  const totalTies = seasons.reduce((acc, s) => acc + Number(s.ties || 0), 0);
  const totalPf = seasons.reduce((acc, s) => acc + Number(s.points_for || 0), 0);
  const totalPa = seasons.reduce((acc, s) => acc + Number(s.points_against || 0), 0);
  const titlesCount = seasons.filter((s) => s.is_champion === 1 || s.final_rank === 1).length;
  const winPct = (totalWins + totalLosses) > 0 ? (totalWins / (totalWins + totalLosses) * 100).toFixed(1) : "0.0";

  // Distinct Historical Names
  const historicalNamesList = Array.from(new Set(seasons.map((s) => s.historical_name).filter(Boolean)));

  // Chronological season progression data for Recharts
  const progressionData = [...seasons].sort((a, b) => a.season - b.season).map((s) => ({
    season: s.season.toString(),
    historical_name: s.historical_name,
    points_for: Number(s.points_for || 0),
    points_against: Number(s.points_against || 0),
    record: `${s.wins}-${s.losses}`,
    is_champion: s.is_champion === 1 || s.final_rank === 1,
  }));

  const CustomChartTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const d = payload[0].payload;
      return (
        <div className="rounded-lg border border-rule-bright bg-card p-3 shadow-xl text-xs font-mono space-y-1.5">
          <div className="font-bold text-ink flex items-center justify-between gap-2">
            <span>{d.season} Season</span>
            {d.is_champion && (
              <span className="text-brand-yellow font-bold flex items-center gap-0.5 text-[10px]">
                <Trophy className="h-3 w-3" /> Champion
              </span>
            )}
          </div>
          <div className="text-[11px] text-ink-muted">{d.historical_name} ({d.record})</div>
          <div className="flex items-center justify-between text-brand-blue">
            <span>Points For:</span>
            <strong>{d.points_for.toFixed(1)}</strong>
          </div>
          <div className="flex items-center justify-between text-rose-400">
            <span>Points Against:</span>
            <strong>{d.points_against.toFixed(1)}</strong>
          </div>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-24 text-center space-y-3">
        <Loader2 className="h-8 w-8 animate-spin text-brand-blue mx-auto" />
        <p className="text-xs font-mono text-ink-dim">Loading {franchise.display_name} canonical ledger...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back Link */}
      <div>
        <Link
          href="/franchises"
          className="inline-flex items-center gap-1.5 text-xs text-ink-muted hover:text-brand-blue transition-colors font-mono"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Franchises</span>
        </Link>
      </div>

      {/* Franchise Header Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-rule-bright bg-card p-6 md:p-8 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <FranchiseLogo franchiseId={franchise.franchise_id} size="2xl" />

            <div className="space-y-1.5">
              <div className="flex items-center gap-3">
                <h1 className="font-mono text-2xl md:text-3xl font-black text-ink tracking-tight">
                  {franchise.display_name}
                </h1>
                {titlesCount > 0 && (
                  <div className="flex items-center gap-1 rounded bg-brand-yellow/15 px-2.5 py-0.5 text-xs font-mono font-bold text-brand-yellow border border-brand-yellow/30">
                    <Trophy className="h-3.5 w-3.5" />
                    <span>{titlesCount}x Champion</span>
                  </div>
                )}
              </div>
              <p className="text-xs font-mono text-ink-dim">
                Identity: <strong className="text-ink-muted">{franchise.franchise_id}</strong> • Owner: <strong className="text-ink">{franchise.owner_display_name}</strong>
              </p>
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="text-[11px] font-mono px-2.5 py-0.5 rounded bg-card-elevated text-ink-muted border border-rule">
                  {seasons.length > 0 ? `${seasons.length} Completed Eras (${Math.min(...seasons.map((s: any) => Number(s.season)))}–${Math.max(...seasons.map((s: any) => Number(s.season)))})` : "2026 Expansion · 0 Completed Eras"}
                </span>
                <span className={`text-[11px] font-mono px-2.5 py-0.5 rounded border ${
                  franchise.is_active 
                    ? "bg-brand-blue/10 text-brand-blue border-brand-blue/20" 
                    : "bg-ink-dim/10 text-ink-dim border-rule"
                }`}>
                  {franchise.is_active ? "Active 2026 Field" : "Historical Alumni"}
                </span>
                <Link
                  href="/stats"
                  className="text-[11px] font-mono px-2.5 py-0.5 rounded bg-brand-orange/10 text-brand-orange border border-brand-orange/20 hover:bg-brand-orange/20 transition-colors flex items-center gap-1"
                >
                  <Flame className="h-3 w-3" />
                  <span>Annual Stat Tracker →</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Cumulative Record Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-xl bg-card-elevated p-3 border border-rule text-center">
              <span className="text-[10px] font-mono uppercase text-ink-dim block">Championships</span>
              <span className="text-lg font-mono font-bold text-brand-yellow flex items-center justify-center gap-1">
                <Trophy className="h-4 w-4" /> {titlesCount}
              </span>
            </div>
            <div className="rounded-xl bg-card-elevated p-3 border border-rule text-center">
              <span className="text-[10px] font-mono uppercase text-ink-dim block">Career Record</span>
              <span className="text-lg font-mono font-bold text-ink">
                {totalWins}-{totalLosses}{totalTies > 0 ? `-${totalTies}` : ""}
              </span>
            </div>
            <div className="rounded-xl bg-card-elevated p-3 border border-rule text-center">
              <span className="text-[10px] font-mono uppercase text-ink-dim block">Win Pct</span>
              <span className="text-lg font-mono font-bold text-brand-lime">{winPct}%</span>
            </div>
            <div className="rounded-xl bg-card-elevated p-3 border border-rule text-center">
              <span className="text-[10px] font-mono uppercase text-ink-dim block">Total Points</span>
              <span className="text-lg font-mono font-bold text-brand-blue">
                {totalPf.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </span>
            </div>
          </div>
        </div>

        {/* Alias Evolution Banner */}
        {historicalNamesList.length > 1 && (
          <div className="mt-6 pt-4 border-t border-rule flex items-center gap-2 text-xs font-mono">
            <span className="text-ink-dim uppercase text-[10px] shrink-0 font-bold">Lineage Evolution:</span>
            <div className="flex flex-wrap items-center gap-1.5 text-ink-muted">
              {historicalNamesList.map((name, i) => (
                <span key={name} className="flex items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded bg-card-elevated border border-rule text-ink font-semibold">
                    {name}
                  </span>
                  {i < historicalNamesList.length - 1 && <span className="text-brand-blue">→</span>}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Season-by-Season Production Progression Recharts Chart */}
      {progressionData.length > 0 && (
        <div className="rounded-xl border border-rule bg-card p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-rule pb-3">
            <div>
              <h2 className="font-mono text-base font-bold text-ink uppercase tracking-wider flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-brand-blue" />
                <span>Historical Production & Point Trajectory</span>
              </h2>
              <p className="text-xs text-ink-dim mt-0.5">
                Season-by-season standard non-PPR scoring vs points allowed across all AFFL eras.
              </p>
            </div>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={progressionData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorPf" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={franchise.primary_color || "#5b87ac"} stopOpacity={0.4} />
                    <stop offset="95%" stopColor={franchise.primary_color || "#5b87ac"} stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorPa" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#c05a34" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#c05a34" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="season"
                  tick={{ fill: "#9a9d9f", fontSize: 11, fontFamily: "monospace" }}
                  axisLine={{ stroke: "#3d434c" }}
                  tickLine={{ stroke: "#3d434c" }}
                />
                <YAxis
                  tick={{ fill: "#9a9d9f", fontSize: 10, fontFamily: "monospace" }}
                  axisLine={{ stroke: "#3d434c" }}
                  tickLine={{ stroke: "#3d434c" }}
                />
                <Tooltip content={<CustomChartTooltip />} />
                <Legend
                  wrapperStyle={{ fontSize: 11, fontFamily: "monospace", paddingTop: 8 }}
                  formatter={(val) => (val === "points_for" ? "Points For" : "Points Against")}
                />
                <Area
                  type="monotone"
                  dataKey="points_for"
                  stroke={franchise.primary_color || "#5b87ac"}
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorPf)"
                />
                <Area
                  type="monotone"
                  dataKey="points_against"
                  stroke="#c05a34"
                  strokeWidth={1.5}
                  strokeDasharray="3 3"
                  fillOpacity={1}
                  fill="url(#colorPa)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Historical Team-Seasons Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-brand-blue" />
            <h2 className="font-mono text-base font-bold text-ink uppercase tracking-wider">
              Historical Season Ledger ({seasons.length} Eras)
            </h2>
          </div>
        </div>

        <div className="rounded-xl border border-rule bg-card overflow-hidden shadow-md">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-rule bg-card-elevated/70 text-[11px] font-mono uppercase tracking-wider">
                  {renderSortHeader("Season", "season", "left")}
                  {renderSortHeader("Historical Team Name", "historical_name", "left")}
                  {renderSortHeader("Abbrev", "historical_abbrev", "left")}
                  {renderSortHeader("Record", "wins", "center")}
                  {renderSortHeader("Win %", "winPct", "center")}
                  {renderSortHeader("Points For", "points_for", "right")}
                  {renderSortHeader("Points Against", "points_against", "right")}
                  {renderSortHeader("Finish", "final_rank", "center")}
                  {renderSortHeader("Result", "final_rank", "center")}
                </tr>
              </thead>
              <tbody className="divide-y divide-rule/60 stat-mono">
                {sortedSeasons.map((s, idx) => {
                  const sWinPct = (s.wins + s.losses) > 0 ? (s.wins / (s.wins + s.losses) * 100).toFixed(1) : "0.0";
                  const isChamp = s.is_champion === 1 || s.final_rank === 1;

                  return (
                    <tr key={idx} className="hover:bg-card-hover/80 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-ink">
                        <Link href={`/seasons/${s.season}`} className="hover:text-brand-blue">
                          {s.season}
                        </Link>
                      </td>
                      <td className="py-3 px-4 font-sans font-semibold text-ink">
                        {s.historical_name}
                      </td>
                      <td className="py-3 px-3 font-mono text-ink-dim">{s.historical_abbrev}</td>
                      <td className="py-3 px-3 text-center font-bold text-ink">{s.wins}-{s.losses}</td>
                      <td className="py-3 px-3 text-center text-brand-lime">{sWinPct}%</td>
                      <td className="py-3 px-4 text-right font-bold text-brand-blue">{Number(s.points_for || 0).toFixed(1)}</td>
                      <td className="py-3 px-4 text-right text-ink-muted">{Number(s.points_against || 0).toFixed(1)}</td>
                      <td className="py-3 px-3 text-center text-ink-dim">#{s.final_rank || s.regular_season_rank || "—"}</td>
                      <td className="py-3 px-3 text-center">
                        {isChamp ? (
                          <span className="inline-flex items-center gap-1 rounded bg-brand-yellow/15 px-2 py-0.5 text-[10px] font-mono font-bold text-brand-yellow border border-brand-yellow/30">
                            <Trophy className="h-3 w-3" /> Champion
                          </span>
                        ) : s.final_rank === 2 ? (
                          <span className="rounded bg-card-elevated px-1.5 py-0.5 text-[10px] font-mono text-ink-dim border border-rule">
                            Runner-Up
                          </span>
                        ) : (
                          <span className="text-[11px] text-ink-dim">Regular</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Grid: Top Franchise Custodians + H2H Rivalries */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Top All-Time Custodians */}
        {topCustodians.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-brand-lime" />
              <h2 className="font-mono text-base font-bold text-ink uppercase tracking-wider">
                Top Franchise Custodians
              </h2>
            </div>

            <div className="rounded-xl border border-rule bg-card divide-y divide-rule/60 shadow-xl overflow-hidden">
              {topCustodians.map((p, idx) => (
                <div key={p.gsis_id || idx} className="p-3 flex items-center justify-between hover:bg-card-hover transition-colors text-xs font-mono">
                  <div className="flex items-center gap-3">
                    <span className="text-ink-dim font-bold w-4 text-center">#{idx + 1}</span>
                    <div>
                      <Link 
                        href={`/players/${p.gsis_id || encodeURIComponent(p.player_name)}`}
                        className="font-bold text-ink hover:text-brand-blue"
                      >
                        {p.player_name}
                      </Link>
                      <span className="text-[10px] text-ink-dim block">
                        {p.position} • {p.season_span} ({p.weeks_started} starts)
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-brand-blue block">
                      {Math.round(p.total_points).toLocaleString()} pts
                    </span>
                    <span className="text-[10px] text-brand-lime">
                      +{Math.round(p.custody_par)} PAR
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Head-to-Head Rivalries */}
        {h2hRecords.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Swords className="h-4 w-4 text-brand-orange" />
              <h2 className="font-mono text-base font-bold text-ink uppercase tracking-wider">
                Head-to-Head Rivalry Records
              </h2>
            </div>

            <div className="rounded-xl border border-rule bg-card divide-y divide-rule/60 shadow-xl overflow-hidden max-h-[460px] overflow-y-auto">
              {h2hRecords.map((r) => (
                <div key={r.oppId} className="p-3 flex items-center justify-between hover:bg-card-hover transition-colors text-xs font-mono">
                  <div className="flex items-center gap-2.5">
                    <FranchiseLogo franchiseId={r.oppId} size="sm" />
                    <div>
                      <Link href={`/franchises/${r.oppId}`} className="font-bold text-ink hover:text-brand-blue">
                        {r.oppName}
                      </Link>
                      <span className="text-[10px] text-ink-dim block">
                        {r.totalGames} Matchups
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-ink">
                      {r.wins}-{r.losses}{r.ties > 0 ? `-${r.ties}` : ""} ({r.winPct}%)
                    </span>
                    <span className="text-[10px] text-ink-dim block">
                      {Math.round(r.pf)} PF vs {Math.round(r.pa)} PA
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

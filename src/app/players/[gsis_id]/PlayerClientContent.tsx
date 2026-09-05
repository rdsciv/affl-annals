"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { 
  Users, 
  Shield, 
  Sparkles, 
  Calendar, 
  TrendingUp, 
  ArrowLeft, 
  Award, 
  Activity,
  Layers,
  CheckCircle2,
  XCircle,
  BarChart2,
  Zap,
  Target,
  Flame
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
} from "recharts";

import { fetchMartJson } from "@/lib/api";

export default function PlayerClientContent({
  gsisId,
}: {
  gsisId: string;
}) {
  const rawId = decodeURIComponent(gsisId);

  const [seasonsData, setSeasonsData] = useState<any[]>([]);
  const [gameLogs, setGameLogs] = useState<any[]>([]);
  const [selectedSeasonFilter, setSelectedSeasonFilter] = useState<string>("ALL");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPlayerData() {
      try {
        const allData = await fetchMartJson("mart_affl_player_season_custody.json");
        const matches = (allData || []).filter(
          (r: any) => r.gsis_id === rawId || ((r.player_name || "").toLowerCase() === rawId.toLowerCase())
        );
        matches.sort((a: any, b: any) => b.season - a.season);
        setSeasonsData(matches);

        // Load weekly gamelogs from on-demand partitioned JSON first (fast), with fallback
        try {
          const pLogs = await fetchMartJson(`player_gamelogs/${rawId}.json`);
          if (pLogs && pLogs.gamelogs) {
            setGameLogs(pLogs.gamelogs);
          }
        } catch {
          try {
            const allLogs = await fetchMartJson("mart_affl_player_gamelogs.json");
            const pLogs = allLogs[rawId] || (matches[0] ? allLogs[matches[0].gsis_id || `PID_${matches[0].player_id}`] : null);
            if (pLogs && pLogs.gamelogs) {
              setGameLogs(pLogs.gamelogs);
            }
          } catch (eLogs) {
            console.warn("Could not load player weekly gamelogs:", eLogs);
          }
        }
      } catch (err) {
        console.error("Error loading player details:", err);
      } finally {
        setLoading(false);
      }
    }
    loadPlayerData();
  }, [rawId]);

  const [custodySort, setCustodySort] = useState<{ key: string; dir: "asc" | "desc" }>({
    key: "season",
    dir: "desc"
  });

  const [logSort, setLogSort] = useState<{ key: string; dir: "asc" | "desc" }>({
    key: "season",
    dir: "desc"
  });

  const sortedSeasonsData = useMemo(() => {
    return [...seasonsData].sort((a, b) => {
      let valA = a[custodySort.key];
      let valB = b[custodySort.key];
      if (typeof valA === "string") {
        valA = valA.toLowerCase();
        valB = (valB || "").toLowerCase();
      }
      if (valA < valB) return custodySort.dir === "asc" ? -1 : 1;
      if (valA > valB) return custodySort.dir === "asc" ? 1 : -1;
      return 0;
    });
  }, [seasonsData, custodySort]);

  const handleCustodySort = (key: string) => {
    if (custodySort.key === key) {
      setCustodySort({ key, dir: custodySort.dir === "asc" ? "desc" : "asc" });
    } else {
      setCustodySort({ key, dir: ["season", "affl_points", "bench_points", "xfp", "fpoe", "custody_par", "epa", "pass_yds", "rush_yds", "rec_yds"].includes(key) ? "desc" : "asc" });
    }
  };

  const renderCustodySortHeader = (label: string, key: string, align: "left" | "center" | "right" = "left") => {
    const isSorted = custodySort.key === key;
    return (
      <th
        onClick={() => handleCustodySort(key)}
        className={`py-3 px-3 cursor-pointer select-none hover:text-brand-blue transition-colors ${
          align === "center" ? "text-center" : align === "right" ? "text-right" : "text-left"
        } ${isSorted ? "text-brand-orange bg-brand-orange/5" : "text-ink-dim"}`}
      >
        <div className={`inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider ${align === "right" ? "justify-end" : align === "center" ? "justify-center" : "justify-start"}`}>
          <span>{label}</span>
          {isSorted ? (
            custodySort.dir === "desc" ? (
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

  const handleLogSort = (key: string) => {
    if (logSort.key === key) {
      setLogSort({ key, dir: logSort.dir === "asc" ? "desc" : "asc" });
    } else {
      setLogSort({ key, dir: ["points", "week", "season", "total_epa", "passing_yards", "rushing_yards", "receiving_yards"].includes(key) ? "desc" : "asc" });
    }
  };

  const renderLogSortHeader = (label: string, key: string, align: "left" | "center" | "right" = "left", extraClass: string = "py-2.5 px-3") => {
    const isSorted = logSort.key === key;
    return (
      <th
        onClick={() => handleLogSort(key)}
        className={`${extraClass} cursor-pointer select-none hover:text-brand-blue transition-colors ${
          align === "center" ? "text-center" : align === "right" ? "text-right" : "text-left"
        } ${isSorted ? "text-brand-orange bg-brand-orange/5" : "text-ink-dim"}`}
      >
        <div className={`inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider ${align === "right" ? "justify-end" : align === "center" ? "justify-center" : "justify-start"}`}>
          <span>{label}</span>
          {isSorted ? (
            logSort.dir === "desc" ? (
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

  if (loading) {
    return (
      <div className="py-24 text-center text-xs font-mono text-ink-dim">
        Loading player custody and nflverse statistics...
      </div>
    );
  }

  if (!seasonsData.length) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center space-y-4">
        <h2 className="font-mono text-xl font-bold text-ink">Player Record Not Found</h2>
        <p className="text-xs text-ink-muted">No historical AFFL custody rows found for &ldquo;{rawId}&rdquo;.</p>
        <Link href="/players" className="inline-flex items-center gap-2 text-xs text-brand-blue hover:underline">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Player Directory
        </Link>
      </div>
    );
  }

  const latest = seasonsData[0];
  const playerName = latest.player_name;
  const position = latest.position;
  const headshot = latest.headshot_url;
  const college = latest.college;

  // AFFL totals
  const totalPoints = seasonsData.reduce((acc, r) => acc + Number(r.affl_points || 0), 0);
  const totalBenchPoints = seasonsData.reduce((acc, r) => acc + Number(r.bench_points || 0), 0);
  const totalStarted = seasonsData.reduce((acc, r) => acc + Number(r.weeks_started || 0), 0);
  const totalRostered = seasonsData.reduce((acc, r) => acc + Number(r.weeks_rostered || 0), 0);
  const totalXfp = seasonsData.reduce((acc, r) => acc + Number(r.xfp || 0), 0);
  const totalFpoe = seasonsData.reduce((acc, r) => acc + Number(r.fpoe || 0), 0);
  const totalPar = seasonsData.reduce((acc, r) => acc + Number(r.custody_par || 0), 0);

  // NFLverse career totals
  const totalEpa = seasonsData.reduce((acc, r) => acc + Number(r.epa || 0), 0);
  const totalPassYds = seasonsData.reduce((acc, r) => acc + Number(r.pass_yds || 0), 0);
  const totalPassTds = seasonsData.reduce((acc, r) => acc + Number(r.pass_tds || 0), 0);
  const totalPassInt = seasonsData.reduce((acc, r) => acc + Number(r.pass_int || 0), 0);
  const totalPassCmp = seasonsData.reduce((acc, r) => acc + Number(r.pass_cmp || 0), 0);
  const totalPassAtt = seasonsData.reduce((acc, r) => acc + Number(r.pass_att || 0), 0);

  const totalCarries = seasonsData.reduce((acc, r) => acc + Number(r.carries || 0), 0);
  const totalRushYds = seasonsData.reduce((acc, r) => acc + Number(r.rush_yds || 0), 0);
  const totalRushTds = seasonsData.reduce((acc, r) => acc + Number(r.rush_tds || 0), 0);

  const totalTgts = seasonsData.reduce((acc, r) => acc + Number(r.targets || 0), 0);
  const totalRec = seasonsData.reduce((acc, r) => acc + Number(r.receptions || 0), 0);
  const totalRecYds = seasonsData.reduce((acc, r) => acc + Number(r.rec_yds || 0), 0);
  const totalRecTds = seasonsData.reduce((acc, r) => acc + Number(r.rec_tds || 0), 0);
  const totalAirYds = seasonsData.reduce((acc, r) => acc + Number(r.air_yards || 0), 0);
  const totalYac = seasonsData.reduce((acc, r) => acc + Number(r.yac || 0), 0);

  const avgWopr = seasonsData.length ? (seasonsData.reduce((acc, r) => acc + Number(r.wopr || 0), 0) / seasonsData.length) : 0;
  const avgTgtShare = seasonsData.length ? (seasonsData.reduce((acc, r) => acc + Number(r.target_share || 0), 0) / seasonsData.length) : 0;
  const avgAyShare = seasonsData.length ? (seasonsData.reduce((acc, r) => acc + Number(r.air_yards_share || 0), 0) / seasonsData.length) : 0;

  const availableSeasons = Array.from(new Set(gameLogs.map((g) => g.season))).sort((a: any, b: any) => b - a);

  const rawFilteredLogs = selectedSeasonFilter === "ALL"
    ? gameLogs
    : gameLogs.filter((g) => g.season.toString() === selectedSeasonFilter);

  const sortedLogs = useMemo(() => {
    return [...rawFilteredLogs].sort((a, b) => {
      let valA = a[logSort.key];
      let valB = b[logSort.key];
      if (typeof valA === "string") {
        valA = valA.toLowerCase();
        valB = (valB || "").toLowerCase();
      }
      if (valA < valB) return logSort.dir === "asc" ? -1 : 1;
      if (valA > valB) return logSort.dir === "asc" ? 1 : -1;
      return 0;
    });
  }, [rawFilteredLogs, logSort]);

  const chronologicalLogs = useMemo(() => {
    return [...rawFilteredLogs].sort((a, b) => {
      if (a.season !== b.season) return a.season - b.season;
      return a.week - b.week;
    }).map((l) => ({
      name: `'${l.season.toString().slice(-2)} Wk ${l.week}`,
      points: Number(l.points || 0),
      team_name: l.team_name,
      started: l.started,
      slot: l.slot,
      nfl_team: l.nfl_team,
      nfl_opp: l.nfl_opponent,
      epa: l.total_epa,
    }));
  }, [rawFilteredLogs]);

  // Helper to format weekly NFL box line
  const formatBoxScoreLine = (log: any) => {
    const parts = [];
    if (log.attempts > 0 || log.passing_yards > 0 || log.passing_tds > 0) {
      parts.push(`${log.completions}/${log.attempts} pass, ${Math.round(log.passing_yards)} yds${log.passing_tds > 0 ? `, ${log.passing_tds} TD` : ""}${log.interceptions > 0 ? `, ${log.interceptions} INT` : ""}`);
    }
    if (log.carries > 0 || log.rushing_yards > 0 || log.rushing_tds > 0) {
      parts.push(`${log.carries} car, ${Math.round(log.rushing_yards)} yds${log.rushing_tds > 0 ? `, ${log.rushing_tds} TD` : ""}`);
    }
    if (log.targets > 0 || log.receptions > 0 || log.receiving_yards > 0 || log.receiving_tds > 0) {
      parts.push(`${log.receptions}/${log.targets} rec, ${Math.round(log.receiving_yards)} yds${log.receiving_tds > 0 ? `, ${log.receiving_tds} TD` : ""}`);
    }
    return parts.join(" • ") || "No NFL stats recorded";
  };

  const CustomChartTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="rounded-lg border border-rule-bright bg-card/95 p-2.5 shadow-xl backdrop-blur-md text-xs font-mono">
          <div className="font-bold text-ink mb-1">{data.name}</div>
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-ink-dim">Fantasy Pts:</span>
            <span className="font-bold text-brand-blue">{data.points.toFixed(1)}</span>
          </div>
          {data.nfl_team && data.nfl_opp && (
            <div className="text-[11px] text-ink-dim">
              NFL: <strong className="text-ink">{data.nfl_team}</strong> vs {data.nfl_opp}
            </div>
          )}
          {data.epa !== undefined && (
            <div className="text-[11px] text-ink-dim">
              EPA: <strong className={data.epa >= 0 ? "text-emerald-400" : "text-rose-400"}>
                {data.epa > 0 ? `+${data.epa.toFixed(1)}` : data.epa?.toFixed(1)}
              </strong>
            </div>
          )}
          <div className="text-[10px] text-ink-dim pt-1 border-t border-rule mt-1">
            Status: {data.started === 1 ? `Started (${data.slot})` : "Bench"} · {data.team_name}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Back Link */}
      <div>
        <Link href="/players" className="inline-flex items-center gap-1.5 text-xs font-mono text-brand-blue hover:underline">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Player Directory
        </Link>
      </div>

      {/* Hero Header Card */}
      <div className="glass-card rounded-2xl p-6 md:p-8 border border-rule relative overflow-hidden shadow-2xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="h-20 w-20 md:h-24 md:w-24 rounded-full overflow-hidden border-2 border-rule-bright bg-canvas shrink-0 shadow-lg">
              {headshot ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={headshot}
                  alt={playerName}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = "none";
                  }}
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center font-mono font-black text-xl text-ink-dim bg-card-elevated">
                  {position}
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center gap-2.5">
                <h1 className="font-mono text-2xl md:text-3xl font-black text-ink tracking-tight">
                  {playerName}
                </h1>
                <span className="rounded-md bg-brand-blue/15 px-2.5 py-0.5 text-xs font-mono font-bold text-brand-blue border border-brand-blue/30">
                  {position}
                </span>
              </div>
              <p className="text-xs md:text-sm text-ink-dim font-mono">
                {college ? `College: ${college}` : "NFL Veteran"} · {seasonsData.length} AFFL Stints ({seasonsData[seasonsData.length - 1].season}–{latest.season})
              </p>
              <div className="flex flex-wrap items-center gap-2 pt-1 font-mono text-xs">
                <span className="text-ink-dim">Career AFFL Points:</span>
                <strong className="text-brand-lime font-bold">{totalPoints.toFixed(1)}</strong>
                <span className="text-rule">|</span>
                <span className="text-ink-dim">Career NFL EPA:</span>
                <strong className={totalEpa >= 0 ? "text-emerald-400 font-bold" : "text-rose-400 font-bold"}>
                  {totalEpa > 0 ? `+${totalEpa.toFixed(1)}` : totalEpa.toFixed(1)}
                </strong>
              </div>
            </div>
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-xl bg-card-elevated p-3 border border-rule text-center">
              <span className="text-[10px] font-mono uppercase text-ink-dim block">Started</span>
              <span className="text-lg font-mono font-bold text-brand-lime">
                {totalStarted} <span className="text-xs text-ink-dim font-normal">/ {totalRostered}</span>
              </span>
            </div>
            <div className="rounded-xl bg-card-elevated p-3 border border-rule text-center">
              <span className="text-[10px] font-mono uppercase text-ink-dim block">Bench Pts</span>
              <span className="text-lg font-mono font-bold text-ink-muted">
                {totalBenchPoints.toFixed(1)}
              </span>
            </div>
            <div className="rounded-xl bg-card-elevated p-3 border border-rule text-center">
              <span className="text-[10px] font-mono uppercase text-ink-dim block">Career FPOE</span>
              <span className="text-lg font-mono font-bold text-brand-orange">
                {totalFpoe > 0 ? `+${totalFpoe.toFixed(1)}` : totalFpoe.toFixed(1)}
              </span>
            </div>
            <div className="rounded-xl bg-card-elevated p-3 border border-rule text-center">
              <span className="text-[10px] font-mono uppercase text-ink-dim block">Custody PAR</span>
              <span className="text-lg font-mono font-bold text-ink">
                {totalPar > 0 ? `+${totalPar.toFixed(1)}` : totalPar.toFixed(1)}
              </span>
            </div>
          </div>
        </div>

        {/* Position-Tailored NFL Career Stats Bar */}
        <div className="mt-6 pt-5 border-t border-rule flex flex-wrap items-center gap-3 text-xs font-mono">
          <span className="text-[11px] text-ink-dim uppercase font-bold flex items-center gap-1 mr-1">
            <Zap className="h-3.5 w-3.5 text-brand-yellow" />
            <span>NFLverse Career Box:</span>
          </span>

          {position === "QB" && (
            <>
              <span className="px-2.5 py-1 rounded bg-card-elevated border border-rule text-ink">
                Pass: <strong className="text-brand-blue">{totalPassYds.toLocaleString()} yds</strong> ({totalPassTds} TD / {totalPassInt} INT)
              </span>
              <span className="px-2.5 py-1 rounded bg-card-elevated border border-rule text-ink">
                Comp: <strong className="text-ink">{totalPassAtt > 0 ? ((totalPassCmp / totalPassAtt) * 100).toFixed(1) : 0}%</strong> ({totalPassCmp}/{totalPassAtt})
              </span>
              <span className="px-2.5 py-1 rounded bg-card-elevated border border-rule text-ink">
                Rush: <strong className="text-brand-lime">{totalRushYds.toLocaleString()} yds</strong> ({totalRushTds} TD)
              </span>
              <span className="px-2.5 py-1 rounded bg-card-elevated border border-rule text-ink">
                Total TDs: <strong className="text-brand-yellow font-bold">{totalPassTds + totalRushTds}</strong>
              </span>
            </>
          )}

          {position === "RB" && (
            <>
              <span className="px-2.5 py-1 rounded bg-card-elevated border border-rule text-ink">
                Rush: <strong className="text-brand-lime">{totalRushYds.toLocaleString()} yds</strong> ({totalCarries} car, {totalRushTds} TD)
              </span>
              <span className="px-2.5 py-1 rounded bg-card-elevated border border-rule text-ink">
                YPC: <strong className="text-ink">{totalCarries > 0 ? (totalRushYds / totalCarries).toFixed(2) : "0.00"}</strong>
              </span>
              <span className="px-2.5 py-1 rounded bg-card-elevated border border-rule text-ink">
                Rec: <strong className="text-purple-400">{totalRec} rec, {totalRecYds.toLocaleString()} yds</strong> ({totalRecTds} TD)
              </span>
              <span className="px-2.5 py-1 rounded bg-card-elevated border border-rule text-ink">
                Scrimmage: <strong className="text-brand-yellow">{(totalRushYds + totalRecYds).toLocaleString()} yds</strong> ({totalRushTds + totalRecTds} TD)
              </span>
            </>
          )}

          {(position === "WR" || position === "TE") && (
            <>
              <span className="px-2.5 py-1 rounded bg-card-elevated border border-rule text-ink">
                Rec: <strong className="text-purple-400">{totalRec} rec / {totalTgts} tgts</strong> ({totalTgts > 0 ? ((totalRec / totalTgts) * 100).toFixed(1) : 0}%)
              </span>
              <span className="px-2.5 py-1 rounded bg-card-elevated border border-rule text-ink">
                Rec Yds: <strong className="text-brand-yellow">{totalRecYds.toLocaleString()} yds</strong> ({totalRecTds} TD)
              </span>
              <span className="px-2.5 py-1 rounded bg-card-elevated border border-rule text-ink">
                Air Yds: <strong className="text-ink-muted">{Math.round(totalAirYds).toLocaleString()}</strong> · YAC: <strong className="text-brand-blue">{Math.round(totalYac).toLocaleString()}</strong>
              </span>
              <span className="px-2.5 py-1 rounded bg-card-elevated border border-rule text-ink">
                Avg WOPR: <strong className="text-brand-blue">{avgWopr.toFixed(3)}</strong>
              </span>
            </>
          )}
        </div>
      </div>

      {/* Advanced NFLverse Opportunity Matrix */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-xl border border-rule bg-card p-4 space-y-1">
          <div className="flex items-center justify-between text-xs text-ink-dim font-mono">
            <span>Career EPA</span>
            <Zap className="h-3.5 w-3.5 text-brand-yellow" />
          </div>
          <div className={`font-mono text-xl font-bold ${totalEpa >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
            {totalEpa > 0 ? `+${totalEpa.toFixed(1)}` : totalEpa.toFixed(1)}
          </div>
          <p className="text-[10px] text-ink-dim">Total Expected Points Added</p>
        </div>

        <div className="rounded-xl border border-rule bg-card p-4 space-y-1">
          <div className="flex items-center justify-between text-xs text-ink-dim font-mono">
            <span>Avg WOPR</span>
            <BarChart2 className="h-3.5 w-3.5 text-brand-blue" />
          </div>
          <div className="font-mono text-xl font-bold text-brand-blue">
            {avgWopr.toFixed(3)}
          </div>
          <p className="text-[10px] text-ink-dim">Weighted Opportunity Rating</p>
        </div>

        <div className="rounded-xl border border-rule bg-card p-4 space-y-1">
          <div className="flex items-center justify-between text-xs text-ink-dim font-mono">
            <span>Avg Target Share</span>
            <Activity className="h-3.5 w-3.5 text-brand-lime" />
          </div>
          <div className="font-mono text-xl font-bold text-brand-lime">
            {(avgTgtShare * 100).toFixed(1)}%
          </div>
          <p className="text-[10px] text-ink-dim">Team Target Percentage</p>
        </div>

        <div className="rounded-xl border border-rule bg-card p-4 space-y-1">
          <div className="flex items-center justify-between text-xs text-ink-dim font-mono">
            <span>Avg Air Yards %</span>
            <TrendingUp className="h-3.5 w-3.5 text-brand-orange" />
          </div>
          <div className="font-mono text-xl font-bold text-brand-orange">
            {(avgAyShare * 100).toFixed(1)}%
          </div>
          <p className="text-[10px] text-ink-dim">Team Air Yards Share</p>
        </div>
      </div>

      {/* Interactive Weekly Scoring Trajectory Area Chart */}
      {chronologicalLogs.length > 0 && (
        <div className="rounded-xl border border-rule bg-card p-5 space-y-4 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-rule pb-3">
            <div>
              <h2 className="font-mono text-base font-bold text-ink uppercase tracking-wider flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-brand-blue" />
                <span>Weekly Scoring Trajectory ({chronologicalLogs.length} Matchups)</span>
              </h2>
              <p className="text-xs text-ink-dim mt-0.5">
                Week-by-week standard non-PPR scoring timeline and starting threshold.
              </p>
            </div>

            {/* Season Filter Dropdown */}
            <div className="flex items-center gap-2 text-xs">
              <span className="font-mono text-ink-dim uppercase text-[10px]">Filter Season:</span>
              <select
                value={selectedSeasonFilter}
                onChange={(e) => setSelectedSeasonFilter(e.target.value)}
                className="rounded-md bg-card-elevated px-2.5 py-1 text-xs text-ink font-semibold border border-rule focus:outline-none cursor-pointer"
              >
                <option value="ALL">All Career ({gameLogs.length})</option>
                {availableSeasons.map((y) => (
                  <option key={y} value={y.toString()}>
                    {y} Season
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chronologicalLogs} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorPoints" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#5b87ac" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#5b87ac" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="name"
                  tick={{ fill: "#9a9d9f", fontSize: 10, fontFamily: "monospace" }}
                  axisLine={{ stroke: "#3d434c" }}
                  tickLine={{ stroke: "#3d434c" }}
                  interval="preserveStartEnd"
                />
                <YAxis
                  tick={{ fill: "#9a9d9f", fontSize: 10, fontFamily: "monospace" }}
                  axisLine={{ stroke: "#3d434c" }}
                  tickLine={{ stroke: "#3d434c" }}
                />
                <ReferenceLine y={10} stroke="#3d434c" strokeDasharray="3 3" label={{ value: "10 Pts", fill: "#9a9d9f", fontSize: 9 }} />
                <Tooltip content={<CustomChartTooltip />} />
                <Area
                  type="monotone"
                  dataKey="points"
                  stroke="#5b87ac"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorPoints)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* AFFL Custody Timeline & Stint Breakdown */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-brand-blue" />
          <h2 className="font-mono text-base font-bold text-ink uppercase tracking-wider">
            AFFL Custody Timeline & NFL Season Totals
          </h2>
        </div>

        <div className="rounded-xl border border-rule bg-card overflow-hidden shadow-md">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-rule bg-card-elevated/70 text-[10px] font-mono uppercase tracking-wider">
                  {renderCustodySortHeader("Season", "season", "left")}
                  {renderCustodySortHeader("AFFL Franchise", "franchise_name", "left")}
                  {renderCustodySortHeader("Starts", "weeks_started", "right")}
                  {renderCustodySortHeader("AFFL Pts", "affl_points", "right")}

                  {/* Position-Specific Columns */}
                  {position === "QB" && (
                    <>
                      {renderCustodySortHeader("Cmp/Att", "pass_att", "right")}
                      {renderCustodySortHeader("Pass Yds", "pass_yds", "right")}
                      {renderCustodySortHeader("Pass TD/INT", "pass_tds", "right")}
                      {renderCustodySortHeader("Rush Yds", "rush_yds", "right")}
                      {renderCustodySortHeader("Rush TD", "rush_tds", "right")}
                    </>
                  )}

                  {position === "RB" && (
                    <>
                      {renderCustodySortHeader("Carries", "carries", "right")}
                      {renderCustodySortHeader("Rush Yds", "rush_yds", "right")}
                      {renderCustodySortHeader("Rush TD", "rush_tds", "right")}
                      {renderCustodySortHeader("Rec Yds", "rec_yds", "right")}
                      {renderCustodySortHeader("Rec TD", "rec_tds", "right")}
                    </>
                  )}

                  {(position === "WR" || position === "TE") && (
                    <>
                      {renderCustodySortHeader("Tgts", "targets", "right")}
                      {renderCustodySortHeader("Rec", "receptions", "right")}
                      {renderCustodySortHeader("Rec Yds", "rec_yds", "right")}
                      {renderCustodySortHeader("Rec TD", "rec_tds", "right")}
                      {renderCustodySortHeader("Air Yds", "air_yards", "right")}
                      {renderCustodySortHeader("YAC", "yac", "right")}
                    </>
                  )}

                  {renderCustodySortHeader("EPA", "epa", "right")}
                  {renderCustodySortHeader("Custody PAR", "custody_par", "right")}
                </tr>
              </thead>
              <tbody className="divide-y divide-rule/60 stat-mono">
                {sortedSeasonsData.map((s, idx) => {
                  const passTds = Number(s.pass_tds || 0);
                  const passInt = Number(s.pass_int || 0);
                  const epaVal = Number(s.epa || 0);
                  const parVal = Number(s.custody_par || 0);

                  return (
                    <tr key={idx} className="hover:bg-card-hover/80 transition-colors">
                      <td className="py-3 px-3 font-mono font-bold text-ink">{s.season}</td>
                      <td className="py-3 px-3 font-sans font-semibold">
                        <Link
                          href={`/franchises/${s.franchise_id}`}
                          className="hover:underline flex items-center gap-2"
                          style={{ color: s.franchise_color || "#5b87ac" }}
                        >
                          <div
                            className="h-2.5 w-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: s.franchise_color || "#5b87ac" }}
                          />
                          <span>{s.franchise_name}</span>
                        </Link>
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-brand-lime">
                        {s.weeks_started} <span className="text-[10px] text-ink-dim font-normal">/ {s.weeks_rostered}</span>
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-ink">{Number(s.affl_points || 0).toFixed(1)}</td>

                      {/* Position Values */}
                      {position === "QB" && (
                        <>
                          <td className="py-3 px-3 text-right text-ink-muted">{s.pass_cmp}/{s.pass_att}</td>
                          <td className="py-3 px-3 text-right font-bold text-brand-blue">{Math.round(s.pass_yds || 0).toLocaleString()}</td>
                          <td className="py-3 px-3 text-right">
                            <span className="text-brand-yellow font-bold">{passTds}</span>
                            <span className="text-ink-dim"> / </span>
                            <span className="text-rose-400">{passInt}</span>
                          </td>
                          <td className="py-3 px-3 text-right text-brand-lime">{Math.round(s.rush_yds || 0).toLocaleString()}</td>
                          <td className="py-3 px-3 text-right text-brand-yellow font-bold">{s.rush_tds}</td>
                        </>
                      )}

                      {position === "RB" && (
                        <>
                          <td className="py-3 px-3 text-right text-ink-muted">{s.carries}</td>
                          <td className="py-3 px-3 text-right font-bold text-brand-lime">{Math.round(s.rush_yds || 0).toLocaleString()}</td>
                          <td className="py-3 px-3 text-right text-brand-yellow font-bold">{s.rush_tds}</td>
                          <td className="py-3 px-3 text-right text-purple-400">{Math.round(s.rec_yds || 0).toLocaleString()}</td>
                          <td className="py-3 px-3 text-right text-brand-yellow font-bold">{s.rec_tds}</td>
                        </>
                      )}

                      {(position === "WR" || position === "TE") && (
                        <>
                          <td className="py-3 px-3 text-right text-ink-muted">{s.targets}</td>
                          <td className="py-3 px-3 text-right text-ink font-semibold">{s.receptions}</td>
                          <td className="py-3 px-3 text-right font-bold text-purple-400">{Math.round(s.rec_yds || 0).toLocaleString()}</td>
                          <td className="py-3 px-3 text-right text-brand-yellow font-bold">{s.rec_tds}</td>
                          <td className="py-3 px-3 text-right text-ink-dim">{Math.round(s.air_yards || 0).toLocaleString()}</td>
                          <td className="py-3 px-3 text-right text-brand-blue">{Math.round(s.yac || 0).toLocaleString()}</td>
                        </>
                      )}

                      <td className={`py-3 px-3 text-right font-semibold ${epaVal >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                        {epaVal > 0 ? `+${epaVal.toFixed(1)}` : epaVal.toFixed(1)}
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-ink">
                        {parVal > 0 ? `+${parVal.toFixed(1)}` : parVal.toFixed(1)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Enriched Weekly Game Logs Table with NFL Box Score */}
      {gameLogs.length > 0 && (
        <div className="space-y-4 pt-4 border-t border-rule">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-brand-orange" />
              <h2 className="font-mono text-base font-bold text-ink uppercase tracking-wider">
                Weekly Game Logs & NFL Box Scores ({rawFilteredLogs.length} Matchups)
              </h2>
            </div>
            <span className="text-[11px] font-mono text-ink-dim">
              Complete nflverse passing, rushing, receiving, and EPA breakdowns
            </span>
          </div>

          <div className="rounded-xl border border-rule bg-card overflow-hidden shadow-md">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-rule bg-card-elevated/70 text-[10px] font-mono uppercase tracking-wider">
                    {renderLogSortHeader("Season", "season", "left", "py-2.5 px-3")}
                    {renderLogSortHeader("Week", "week", "left", "py-2.5 px-2")}
                    {renderLogSortHeader("AFFL Franchise", "team_name", "left", "py-2.5 px-3")}
                    <th className="py-2.5 px-3 text-left text-ink-dim text-[10px]">NFL Matchup</th>
                    {renderLogSortHeader("Status", "started", "center", "py-2.5 px-2")}
                    <th className="py-2.5 px-3 text-left text-ink-dim text-[10px] min-w-[220px]">NFL Game Box Line</th>
                    {renderLogSortHeader("EPA", "total_epa", "right", "py-2.5 px-3")}
                    {renderLogSortHeader("AFFL Pts", "points", "right", "py-2.5 px-3")}
                  </tr>
                </thead>
                <tbody className="divide-y divide-rule/60 font-mono">
                  {sortedLogs.map((log, idx) => {
                    const epaVal = Number(log.total_epa || 0);

                    return (
                      <tr key={idx} className="hover:bg-card-hover/80 transition-colors">
                        <td className="py-2.5 px-3 font-bold text-ink">{log.season}</td>
                        <td className="py-2.5 px-2 text-ink-dim">Wk {log.week}</td>
                        <td className="py-2.5 px-3 font-sans font-medium text-ink">
                          <div className="flex items-center gap-1.5 truncate max-w-[160px]">
                            <div
                              className="h-2 w-2 rounded-full shrink-0"
                              style={{ backgroundColor: log.franchise_color || "#5b87ac" }}
                            />
                            <span className="truncate">{log.team_name}</span>
                          </div>
                        </td>

                        {/* NFL Matchup */}
                        <td className="py-2.5 px-3 font-mono text-[11px]">
                          {log.nfl_team && log.nfl_opponent ? (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-card-elevated border border-rule">
                              <strong className="text-ink">{log.nfl_team}</strong>
                              <span className="text-ink-dim text-[9px]">vs</span>
                              <span className="text-ink-muted">{log.nfl_opponent}</span>
                            </span>
                          ) : (
                            <span className="text-ink-dim text-[10px]">BYE</span>
                          )}
                        </td>

                        {/* Status */}
                        <td className="py-2.5 px-2 text-center">
                          {log.started === 1 ? (
                            <span className="inline-flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold">
                              <CheckCircle2 className="h-2.5 w-2.5" /> {log.slot || "Start"}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded bg-card-elevated text-ink-dim border border-rule">
                              <XCircle className="h-2.5 w-2.5 text-ink-dim/60" /> Bench
                            </span>
                          )}
                        </td>

                        {/* NFL Box Line */}
                        <td className="py-2.5 px-3 font-mono text-[11px] text-ink">
                          {formatBoxScoreLine(log)}
                        </td>

                        {/* Game EPA */}
                        <td className={`py-2.5 px-3 text-right font-bold ${epaVal >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                          {epaVal > 0 ? `+${epaVal.toFixed(1)}` : epaVal.toFixed(1)}
                        </td>

                        {/* AFFL Points */}
                        <td
                          className={`py-2.5 px-3 text-right font-bold text-sm ${
                            log.started === 1 ? "text-brand-blue" : "text-ink-dim"
                          }`}
                        >
                          {Number(log.points || 0).toFixed(1)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

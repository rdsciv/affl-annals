"use client";

import { useState, useEffect } from "react";
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
  Zap
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

        // Load weekly gamelogs
        try {
          const allLogs = await fetchMartJson("mart_affl_player_gamelogs.json");
          const pLogs = allLogs[rawId] || (matches[0] ? allLogs[matches[0].gsis_id || `PID_${matches[0].player_id}`] : null);
          if (pLogs && pLogs.gamelogs) {
            setGameLogs(pLogs.gamelogs);
          }
        } catch (eLogs) {
          console.warn("Could not load player weekly gamelogs:", eLogs);
        }
      } catch (err) {
        console.error("Error loading player details:", err);
      } finally {
        setLoading(false);
      }
    }
    loadPlayerData();
  }, [rawId]);

  if (loading) {
    return (
      <div className="py-24 text-center text-xs font-mono text-ink-dim">
        Loading player custody record...
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

  const totalPoints = seasonsData.reduce((acc, r) => acc + Number(r.affl_points || 0), 0);
  const totalBenchPoints = seasonsData.reduce((acc, r) => acc + Number(r.bench_points || 0), 0);
  const totalStarted = seasonsData.reduce((acc, r) => acc + Number(r.weeks_started || 0), 0);
  const totalRostered = seasonsData.reduce((acc, r) => acc + Number(r.weeks_rostered || 0), 0);
  const totalXfp = seasonsData.reduce((acc, r) => acc + Number(r.xfp || 0), 0);
  const totalFpoe = seasonsData.reduce((acc, r) => acc + Number(r.fpoe || 0), 0);
  const totalPar = seasonsData.reduce((acc, r) => acc + Number(r.custody_par || 0), 0);
  const totalEpa = seasonsData.reduce((acc, r) => acc + Number(r.epa || 0), 0);
  const avgWopr = seasonsData.length ? (seasonsData.reduce((acc, r) => acc + Number(r.wopr || 0), 0) / seasonsData.length) : 0;
  const avgTgtShare = seasonsData.length ? (seasonsData.reduce((acc, r) => acc + Number(r.target_share || 0), 0) / seasonsData.length) : 0;
  const avgAyShare = seasonsData.length ? (seasonsData.reduce((acc, r) => acc + Number(r.air_yards_share || 0), 0) / seasonsData.length) : 0;

  const availableSeasons = Array.from(new Set(gameLogs.map((g) => g.season))).sort((a: any, b: any) => b - a);

  const filteredLogs = selectedSeasonFilter === "ALL"
    ? gameLogs
    : gameLogs.filter((g) => g.season.toString() === selectedSeasonFilter);

  // Chart data sorted chronologically for area chart
  const chronologicalLogs = [...filteredLogs].reverse().map((g) => ({
    name: `${g.season} Wk${g.week}`,
    points: Number(g.points || 0),
    started: g.started,
    opponent: g.opponent_name,
    team: g.team_name,
  }));

  const CustomChartTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const d = payload[0].payload;
      return (
        <div className="rounded-lg border border-rule-bright bg-card-elevated p-2.5 shadow-xl text-xs font-mono space-y-1">
          <div className="font-bold text-ink">{d.name}</div>
          <div className="text-[11px] text-ink-muted">vs {d.opponent}</div>
          <div className="text-brand-blue font-bold">{d.points.toFixed(1)} Pts</div>
          <div className="text-[10px] text-ink-dim">
            {d.started ? "Started in Lineup" : "Benched"}
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
        <Link
          href="/players"
          className="inline-flex items-center gap-1.5 text-xs text-ink-muted hover:text-brand-blue transition-colors font-mono"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Player Directory</span>
        </Link>
      </div>

      {/* Player Header Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-rule-bright bg-card p-6 md:p-8 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="relative h-20 w-20 md:h-24 md:w-24 rounded-full overflow-hidden border-2 border-rule-bright bg-canvas shrink-0 shadow-lg">
              {headshot ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={headshot}
                  alt={playerName}
                  className="h-full w-full object-cover object-top"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center font-mono text-xl font-bold text-ink-dim">
                  {playerName.slice(0, 2).toUpperCase()}
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center gap-3">
                <h1 className="font-mono text-2xl md:text-3xl font-black text-ink">
                  {playerName}
                </h1>
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-brand-blue/15 text-brand-blue border border-brand-blue/30">
                  {position}
                </span>
              </div>
              <p className="text-xs font-mono text-ink-dim">
                {college ? `College: ${college} • ` : ""}
                GSIS: {rawId}
              </p>
              <div className="flex items-center gap-2 pt-1">
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-card-elevated text-ink-muted border border-rule">
                  {seasonsData.length} AFFL Seasons
                </span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-brand-lime/10 text-brand-lime border border-brand-lime/20 font-semibold">
                  {totalPoints.toFixed(1)} Lifetime Pts
                </span>
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
      </div>

      {/* Advanced NFLverse Opportunity Matrix */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-xl border border-rule bg-card p-4 space-y-1">
          <div className="flex items-center justify-between text-xs text-ink-dim font-mono">
            <span>Career EPA</span>
            <Zap className="h-3.5 w-3.5 text-brand-yellow" />
          </div>
          <div className="font-mono text-xl font-bold text-ink">
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
                    <stop offset="5%" stopColor="#00a2ff" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#00a2ff" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="name"
                  tick={{ fill: "#64748b", fontSize: 10, fontFamily: "monospace" }}
                  axisLine={{ stroke: "#334155" }}
                  tickLine={{ stroke: "#334155" }}
                  interval="preserveStartEnd"
                />
                <YAxis
                  tick={{ fill: "#64748b", fontSize: 10, fontFamily: "monospace" }}
                  axisLine={{ stroke: "#334155" }}
                  tickLine={{ stroke: "#334155" }}
                />
                <ReferenceLine y={10} stroke="#475569" strokeDasharray="3 3" label={{ value: "10 Pts", fill: "#64748b", fontSize: 9 }} />
                <Tooltip content={<CustomChartTooltip />} />
                <Area
                  type="monotone"
                  dataKey="points"
                  stroke="#00a2ff"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorPoints)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* AFFL Custody Stint Breakdown */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-brand-blue" />
          <h2 className="font-mono text-base font-bold text-ink uppercase tracking-wider">
            AFFL Custody Timeline & Stint Breakdown
          </h2>
        </div>

        <div className="rounded-xl border border-rule bg-card overflow-hidden shadow-md">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-rule bg-card-elevated/70 text-[11px] font-mono uppercase tracking-wider text-ink-dim">
                  <th className="py-3 px-4">Season</th>
                  <th className="py-3 px-4">AFFL Franchise</th>
                  <th className="py-3 px-3 text-right">Rostered</th>
                  <th className="py-3 px-3 text-right">Started</th>
                  <th className="py-3 px-4 text-right">AFFL Points</th>
                  <th className="py-3 px-4 text-right">Bench Points</th>
                  <th className="py-3 px-4 text-right">xFP</th>
                  <th className="py-3 px-4 text-right">FPOE</th>
                  <th className="py-3 px-4 text-right">Custody PAR</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-rule/60 stat-mono">
                {seasonsData.map((s, idx) => (
                  <tr key={idx} className="hover:bg-card-hover/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-ink">{s.season}</td>
                    <td className="py-3 px-4 font-sans font-semibold">
                      <Link
                        href={`/franchises/${s.franchise_id}`}
                        className="hover:underline flex items-center gap-2"
                        style={{ color: s.franchise_color || "#00a2ff" }}
                      >
                        <div
                          className="h-2.5 w-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: s.franchise_color || "#00a2ff" }}
                        />
                        <span>{s.franchise_name}</span>
                      </Link>
                    </td>
                    <td className="py-3 px-3 text-right text-ink-muted">{s.weeks_rostered} wks</td>
                    <td className="py-3 px-3 text-right font-bold text-brand-lime">{s.weeks_started} wks</td>
                    <td className="py-3 px-4 text-right font-bold text-ink">{Number(s.affl_points || 0).toFixed(1)}</td>
                    <td className="py-3 px-4 text-right text-ink-dim">{Number(s.bench_points || 0).toFixed(1)}</td>
                    <td className="py-3 px-4 text-right text-brand-blue">{Number(s.xfp || 0).toFixed(1)}</td>
                    <td className="py-3 px-4 text-right text-brand-orange">
                      {Number(s.fpoe || 0) > 0 ? `+${Number(s.fpoe || 0).toFixed(1)}` : Number(s.fpoe || 0).toFixed(1)}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-ink">
                      {Number(s.custody_par || 0) > 0 ? `+${Number(s.custody_par || 0).toFixed(1)}` : Number(s.custody_par || 0).toFixed(1)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Weekly Game Logs Table */}
      {gameLogs.length > 0 && (
        <div className="space-y-4 pt-4 border-t border-rule">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-brand-orange" />
            <h2 className="font-mono text-base font-bold text-ink uppercase tracking-wider">
              Weekly Game Logs & Lineup Status ({filteredLogs.length} Games)
            </h2>
          </div>

          <div className="rounded-xl border border-rule bg-card overflow-hidden shadow-md">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-rule bg-card-elevated/70 text-[10px] font-mono uppercase tracking-wider text-ink-dim">
                    <th className="py-2.5 px-4">Season</th>
                    <th className="py-2.5 px-3">Week</th>
                    <th className="py-2.5 px-4">AFFL Franchise</th>
                    <th className="py-2.5 px-4">Opponent</th>
                    <th className="py-2.5 px-3 text-center">Slot</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                    <th className="py-2.5 px-4 text-right">Points</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-rule/60 font-mono">
                  {filteredLogs.map((log, idx) => (
                    <tr key={idx} className="hover:bg-card-hover/80 transition-colors">
                      <td className="py-2.5 px-4 font-bold text-ink">{log.season}</td>
                      <td className="py-2.5 px-3 text-ink-dim">Wk {log.week}</td>
                      <td className="py-2.5 px-4 font-sans font-medium text-ink">
                        <div className="flex items-center gap-2">
                          <div
                            className="h-2 w-2 rounded-full shrink-0"
                            style={{ backgroundColor: log.franchise_color || "#00a2ff" }}
                          />
                          <span>{log.team_name}</span>
                        </div>
                      </td>
                      <td className="py-2.5 px-4 font-sans text-ink-muted">{log.opponent_name}</td>
                      <td className="py-2.5 px-3 text-center">
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-card-elevated border border-rule text-ink-dim">
                          {log.slot}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        {log.started === 1 ? (
                          <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold">
                            <CheckCircle2 className="h-2.5 w-2.5" /> Started
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.2 rounded bg-card-elevated text-ink-dim border border-rule">
                            <XCircle className="h-2.5 w-2.5 text-ink-dim/60" /> Bench
                          </span>
                        )}
                      </td>
                      <td
                        className={`py-2.5 px-4 text-right font-bold text-sm ${
                          log.started === 1 ? "text-brand-blue" : "text-ink-dim"
                        }`}
                      >
                        {log.points.toFixed(1)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

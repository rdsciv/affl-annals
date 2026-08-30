"use client";

import { useState, useEffect } from "react";
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
  BarChart2
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ReferenceLine,
} from "recharts";
import { CANONICAL_FRANCHISES } from "@/lib/constants";
import { fetchMartJson } from "@/lib/api";

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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSeasons() {
      try {
        const allSeasons = await fetchMartJson("mart_affl_franchise_season.json");
        const matches = allSeasons.filter((s: any) => s.franchise_id === fid);
        matches.sort((a: any, b: any) => b.season - a.season);
        setSeasons(matches);
      } catch (err) {
        console.error("Error loading franchise seasons:", err);
      } finally {
        setLoading(false);
      }
    }
    loadSeasons();
  }, [fid]);

  const totalWins = seasons.reduce((acc, s) => acc + Number(s.wins || 0), 0);
  const totalLosses = seasons.reduce((acc, s) => acc + Number(s.losses || 0), 0);
  const totalTies = seasons.reduce((acc, s) => acc + Number(s.ties || 0), 0);
  const totalPf = seasons.reduce((acc, s) => acc + Number(s.points_for || 0), 0);
  const totalPa = seasons.reduce((acc, s) => acc + Number(s.points_against || 0), 0);
  const titlesCount = seasons.filter((s) => s.is_champion === 1 || s.final_rank === 1).length;
  const winPct = (totalWins + totalLosses) > 0 ? (totalWins / (totalWins + totalLosses) * 100).toFixed(1) : "0.0";

  // Chronological season progression data for Recharts
  const progressionData = [...seasons].reverse().map((s) => ({
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
        <div className="rounded-lg border border-rule-bright bg-card-elevated p-3 shadow-xl text-xs font-mono space-y-1.5">
          <div className="font-bold text-ink flex items-center justify-between gap-2">
            <span>{d.season} Season</span>
            {d.is_champion && (
              <span className="text-amber-400 font-bold flex items-center gap-0.5 text-[10px]">
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
            <div
              className="h-20 w-20 md:h-24 md:w-24 rounded-2xl flex items-center justify-center font-mono font-black text-2xl md:text-3xl shadow-lg shrink-0"
              style={{
                backgroundColor: `${franchise.primary_color}20`,
                color: franchise.primary_color,
                border: `2.5px solid ${franchise.primary_color}`,
              }}
            >
              {franchise.display_name.slice(0, 2).toUpperCase()}
            </div>

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
                Permanent Identity: {franchise.franchise_id} • Primary Owner: {franchise.owner_display_name}
              </p>
              <div className="flex items-center gap-2 pt-1">
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-card-elevated text-ink-muted border border-rule">
                  {seasons.length} Seasons ({franchise.first_season}–{franchise.last_season})
                </span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-brand-blue/10 text-brand-blue border border-brand-blue/20">
                  {franchise.is_active ? "Active Club" : "Alumni Franchise"}
                </span>
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
      </div>

      {/* Season-by-Season Production Progression Recharts Chart */}
      {progressionData.length > 0 && (
        <div className="rounded-xl border border-rule bg-card p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-rule pb-3">
            <div>
              <h2 className="font-mono text-base font-bold text-ink uppercase tracking-wider flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-brand-blue" />
                <span>Historical Production & Point Differential Trajectory</span>
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
              Historical Season Ledger (Historical Names & Results)
            </h2>
          </div>
        </div>

        <div className="rounded-xl border border-rule bg-card overflow-hidden shadow-md">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-rule bg-card-elevated/70 text-[11px] font-mono uppercase tracking-wider text-ink-dim">
                  <th className="py-3 px-4">Season</th>
                  <th className="py-3 px-4">Historical Team Name</th>
                  <th className="py-3 px-3">Abbrev</th>
                  <th className="py-3 px-3 text-center">Record</th>
                  <th className="py-3 px-3 text-center">Win %</th>
                  <th className="py-3 px-4 text-right">Points For</th>
                  <th className="py-3 px-4 text-right">Points Against</th>
                  <th className="py-3 px-3 text-center">Finish</th>
                  <th className="py-3 px-3 text-center">Result</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-rule/60 stat-mono">
                {seasons.map((s, idx) => {
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
    </div>
  );
}

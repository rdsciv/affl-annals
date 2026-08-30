"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Sparkles, 
  TrendingUp, 
  TrendingDown, 
  Shield, 
  Calendar, 
  AlertCircle, 
  Activity, 
  HelpCircle, 
  Layers, 
  Trophy,
  ArrowRight,
  Flame,
  Award
} from "lucide-react";
import { fetchMartJson } from "@/lib/api";
import { CANONICAL_FRANCHISES } from "@/lib/constants";

export default function LuckAndSkillPage() {
  const [data, setData] = useState<any>(null);
  const [selectedSeason, setSelectedSeason] = useState<string>("ALL-TIME");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetchMartJson("mart_affl_luck_and_skill.json");
        setData(res);
      } catch (err) {
        console.error("Error loading luck and skill mart:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="py-24 text-center text-xs font-mono text-ink-dim">
        Computing Schedule Luck, All-Play Permutations, and Lineup Efficiency...
      </div>
    );
  }

  if (!data) {
    return (
      <div className="py-24 text-center text-xs font-mono text-rose-400">
        Failed to load Luck & Skill analytics data.
      </div>
    );
  }

  const { kpis, all_time_ledger, heartbreakers, heists, matrix, season_simulations, lineup_efficiency, worst_blunders, repeatability } = data;
  const currentSimData = season_simulations[selectedSeason] || [];
  const activeFids = [
    "FRAN_SVS", "FRAN_FFC", "FRAN_GGG", "FRAN_SDS", "FRAN_DCMC", "FRAN_GTF",
    "FRAN_WWL", "FRAN_TJS", "FRAN_PTP", "FRAN_HLH", "FRAN_COG", "FRAN_PLW"
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Header Banner */}
      <div className="space-y-2 border-b border-rule pb-6">
        <div className="flex items-center gap-2 text-xs font-mono font-bold text-brand-blue uppercase tracking-wider">
          <span>AFFL SAVANT</span>
          <span>•</span>
          <span>EMPIRICAL ANALYSIS</span>
        </div>
        <h1 className="font-mono text-3xl sm:text-4xl font-black text-ink tracking-tight flex items-center gap-3">
          <span>LUCK & SKILL</span>
        </h1>
        <p className="text-xs md:text-sm text-ink-muted max-w-4xl leading-relaxed">
          How much of fantasy football is schedule fortune vs true management ability? We simulated every regular season matchup across all 12 AFFL seasons against all possible schedules to isolate genuine roster quality from schedule variance.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card rounded-xl p-5 border border-rule space-y-1.5 shadow-xl">
          <div className="text-[10px] font-mono text-ink-dim uppercase tracking-wider flex items-center justify-between">
            <span>Most Unlucky Club</span>
            <TrendingDown className="h-3.5 w-3.5 text-rose-400" />
          </div>
          <div className="font-mono text-lg font-bold text-rose-400">
            Westeros Warlords
          </div>
          <p className="text-[11px] text-ink-dim font-mono">
            -14.2 Wins below All-Play Expected record over 12 seasons
          </p>
        </div>

        <div className="glass-card rounded-xl p-5 border border-rule space-y-1.5 shadow-xl">
          <div className="text-[10px] font-mono text-ink-dim uppercase tracking-wider flex items-center justify-between">
            <span>Luckiest Club</span>
            <TrendingUp className="h-3.5 w-3.5 text-brand-lime" />
          </div>
          <div className="font-mono text-lg font-bold text-brand-lime">
            Goleta Gringos
          </div>
          <p className="text-[11px] text-ink-dim font-mono">
            +11.4 Wins above All-Play Expected record over 12 seasons
          </p>
        </div>

        <div className="glass-card rounded-xl p-5 border border-rule space-y-1.5 shadow-xl">
          <div className="text-[10px] font-mono text-ink-dim uppercase tracking-wider flex items-center justify-between">
            <span>Schedule Luck Impact</span>
            <Activity className="h-3.5 w-3.5 text-brand-blue" />
          </div>
          <div className="font-mono text-2xl font-black text-brand-blue">
            18.6%
          </div>
          <p className="text-[11px] text-ink-dim font-mono">
            of all AFFL games were flipped by opponent draw rather than points scored
          </p>
        </div>

        <div className="glass-card rounded-xl p-5 border border-rule space-y-1.5 shadow-xl">
          <div className="text-[10px] font-mono text-ink-dim uppercase tracking-wider flex items-center justify-between">
            <span>Luck Repeatability</span>
            <HelpCircle className="h-3.5 w-3.5 text-brand-orange" />
          </div>
          <div className="font-mono text-2xl font-black text-brand-orange">
            r = -0.03
          </div>
          <p className="text-[11px] text-ink-dim font-mono">
            Zero year-over-year correlation (pure random noise vs r = 0.54 for Points For)
          </p>
        </div>
      </div>

      {/* 1. ALL-TIME LUCK LEDGER */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-brand-blue" />
            <h2 className="font-mono text-base font-bold text-ink uppercase tracking-wider">
              All-Time Luck Ledger (Regular Season History)
            </h2>
          </div>
          <span className="text-[11px] font-mono text-ink-dim">
            Sorted by Net Luck Delta (Actual Wins - Expected All-Play Wins)
          </span>
        </div>

        <div className="rounded-xl border border-rule bg-card overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-rule bg-card-elevated/70 text-[10px] font-mono uppercase tracking-wider text-ink-dim">
                  <th className="py-3 px-4">Franchise</th>
                  <th className="py-3 px-2 text-center">Seasons</th>
                  <th className="py-3 px-3 text-center">Actual Record</th>
                  <th className="py-3 px-3 text-center">All-Play Rec</th>
                  <th className="py-3 px-3 text-center">All-Play %</th>
                  <th className="py-3 px-3 text-center">Exp Wins</th>
                  <th className="py-3 px-4 text-center">Luck Rating</th>
                  <th className="py-3 px-4 text-right">Points For</th>
                  <th className="py-3 px-4 text-right">Points Against</th>
                  <th className="py-3 px-3 text-center">Titles</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-rule/60 stat-mono text-ink-muted">
                {all_time_ledger.map((row: any, idx: number) => {
                  const isLucky = row.luck_delta > 0;
                  return (
                    <tr key={idx} className="hover:bg-card-hover/80 transition-colors">
                      <td className="py-3 px-4 font-sans font-semibold text-ink">
                        <Link
                          href={`/franchises/${row.franchise_id}`}
                          className="hover:underline flex items-center gap-2.5"
                        >
                          <div
                            className="h-2.5 w-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: row.primary_color }}
                          />
                          <span>{row.franchise_name}</span>
                        </Link>
                      </td>
                      <td className="py-3 px-2 text-center font-mono text-ink-dim">{row.seasons_count}</td>
                      <td className="py-3 px-3 text-center font-mono font-bold text-ink">
                        {row.actual_wins}-{row.actual_losses}{row.actual_ties > 0 ? `-${row.actual_ties}` : ""}
                      </td>
                      <td className="py-3 px-3 text-center font-mono text-ink-dim">
                        {row.ap_wins}-{row.ap_losses}
                      </td>
                      <td className="py-3 px-3 text-center font-mono text-brand-blue font-semibold">
                        {row.ap_win_pct}%
                      </td>
                      <td className="py-3 px-3 text-center font-mono text-ink-dim">
                        {row.expected_wins}
                      </td>
                      <td className="py-3 px-4 text-center font-mono font-bold">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold ${
                            isLucky
                              ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                              : "bg-rose-500/15 text-rose-400 border border-rose-500/30"
                          }`}
                        >
                          {isLucky ? `+${row.luck_delta}` : row.luck_delta}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-semibold text-brand-blue">
                        {Number(row.total_pf).toLocaleString(undefined, { maximumFractionDigits: 1 })}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-ink-dim">
                        {Number(row.total_pa).toLocaleString(undefined, { maximumFractionDigits: 1 })}
                      </td>
                      <td className="py-3 px-3 text-center font-mono font-bold text-brand-yellow">
                        {row.titles > 0 ? (
                          <span className="inline-flex items-center gap-1 text-xs">
                            <Trophy className="h-3 w-3" /> {row.titles}
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* 2. HEARTBREAKERS & HEISTS */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Heartbreakers */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-rose-400">
            <TrendingDown className="h-4 w-4" />
            <h3 className="font-mono text-sm font-bold uppercase tracking-wider text-ink">
              Wins The Schedule Gave Away (Heartbreakers)
            </h3>
          </div>
          <p className="text-[11px] text-ink-dim">
            Top weekly scoring performances in league history that resulted in a loss.
          </p>

          <div className="rounded-xl border border-rule bg-card overflow-hidden shadow-md">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-rule bg-card-elevated/70 text-[10px] font-mono uppercase text-ink-dim">
                    <th className="py-2.5 px-3">Season/Wk</th>
                    <th className="py-2.5 px-3">Franchise</th>
                    <th className="py-2.5 px-3 text-right">Score</th>
                    <th className="py-2.5 px-3">Opponent</th>
                    <th className="py-2.5 px-3 text-right">Opp Score</th>
                    <th className="py-2.5 px-2 text-center">Rank</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-rule/60 stat-mono text-ink-muted">
                  {heartbreakers.slice(0, 8).map((hb: any, i: number) => (
                    <tr key={i} className="hover:bg-card-hover/80 transition-colors">
                      <td className="py-2.5 px-3 font-mono font-bold text-ink">
                        {hb.season} Wk{hb.week}
                      </td>
                      <td className="py-2.5 px-3 font-sans font-semibold" style={{ color: hb.primary_color }}>
                        {hb.franchise_name}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-brand-blue">
                        {hb.points.toFixed(1)}
                      </td>
                      <td className="py-2.5 px-3 font-sans text-ink-dim">
                        {hb.opp_franchise_name}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-rose-400">
                        {hb.opponent_points.toFixed(1)}
                      </td>
                      <td className="py-2.5 px-2 text-center">
                        <span className="px-1.5 py-0.5 rounded bg-rose-500/15 text-rose-400 font-mono text-[10px] font-bold border border-rose-500/30">
                          #{hb.weekly_rank}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Heists */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-brand-lime">
            <TrendingUp className="h-4 w-4" />
            <h3 className="font-mono text-sm font-bold uppercase tracking-wider text-ink">
              Wins The Schedule Stole (Highway Robbery)
            </h3>
          </div>
          <p className="text-[11px] text-ink-dim">
            Lowest weekly scoring performances in league history that still walked away with a victory.
          </p>

          <div className="rounded-xl border border-rule bg-card overflow-hidden shadow-md">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-rule bg-card-elevated/70 text-[10px] font-mono uppercase text-ink-dim">
                    <th className="py-2.5 px-3">Season/Wk</th>
                    <th className="py-2.5 px-3">Franchise</th>
                    <th className="py-2.5 px-3 text-right">Score</th>
                    <th className="py-2.5 px-3">Opponent</th>
                    <th className="py-2.5 px-3 text-right">Opp Score</th>
                    <th className="py-2.5 px-2 text-center">Rank</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-rule/60 stat-mono text-ink-muted">
                  {heists.slice(0, 8).map((heist: any, i: number) => (
                    <tr key={i} className="hover:bg-card-hover/80 transition-colors">
                      <td className="py-2.5 px-3 font-mono font-bold text-ink">
                        {heist.season} Wk{heist.week}
                      </td>
                      <td className="py-2.5 px-3 font-sans font-semibold" style={{ color: heist.primary_color }}>
                        {heist.franchise_name}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-brand-lime">
                        {heist.points.toFixed(1)}
                      </td>
                      <td className="py-2.5 px-3 font-sans text-ink-dim">
                        {heist.opp_franchise_name}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-ink-dim">
                        {heist.opponent_points.toFixed(1)}
                      </td>
                      <td className="py-2.5 px-2 text-center">
                        <span className="px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 font-mono text-[10px] font-bold border border-emerald-500/30">
                          #{heist.weekly_rank}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* 3. SCHEDULE-LUCK SIMULATION */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-brand-orange" />
            <h2 className="font-mono text-base font-bold text-ink uppercase tracking-wider">
              Schedule-Luck Simulation ({selectedSeason})
            </h2>
          </div>

          {/* Season Filter Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 bg-card-elevated p-1 rounded-lg border border-rule">
            {["ALL-TIME", "2025", "2024", "2023", "2022", "2021", "2020", "2019", "2018", "2017", "2016", "2015", "2014"].map((yr) => (
              <button
                key={yr}
                onClick={() => setSelectedSeason(yr)}
                className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold transition-colors ${
                  selectedSeason === yr
                    ? "bg-brand-blue text-white"
                    : "text-ink-dim hover:text-ink hover:bg-card"
                }`}
              >
                {yr}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-rule bg-card overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-rule bg-card-elevated/70 text-[10px] font-mono uppercase tracking-wider text-ink-dim">
                  <th className="py-3 px-4">Franchise</th>
                  <th className="py-3 px-3 text-center">Actual Wins</th>
                  <th className="py-3 px-3 text-center">Exp Wins</th>
                  <th className="py-3 px-3 text-center">Luck Rating</th>
                  <th className="py-3 px-4 text-center">Win %</th>
                  <th className="py-3 px-4 text-right">Points For</th>
                  <th className="py-3 px-4 text-right">Opp PPG</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-rule/60 stat-mono text-ink-muted">
                {currentSimData.map((row: any, idx: number) => {
                  const isLucky = row.luck_delta > 0;
                  return (
                    <tr key={idx} className="hover:bg-card-hover/80 transition-colors">
                      <td className="py-3 px-4 font-sans font-semibold text-ink">
                        <div className="flex items-center gap-2">
                          <div
                            className="h-2.5 w-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: row.primary_color }}
                          />
                          <span>{row.franchise_name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-center font-mono font-bold text-ink">
                        {row.actual_wins}-{row.actual_losses}
                      </td>
                      <td className="py-3 px-3 text-center font-mono text-brand-blue font-semibold">
                        {row.expected_wins}
                      </td>
                      <td className="py-3 px-3 text-center font-mono font-bold">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold ${
                            isLucky
                              ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                              : "bg-rose-500/15 text-rose-400 border border-rose-500/30"
                          }`}
                        >
                          {isLucky ? `+${row.luck_delta}` : row.luck_delta}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center font-mono text-ink font-semibold">
                        {row.win_pct}%
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-semibold text-brand-blue">
                        {Number(row.total_pf).toFixed(1)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-ink-dim">
                        {row.opp_ppg}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* 4. "IF YOU HAD PLAYED THEIR SCHEDULE" (12x12 Grid) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-brand-blue" />
            <h2 className="font-mono text-base font-bold text-ink uppercase tracking-wider">
              If You Had Played Their Schedule (All-Time Swap Matrix)
            </h2>
          </div>
          <span className="text-[11px] font-mono text-ink-dim">
            Rows = Your Team Scores • Columns = Played on Opponent&apos;s Schedule
          </span>
        </div>

        <div className="rounded-xl border border-rule bg-card p-4 overflow-x-auto shadow-2xl">
          <table className="border-collapse text-xs font-mono min-w-full">
            <thead>
              <tr>
                <th className="p-2 text-left text-ink-dim uppercase text-[10px] font-bold border-b border-r border-rule">
                  Team \ Schedule
                </th>
                {activeFids.map((fid) => {
                  const meta = CANONICAL_FRANCHISES.find((f) => f.franchise_id === fid);
                  const abbrev = fid.replace("FRAN_", "");
                  return (
                    <th key={fid} className="p-2 text-center text-ink-dim font-bold border-b border-rule min-w-[50px]">
                      <div className="flex items-center justify-center gap-1">
                        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: meta?.primary_color || "#00a2ff" }} />
                        <span>{abbrev}</span>
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {activeFids.map((rFid) => {
                const rMeta = CANONICAL_FRANCHISES.find((f) => f.franchise_id === rFid);
                return (
                  <tr key={rFid} className="hover:bg-card-hover/40 transition-colors">
                    <td className="p-2.5 font-bold text-ink border-r border-rule whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: rMeta?.primary_color || "#00a2ff" }} />
                        <span>{rMeta?.display_name || rFid}</span>
                      </div>
                    </td>
                    {activeFids.map((cFid) => {
                      const cell = matrix[rFid]?.[cFid] || { wins: 0, losses: 0, ties: 0 };
                      const ownCell = matrix[rFid]?.[rFid] || { wins: 0, losses: 0, ties: 0 };
                      const deltaWins = cell.wins - ownCell.wins;
                      const isDiag = rFid === cFid;

                      let bg = "bg-transparent";
                      if (!isDiag) {
                        if (deltaWins > 2) bg = "bg-emerald-500/20 text-emerald-300 font-bold";
                        else if (deltaWins < -2) bg = "bg-rose-500/20 text-rose-300 font-bold";
                        else bg = "text-ink-muted";
                      } else {
                        bg = "bg-card-elevated text-ink font-bold border border-rule";
                      }

                      return (
                        <td
                          key={cFid}
                          className={`p-2 text-center border-b border-rule/50 ${bg}`}
                          title={`${rMeta?.display_name} on ${cFid} schedule: ${cell.wins}-${cell.losses}`}
                        >
                          {cell.wins}-{cell.losses}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* 5. LINEUP EFFICIENCY & COACHING SKILL */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="h-5 w-5 text-brand-lime" />
            <h2 className="font-mono text-base font-bold text-ink uppercase tracking-wider">
              Lineup Optimization & Coaching Skill
            </h2>
          </div>
          <span className="text-[11px] font-mono text-ink-dim">
            Actual Starting Lineup Points vs Best Possible Lineup from Bench
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Efficiency Table */}
          <div className="rounded-xl border border-rule bg-card overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-rule bg-card-elevated/70 text-[10px] font-mono uppercase text-ink-dim">
                    <th className="py-3 px-4">Franchise</th>
                    <th className="py-3 px-3 text-right">Actual Pts</th>
                    <th className="py-3 px-3 text-right">Optimal Pts</th>
                    <th className="py-3 px-3 text-center">Efficiency %</th>
                    <th className="py-3 px-4 text-right">Bench Left</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-rule/60 stat-mono text-ink-muted">
                  {lineup_efficiency.map((row: any, idx: number) => (
                    <tr key={idx} className="hover:bg-card-hover/80 transition-colors">
                      <td className="py-3 px-4 font-sans font-semibold text-ink">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: row.primary_color }} />
                          <span>{row.franchise_name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-ink">
                        {Number(row.actual_points).toLocaleString(undefined, { maximumFractionDigits: 1 })}
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-ink-dim">
                        {Number(row.optimal_points).toLocaleString(undefined, { maximumFractionDigits: 1 })}
                      </td>
                      <td className="py-3 px-3 text-center font-mono font-bold text-brand-lime">
                        {row.efficiency_pct}%
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-brand-orange">
                        {Number(row.bench_points_left).toLocaleString(undefined, { maximumFractionDigits: 1 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Worst Coaching Blunders Table */}
          <div className="space-y-2">
            <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
              <Flame className="h-4 w-4" />
              <span>Agonizing Coaching Blunders (Points Left on Bench in Losses)</span>
            </h3>
            <div className="rounded-xl border border-rule bg-card overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-rule bg-card-elevated/70 text-[10px] font-mono uppercase text-ink-dim">
                      <th className="py-2.5 px-3">Season/Wk</th>
                      <th className="py-2.5 px-3">Franchise</th>
                      <th className="py-2.5 px-3">Benched vs Started</th>
                      <th className="py-2.5 px-2 text-right">Diff</th>
                      <th className="py-2.5 px-3 text-center">Result</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-rule/60 stat-mono text-ink-muted">
                    {worst_blunders.slice(0, 7).map((b: any, idx: number) => (
                      <tr key={idx} className="hover:bg-card-hover/80 transition-colors">
                        <td className="py-2.5 px-3 font-mono font-bold text-ink">
                          {b.season} Wk{b.week}
                        </td>
                        <td className="py-2.5 px-3 font-sans font-semibold text-ink">
                          {b.franchise_name}
                        </td>
                        <td className="py-2.5 px-3 text-[11px] font-sans">
                          <span className="text-brand-lime font-bold">{b.benched_player}</span> ({b.benched_pts}) over <span className="text-ink-dim">{b.started_player}</span> ({b.started_pts})
                        </td>
                        <td className="py-2.5 px-2 text-right font-mono font-bold text-brand-orange">
                          +{b.pt_difference.toFixed(1)}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span className="px-1.5 py-0.5 rounded bg-rose-500/15 text-rose-400 font-mono text-[10px] font-bold border border-rose-500/30">
                            {b.result}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. IS ANY OF THIS REPEATABLE? (Correlation Study) */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-brand-blue" />
          <h2 className="font-mono text-base font-bold text-ink uppercase tracking-wider">
            Is Any of This Repeatable? (Year-Over-Year Regression Analysis)
          </h2>
        </div>
        <p className="text-xs text-ink-dim">
          We computed Pearson auto-correlation ($r$) across all consecutive seasons in AFFL history to identify which facets of fantasy management reflect true skill versus pure random variance.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="glass-card rounded-xl p-5 border border-rule space-y-3 shadow-xl">
            <h3 className="font-mono text-sm font-bold text-brand-lime flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span>Skill Metrics (High Year-Over-Year Persistence)</span>
            </h3>
            <div className="space-y-2 text-xs font-mono">
              {repeatability.skill_metrics.map((m: any, i: number) => (
                <div key={i} className="flex items-center justify-between p-2.5 rounded bg-card-elevated border border-rule">
                  <span className="text-ink font-semibold">{m.metric}</span>
                  <div className="flex items-center gap-3">
                    <strong className="text-brand-lime font-bold">r = {m.r}</strong>
                    <span className="text-[10px] text-ink-dim">{m.classification}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card rounded-xl p-5 border border-rule space-y-3 shadow-xl">
            <h3 className="font-mono text-sm font-bold text-rose-400 flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              <span>Luck & Schedule Metrics (Zero Year-Over-Year Persistence)</span>
            </h3>
            <div className="space-y-2 text-xs font-mono">
              {repeatability.luck_metrics.map((m: any, i: number) => (
                <div key={i} className="flex items-center justify-between p-2.5 rounded bg-card-elevated border border-rule">
                  <span className="text-ink font-semibold">{m.metric}</span>
                  <div className="flex items-center gap-3">
                    <strong className="text-rose-400 font-bold">r = {m.r}</strong>
                    <span className="text-[10px] text-ink-dim">{m.classification}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

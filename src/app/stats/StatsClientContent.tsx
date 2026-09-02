"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Activity,
  Sparkles,
  Shield,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronRight,
  TrendingUp,
  Flame,
  Layers,
  Info,
  Users,
  Award,
  X,
  ExternalLink,
  Target,
  Zap,
  BarChart3,
  HelpCircle
} from "lucide-react";
import { fetchMartJson } from "@/lib/api";
import FranchiseLogo from "@/components/FranchiseLogo";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid
} from "recharts";

type CategoryTab = "overview" | "passing" | "rushing" | "receiving";
type LineupScope = "starters" | "full_roster";

export default function StatsClientContent() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSeason, setSelectedSeason] = useState<string>("2024");
  const [scope, setScope] = useState<LineupScope>("starters");
  const [category, setCategory] = useState<CategoryTab>("overview");
  const [highlightFranchise, setHighlightFranchise] = useState<string>("ALL");
  const [selectedFranchiseDetail, setSelectedFranchiseDetail] = useState<any | null>(null);
  const [glossaryOpen, setGlossaryOpen] = useState(false);

  // Sorting
  const [sortField, setSortField] = useState<string>("total_epa");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    async function loadStats() {
      try {
        const statsData = await fetchMartJson("mart_affl_franchise_stats.json");
        setData(statsData);
      } catch (err) {
        console.error("Error loading franchise stats mart:", err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  // Update default sort field when category changes
  useEffect(() => {
    if (category === "overview") setSortField("total_epa");
    else if (category === "passing") setSortField("passing_epa");
    else if (category === "rushing") setSortField("rushing_epa");
    else if (category === "receiving") setSortField("receiving_epa");
    setSortDir("desc");
  }, [category]);

  const seasonsList = useMemo(() => {
    if (!data?.seasons) return [];
    return ["ALL-TIME", ...data.seasons];
  }, [data]);

  // Current active rows
  const activeRows = useMemo(() => {
    if (!data) return [];
    const isAllTime = selectedSeason === "ALL-TIME";
    let rows: any[] = [];
    if (scope === "starters") {
      rows = isAllTime ? (data.starters_all_time || []) : (data.starters_by_season?.[selectedSeason] || []);
    } else {
      rows = isAllTime ? (data.full_roster_all_time || []) : (data.full_roster_by_season?.[selectedSeason] || []);
    }

    return [...rows].sort((a, b) => {
      const aVal = a[sortField] ?? 0;
      const bVal = b[sortField] ?? 0;
      if (typeof aVal === "string") {
        return sortDir === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      return sortDir === "asc" ? aVal - bVal : bVal - aVal;
    });
  }, [data, selectedSeason, scope, sortField, sortDir]);

  // Handle column sort
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDir("desc");
    }
  };

  // Chart data: EPA breakdown by franchise
  const chartData = useMemo(() => {
    return activeRows.map((r: any) => ({
      name: r.franchise_name.replace("San Diego ", "SD ").replace("Central Oregon ", "CO ").replace("Squaw Valley ", "SV ").replace("Fairview ", "FV ").replace("Grand Teeton ", "GT ").replace("Westeros ", "West. ").replace("Tijuana ", "TJ ").replace("Honolulu ", "Hon. ").replace("Chula Vista ", "CV ").replace("Patagonia ", "Pat. "),
      fullName: r.franchise_name,
      passEPA: Number(r.passing_epa || 0),
      rushEPA: Number(r.rushing_epa || 0),
      recEPA: Number(r.receiving_epa || 0),
      totalEPA: Number(r.total_epa || 0),
    }));
  }, [activeRows]);

  const renderSortHeader = (label: string, field: string, align: "left" | "center" | "right" = "right", title?: string) => {
    const isSorted = sortField === field;
    return (
      <th
        onClick={() => handleSort(field)}
        className={`py-3 px-3 cursor-pointer select-none transition-colors border-b border-rule hover:bg-card-elevated ${
          align === "left" ? "text-left" : align === "center" ? "text-center" : "text-right"
        } ${isSorted ? "text-brand-blue font-bold bg-card-elevated/60" : "text-ink-dim hover:text-ink"}`}
        title={title || `Sort by ${label}`}
      >
        <div className={`inline-flex items-center gap-1 font-mono text-[11px] uppercase tracking-wider ${
          align === "right" ? "justify-end" : align === "center" ? "justify-center" : "justify-start"
        }`}>
          <span>{label}</span>
          {isSorted ? (
            sortDir === "asc" ? <ArrowUp className="h-3 w-3 text-brand-blue" /> : <ArrowDown className="h-3 w-3 text-brand-blue" />
          ) : (
            <ArrowUpDown className="h-3 w-3 opacity-30 group-hover:opacity-100" />
          )}
        </div>
      </th>
    );
  };

  if (loading) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
        <Activity className="h-10 w-10 text-brand-blue animate-pulse mx-auto" />
        <p className="font-mono text-sm text-ink-dim">Compiling annual franchise stat tracker & advanced EPA models...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      
      {/* Masthead Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-rule-bright bg-card p-6 md:p-8 shadow-2xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded bg-brand-blue/15 text-brand-blue border border-brand-blue/30">
                Advanced Analytical Engine
              </span>
              <span className="text-[11px] font-mono text-ink-dim border border-rule px-2 py-0.5 rounded bg-card-elevated">
                nflverse + SumerSports Models
              </span>
            </div>
            <h1 className="font-display text-3xl sm:text-4xl font-black text-ink uppercase tracking-tight">
              Franchise Stat Tracker
            </h1>
            <p className="text-xs sm:text-sm text-ink-muted max-w-3xl leading-relaxed">
              Complete franchise-level passing, rushing, receiving, and scrimmage totals per year and all-time. Every carry, target, and dropback evaluated via Expected Points Added (EPA), Completion Percentage Over Expected (CPOE), Success Rate, Stuff Rate, and Opportunity Shares.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setGlossaryOpen(true)}
              className="flex items-center gap-1.5 rounded-xl border border-rule bg-card-elevated px-3.5 py-2 text-xs font-mono font-semibold text-ink hover:border-brand-blue hover:text-brand-blue transition-colors shadow-sm"
            >
              <HelpCircle className="h-4 w-4 text-brand-blue" />
              <span>Advanced Metrics Guide</span>
            </button>
          </div>
        </div>

        {/* SumerSports / nflverse Metrics Badges */}
        <div className="mt-6 pt-5 border-t border-rule/60 flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-mono text-ink-dim uppercase font-bold mr-1">Metrics Highlight:</span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            Passing EPA & EPA/Att
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-brand-blue/10 text-brand-blue border border-brand-blue/20">
            CPOE (Pass Difficulty Over Baseline)
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
            Rushing Success & Stuff Rate
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">
            Explosive Run % (10+ yds)
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20">
            YAC & RACR Conversion
          </span>
        </div>
      </div>

      {/* Control Ribbon */}
      <div className="glass-card rounded-2xl p-4 border border-rule space-y-4 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          {/* Season Selector */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-mono text-ink-dim uppercase mr-1">Era:</span>
            {seasonsList.map((yr) => (
              <button
                key={yr}
                onClick={() => setSelectedSeason(yr)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                  selectedSeason === yr
                    ? "bg-brand-blue text-white shadow-md scale-105"
                    : "text-ink-muted hover:text-ink hover:bg-card-elevated"
                }`}
              >
                {yr}
              </button>
            ))}
          </div>

          {/* Scope Toggle: Starters Only vs Full Roster */}
          <div className="flex items-center gap-2 bg-card-elevated p-1 rounded-xl border border-rule self-start lg:self-auto">
            <button
              onClick={() => setScope("starters")}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 ${
                scope === "starters"
                  ? "bg-brand-lime text-black shadow-sm"
                  : "text-ink-muted hover:text-ink"
              }`}
            >
              <Zap className="h-3.5 w-3.5" />
              <span>Lineup Starters Only</span>
            </button>
            <button
              onClick={() => setScope("full_roster")}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 ${
                scope === "full_roster"
                  ? "bg-brand-blue text-white shadow-sm"
                  : "text-ink-muted hover:text-ink"
              }`}
            >
              <Users className="h-3.5 w-3.5" />
              <span>Full Roster (Starters + Bench)</span>
            </button>
          </div>
        </div>

        {/* Category Tabs & Club Filter */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-rule/60">
          
          {/* Metric Category Tabs */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setCategory("overview")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-all ${
                category === "overview"
                  ? "bg-card-elevated text-brand-yellow border border-brand-yellow/40 shadow-sm"
                  : "text-ink-muted hover:text-ink border border-transparent"
              }`}
            >
              <Flame className="h-3.5 w-3.5 text-brand-yellow" />
              <span>Overview & Scrimmage</span>
            </button>

            <button
              onClick={() => setCategory("passing")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-all ${
                category === "passing"
                  ? "bg-card-elevated text-brand-blue border border-brand-blue/40 shadow-sm"
                  : "text-ink-muted hover:text-ink border border-transparent"
              }`}
            >
              <Target className="h-3.5 w-3.5 text-brand-blue" />
              <span>Passing & Air Attack</span>
            </button>

            <button
              onClick={() => setCategory("rushing")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-all ${
                category === "rushing"
                  ? "bg-card-elevated text-brand-lime border border-brand-lime/40 shadow-sm"
                  : "text-ink-muted hover:text-ink border border-transparent"
              }`}
            >
              <Zap className="h-3.5 w-3.5 text-brand-lime" />
              <span>Rushing & Ground Game</span>
            </button>

            <button
              onClick={() => setCategory("receiving")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-all ${
                category === "receiving"
                  ? "bg-card-elevated text-purple-400 border border-purple-500/40 shadow-sm"
                  : "text-ink-muted hover:text-ink border border-transparent"
              }`}
            >
              <Layers className="h-3.5 w-3.5 text-purple-400" />
              <span>Receiving & Playmaking</span>
            </button>
          </div>

          {/* Franchise Highlight Select */}
          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="text-ink-dim uppercase text-[10px]">Highlight Club:</span>
            <select
              value={highlightFranchise}
              onChange={(e) => setHighlightFranchise(e.target.value)}
              className="bg-card-elevated border border-rule rounded-lg px-3 py-1 text-xs text-ink font-semibold focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Franchises</option>
              {activeRows.map((r: any) => (
                <option key={r.franchise_id} value={r.franchise_id}>
                  {r.franchise_name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* EPA Breakdown Bar Chart */}
      <div className="glass-card rounded-2xl p-5 border border-rule space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-rule pb-3">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-brand-blue" />
            <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-ink">
              Offensive Expected Points Added (EPA) Breakdown — {selectedSeason} ({scope === "starters" ? "Starters Only" : "Full Roster"})
            </h3>
          </div>
          <span className="text-[11px] font-mono text-ink-dim">
            Sorted by Total Offensive EPA
          </span>
        </div>

        <div className="w-full h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f293d" opacity={0.5} vertical={false} />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} angle={-35} textAnchor="end" interval={0} />
              <YAxis stroke="#94a3b8" fontSize={10} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0d131f",
                  borderColor: "#334155",
                  borderRadius: "0.75rem",
                  fontSize: "11px",
                  fontFamily: "monospace",
                }}
                formatter={(val: any, name: any) => [`${Number(val).toFixed(2)} EPA`, name]}
              />
              <Legend wrapperStyle={{ fontSize: "11px", fontFamily: "monospace", paddingTop: "8px" }} />
              <Bar dataKey="passEPA" name="Passing EPA" fill="#38bdf8" radius={[4, 4, 0, 0]} stackId="a" />
              <Bar dataKey="rushEPA" name="Rushing EPA" fill="#34d399" radius={[4, 4, 0, 0]} stackId="a" />
              <Bar dataKey="recEPA" name="Receiving EPA" fill="#c084fc" radius={[4, 4, 0, 0]} stackId="a" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Main Sortable Data Table */}
      <div className="rounded-2xl border border-rule bg-card shadow-2xl overflow-hidden">
        <div className="p-4 border-b border-rule bg-card-elevated/40 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Flame className="h-4 w-4 text-brand-orange" />
            <span className="font-mono font-bold text-ink uppercase tracking-wider">
              {category.toUpperCase()} STAT LEDGER — {selectedSeason} ({activeRows.length} Clubs)
            </span>
          </div>
          <span className="font-mono text-[11px] text-ink-dim hidden sm:inline">
            Click column header to toggle sort · Click club row to inspect player contributors
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead className="bg-card-elevated border-b border-rule font-mono select-none">
              <tr>
                <th className="py-3 px-3 text-center text-ink-dim text-[11px] w-12">#</th>
                <th className="py-3 px-4 text-left text-ink-dim text-[11px] min-w-[200px]">Franchise</th>
                
                {/* Dynamic Category Columns */}
                {category === "overview" && (
                  <>
                    {renderSortHeader("Touches", "scrimmage_touches", "right", "Total Carries + Receptions")}
                    {renderSortHeader("Scrim Yds", "scrimmage_yards", "right", "Total Rushing + Receiving Yards")}
                    {renderSortHeader("Total TDs", "total_tds", "right", "Pass TDs + Rush TDs + Rec TDs")}
                    {renderSortHeader("Pass EPA", "passing_epa", "right", "Expected Points Added Passing")}
                    {renderSortHeader("Rush EPA", "rushing_epa", "right", "Expected Points Added Rushing")}
                    {renderSortHeader("Rec EPA", "receiving_epa", "right", "Expected Points Added Receiving")}
                    {renderSortHeader("Total EPA", "total_epa", "right", "Sum of Pass, Rush, Rec EPA")}
                    {renderSortHeader("EPA/G", "epa_per_game", "right", "Average Offensive EPA per game")}
                    {renderSortHeader("AFFL Pts", "fantasy_points", "right", "Total fantasy matchup points")}
                  </>
                )}

                {category === "passing" && (
                  <>
                    {renderSortHeader("Cmp", "completions", "right")}
                    {renderSortHeader("Att", "attempts", "right")}
                    {renderSortHeader("Cmp %", "cmp_pct", "right")}
                    {renderSortHeader("Pass Yds", "passing_yards", "right")}
                    {renderSortHeader("YPA", "ypa", "right", "Yards per Pass Attempt")}
                    {renderSortHeader("Pass TD", "passing_tds", "right")}
                    {renderSortHeader("INT", "interceptions", "right")}
                    {renderSortHeader("Air Yds", "passing_air_yards", "right", "Total Intended Air Yards")}
                    {renderSortHeader("aDOT", "adot", "right", "Average Depth of Target")}
                    {renderSortHeader("Pass EPA", "passing_epa", "right")}
                    {renderSortHeader("EPA/Att", "pass_epa_per_att", "right")}
                    {renderSortHeader("CPOE %", "cpoe", "right", "Completion Percentage Over Expected")}
                    {renderSortHeader("Succ %", "passing_success_rate", "right", "Passing Success Rate (Positive EPA %)")}
                    {renderSortHeader("PACR", "pacr", "right", "Passing Air Conversion Ratio")}
                  </>
                )}

                {category === "rushing" && (
                  <>
                    {renderSortHeader("Carries", "carries", "right")}
                    {renderSortHeader("Rush Yds", "rushing_yards", "right")}
                    {renderSortHeader("YPC", "ypc", "right", "Yards Per Carry")}
                    {renderSortHeader("Rush TD", "rushing_tds", "right")}
                    {renderSortHeader("1st Downs", "rushing_first_downs", "right")}
                    {renderSortHeader("Rush EPA", "rushing_epa", "right")}
                    {renderSortHeader("EPA/Car", "rush_epa_per_car", "right")}
                    {renderSortHeader("Succ %", "rushing_success_rate", "right", "Rushing Success Rate (Positive EPA %)")}
                    {renderSortHeader("Stuff %", "rush_stuff_rate", "right", "Stuff Rate (Carries <= 0 yards)")}
                    {renderSortHeader("Expl %", "rush_explosive_rate", "right", "Explosive Run % (Carries 10+ yards)")}
                  </>
                )}

                {category === "receiving" && (
                  <>
                    {renderSortHeader("Tgts", "targets", "right")}
                    {renderSortHeader("Rec", "receptions", "right")}
                    {renderSortHeader("Catch %", "catch_pct", "right")}
                    {renderSortHeader("Rec Yds", "receiving_yards", "right")}
                    {renderSortHeader("YPR", "ypr", "right", "Yards Per Reception")}
                    {renderSortHeader("YPT", "ypt", "right", "Yards Per Target")}
                    {renderSortHeader("Rec TD", "receiving_tds", "right")}
                    {renderSortHeader("Air Yds", "receiving_air_yards", "right")}
                    {renderSortHeader("YAC", "receiving_yac", "right", "Yards After Catch")}
                    {renderSortHeader("YAC %", "yac_pct", "right", "Percentage of receiving yards from YAC")}
                    {renderSortHeader("Rec EPA", "receiving_epa", "right")}
                    {renderSortHeader("EPA/Tgt", "rec_epa_per_tgt", "right")}
                    {renderSortHeader("Succ %", "receiving_success_rate", "right", "Target Success Rate (Positive EPA %)")}
                    {renderSortHeader("RACR", "racr", "right", "Receiver Air Conversion Ratio")}
                  </>
                )}

                <th className="py-3 px-3 text-center text-ink-dim text-[11px] w-28">Contributors</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-rule/60 stat-mono text-ink-muted">
              {activeRows.map((row: any, idx: number) => {
                const isHighlighted = highlightFranchise === row.franchise_id;

                return (
                  <tr
                    key={row.franchise_id || idx}
                    onClick={() => setSelectedFranchiseDetail(row)}
                    className={`hover:bg-card-hover/90 transition-colors cursor-pointer ${
                      isHighlighted ? "bg-brand-blue/10 border-l-4 border-brand-blue" : ""
                    }`}
                  >
                    <td className="py-3 px-3 text-center font-bold text-ink text-xs">
                      #{idx + 1}
                    </td>
                    <td className="py-3 px-4 font-sans font-semibold text-ink">
                      <div className="flex items-center gap-3">
                        <FranchiseLogo franchiseId={row.franchise_id} size="md" />
                        <div>
                          <div className="font-bold text-ink hover:text-brand-blue transition-colors flex items-center gap-1.5">
                            <span>{row.franchise_name}</span>
                          </div>
                          <span className="text-[11px] text-ink-dim block">
                            {row.owner_display_name} • {row.games} Games
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Overview Columns */}
                    {category === "overview" && (
                      <>
                        <td className="py-3 px-3 text-right text-ink font-semibold">{row.scrimmage_touches?.toLocaleString()}</td>
                        <td className="py-3 px-3 text-right font-bold text-ink">{Math.round(row.scrimmage_yards || 0).toLocaleString()}</td>
                        <td className="py-3 px-3 text-right text-brand-yellow font-bold">{row.total_tds}</td>
                        <td className={`py-3 px-3 text-right font-semibold ${row.passing_epa >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                          {row.passing_epa > 0 ? `+${row.passing_epa.toFixed(1)}` : row.passing_epa?.toFixed(1)}
                        </td>
                        <td className={`py-3 px-3 text-right font-semibold ${row.rushing_epa >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                          {row.rushing_epa > 0 ? `+${row.rushing_epa.toFixed(1)}` : row.rushing_epa?.toFixed(1)}
                        </td>
                        <td className={`py-3 px-3 text-right font-semibold ${row.receiving_epa >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                          {row.receiving_epa > 0 ? `+${row.receiving_epa.toFixed(1)}` : row.receiving_epa?.toFixed(1)}
                        </td>
                        <td className={`py-3 px-3 text-right font-bold text-sm ${row.total_epa >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                          {row.total_epa > 0 ? `+${row.total_epa.toFixed(1)}` : row.total_epa?.toFixed(1)}
                        </td>
                        <td className="py-3 px-3 text-right font-mono text-ink">
                          {row.epa_per_game > 0 ? `+${row.epa_per_game.toFixed(2)}` : row.epa_per_game?.toFixed(2)}
                        </td>
                        <td className="py-3 px-3 text-right text-brand-blue font-bold">
                          {Math.round(row.fantasy_points || 0).toLocaleString()}
                        </td>
                      </>
                    )}

                    {/* Passing Columns */}
                    {category === "passing" && (
                      <>
                        <td className="py-3 px-3 text-right text-ink">{row.completions?.toLocaleString()}</td>
                        <td className="py-3 px-3 text-right text-ink-dim">{row.attempts?.toLocaleString()}</td>
                        <td className="py-3 px-3 text-right text-brand-blue font-semibold">{row.cmp_pct}%</td>
                        <td className="py-3 px-3 text-right font-bold text-ink">{Math.round(row.passing_yards || 0).toLocaleString()}</td>
                        <td className="py-3 px-3 text-right text-ink">{row.ypa}</td>
                        <td className="py-3 px-3 text-right text-brand-yellow font-bold">{row.passing_tds}</td>
                        <td className="py-3 px-3 text-right text-rose-400">{row.interceptions}</td>
                        <td className="py-3 px-3 text-right text-ink-dim">{Math.round(row.passing_air_yards || 0).toLocaleString()}</td>
                        <td className="py-3 px-3 text-right text-ink">{row.adot}</td>
                        <td className={`py-3 px-3 text-right font-bold ${row.passing_epa >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                          {row.passing_epa > 0 ? `+${row.passing_epa.toFixed(1)}` : row.passing_epa?.toFixed(1)}
                        </td>
                        <td className={`py-3 px-3 text-right font-semibold ${row.pass_epa_per_att >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                          {row.pass_epa_per_att > 0 ? `+${row.pass_epa_per_att.toFixed(3)}` : row.pass_epa_per_att?.toFixed(3)}
                        </td>
                        <td className={`py-3 px-3 text-right font-bold ${row.cpoe >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                          {row.cpoe > 0 ? `+${row.cpoe.toFixed(1)}%` : `${row.cpoe?.toFixed(1)}%`}
                        </td>
                        <td className="py-3 px-3 text-right text-brand-lime font-semibold">{row.passing_success_rate}%</td>
                        <td className="py-3 px-3 text-right text-ink">{row.pacr}</td>
                      </>
                    )}

                    {/* Rushing Columns */}
                    {category === "rushing" && (
                      <>
                        <td className="py-3 px-3 text-right text-ink">{row.carries?.toLocaleString()}</td>
                        <td className="py-3 px-3 text-right font-bold text-ink">{Math.round(row.rushing_yards || 0).toLocaleString()}</td>
                        <td className="py-3 px-3 text-right text-brand-lime font-bold">{row.ypc}</td>
                        <td className="py-3 px-3 text-right text-brand-yellow font-bold">{row.rushing_tds}</td>
                        <td className="py-3 px-3 text-right text-ink-dim">{row.rushing_first_downs}</td>
                        <td className={`py-3 px-3 text-right font-bold ${row.rushing_epa >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                          {row.rushing_epa > 0 ? `+${row.rushing_epa.toFixed(1)}` : row.rushing_epa?.toFixed(1)}
                        </td>
                        <td className={`py-3 px-3 text-right font-semibold ${row.rush_epa_per_car >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                          {row.rush_epa_per_car > 0 ? `+${row.rush_epa_per_car.toFixed(3)}` : row.rush_epa_per_car?.toFixed(3)}
                        </td>
                        <td className="py-3 px-3 text-right text-brand-lime font-semibold">{row.rushing_success_rate}%</td>
                        <td className={`py-3 px-3 text-right font-semibold ${row.rush_stuff_rate > 20 ? "text-rose-400" : "text-ink-muted"}`}>
                          {row.rush_stuff_rate}%
                        </td>
                        <td className="py-3 px-3 text-right text-purple-400 font-bold">{row.rush_explosive_rate}%</td>
                      </>
                    )}

                    {/* Receiving Columns */}
                    {category === "receiving" && (
                      <>
                        <td className="py-3 px-3 text-right text-ink">{row.targets?.toLocaleString()}</td>
                        <td className="py-3 px-3 text-right text-ink font-semibold">{row.receptions?.toLocaleString()}</td>
                        <td className="py-3 px-3 text-right text-brand-blue font-semibold">{row.catch_pct}%</td>
                        <td className="py-3 px-3 text-right font-bold text-ink">{Math.round(row.receiving_yards || 0).toLocaleString()}</td>
                        <td className="py-3 px-3 text-right text-brand-yellow font-semibold">{row.ypr}</td>
                        <td className="py-3 px-3 text-right text-ink">{row.ypt}</td>
                        <td className="py-3 px-3 text-right text-brand-yellow font-bold">{row.receiving_tds}</td>
                        <td className="py-3 px-3 text-right text-ink-dim">{Math.round(row.receiving_air_yards || 0).toLocaleString()}</td>
                        <td className="py-3 px-3 text-right text-purple-400 font-semibold">{Math.round(row.receiving_yac || 0).toLocaleString()}</td>
                        <td className="py-3 px-3 text-right text-ink-dim">{row.yac_pct}%</td>
                        <td className={`py-3 px-3 text-right font-bold ${row.receiving_epa >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                          {row.receiving_epa > 0 ? `+${row.receiving_epa.toFixed(1)}` : row.receiving_epa?.toFixed(1)}
                        </td>
                        <td className={`py-3 px-3 text-right font-semibold ${row.rec_epa_per_tgt >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                          {row.rec_epa_per_tgt > 0 ? `+${row.rec_epa_per_tgt.toFixed(3)}` : row.rec_epa_per_tgt?.toFixed(3)}
                        </td>
                        <td className="py-3 px-3 text-right text-brand-lime font-semibold">{row.receiving_success_rate}%</td>
                        <td className="py-3 px-3 text-right text-ink">{row.racr}</td>
                      </>
                    )}

                    {/* Quick Contributor Action Button */}
                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedFranchiseDetail(row);
                        }}
                        className="inline-flex items-center gap-1 rounded bg-card-elevated px-2 py-1 text-[10px] font-mono text-brand-blue hover:text-white hover:bg-brand-blue border border-rule transition-colors"
                      >
                        <span>Inspect</span>
                        <ChevronRight className="h-3 w-3" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top Player Contributors Modal / Drawer */}
      {selectedFranchiseDetail && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in"
          onClick={() => setSelectedFranchiseDetail(null)}
        >
          <div
            className="w-full max-w-3xl rounded-2xl bg-card border border-rule-bright shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-rule bg-card-elevated">
              <div className="flex items-center gap-3.5">
                <FranchiseLogo franchiseId={selectedFranchiseDetail.franchise_id} size="lg" />
                <div>
                  <h3 className="font-mono text-base font-bold text-ink">
                    {selectedFranchiseDetail.franchise_name}
                  </h3>
                  <p className="text-xs text-ink-muted">
                    {selectedSeason} Season · {selectedFranchiseDetail.owner_display_name} · Total EPA:{" "}
                    <span className={selectedFranchiseDetail.total_epa >= 0 ? "text-emerald-400 font-bold" : "text-rose-400 font-bold"}>
                      {selectedFranchiseDetail.total_epa > 0 ? `+${selectedFranchiseDetail.total_epa.toFixed(1)}` : selectedFranchiseDetail.total_epa?.toFixed(1)}
                    </span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedFranchiseDetail(null)}
                className="rounded p-1 text-ink-dim hover:text-ink hover:bg-card-hover"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Content: Key Contributor Columns */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {/* Stat Quick Glance */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center font-mono">
                <div className="rounded-xl bg-card-elevated p-3 border border-rule">
                  <span className="text-[10px] text-ink-dim uppercase block">Passing Yds</span>
                  <span className="text-sm font-bold text-ink">{Math.round(selectedFranchiseDetail.passing_yards || 0).toLocaleString()}</span>
                  <span className="text-[10px] text-brand-yellow block">{selectedFranchiseDetail.passing_tds} Pass TD</span>
                </div>
                <div className="rounded-xl bg-card-elevated p-3 border border-rule">
                  <span className="text-[10px] text-ink-dim uppercase block">Rushing Yds</span>
                  <span className="text-sm font-bold text-ink">{Math.round(selectedFranchiseDetail.rushing_yards || 0).toLocaleString()}</span>
                  <span className="text-[10px] text-brand-lime block">{selectedFranchiseDetail.ypc} YPC</span>
                </div>
                <div className="rounded-xl bg-card-elevated p-3 border border-rule">
                  <span className="text-[10px] text-ink-dim uppercase block">Receiving Yds</span>
                  <span className="text-sm font-bold text-ink">{Math.round(selectedFranchiseDetail.receiving_yards || 0).toLocaleString()}</span>
                  <span className="text-[10px] text-purple-400 block">{selectedFranchiseDetail.ypr} YPR</span>
                </div>
                <div className="rounded-xl bg-card-elevated p-3 border border-rule">
                  <span className="text-[10px] text-ink-dim uppercase block">Total Scrimmage</span>
                  <span className="text-sm font-bold text-brand-blue">{Math.round(selectedFranchiseDetail.scrimmage_yards || 0).toLocaleString()}</span>
                  <span className="text-[10px] text-brand-yellow block">{selectedFranchiseDetail.total_tds} Total TDs</span>
                </div>
              </div>

              {/* 3 Contributor Leaderboards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* Top Passers */}
                <div className="space-y-3 rounded-xl border border-rule bg-card-elevated/40 p-4">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold text-brand-blue border-b border-rule pb-2">
                    <Target className="h-4 w-4" />
                    <span>Top Passers</span>
                  </div>
                  {selectedFranchiseDetail.top_passers?.length > 0 ? (
                    <div className="space-y-2.5">
                      {selectedFranchiseDetail.top_passers.map((p: any, i: number) => (
                        <div key={i} className="text-xs font-mono flex items-center justify-between border-b border-rule/30 pb-1.5 last:border-0">
                          <div>
                            <div className="font-bold text-ink">{p.name}</div>
                            <span className="text-[10px] text-ink-dim">{Math.round(p.yards).toLocaleString()} yds · {p.tds} TD</span>
                          </div>
                          <span className={`text-xs font-bold ${p.epa >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                            {p.epa > 0 ? `+${p.epa.toFixed(1)}` : p.epa?.toFixed(1)} EPA
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-ink-dim font-mono">No passing plays recorded.</p>
                  )}
                </div>

                {/* Top Rushers */}
                <div className="space-y-3 rounded-xl border border-rule bg-card-elevated/40 p-4">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold text-brand-lime border-b border-rule pb-2">
                    <Zap className="h-4 w-4" />
                    <span>Top Rushers</span>
                  </div>
                  {selectedFranchiseDetail.top_rushers?.length > 0 ? (
                    <div className="space-y-2.5">
                      {selectedFranchiseDetail.top_rushers.map((p: any, i: number) => (
                        <div key={i} className="text-xs font-mono flex items-center justify-between border-b border-rule/30 pb-1.5 last:border-0">
                          <div>
                            <div className="font-bold text-ink">{p.name}</div>
                            <span className="text-[10px] text-ink-dim">{Math.round(p.yards).toLocaleString()} yds · {p.tds} TD</span>
                          </div>
                          <span className={`text-xs font-bold ${p.epa >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                            {p.epa > 0 ? `+${p.epa.toFixed(1)}` : p.epa?.toFixed(1)} EPA
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-ink-dim font-mono">No rushing plays recorded.</p>
                  )}
                </div>

                {/* Top Receivers */}
                <div className="space-y-3 rounded-xl border border-rule bg-card-elevated/40 p-4">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold text-purple-400 border-b border-rule pb-2">
                    <Layers className="h-4 w-4" />
                    <span>Top Receivers</span>
                  </div>
                  {selectedFranchiseDetail.top_receivers?.length > 0 ? (
                    <div className="space-y-2.5">
                      {selectedFranchiseDetail.top_receivers.map((p: any, i: number) => (
                        <div key={i} className="text-xs font-mono flex items-center justify-between border-b border-rule/30 pb-1.5 last:border-0">
                          <div>
                            <div className="font-bold text-ink">{p.name}</div>
                            <span className="text-[10px] text-ink-dim">{Math.round(p.yards).toLocaleString()} yds · {p.tds} TD</span>
                          </div>
                          <span className={`text-xs font-bold ${p.epa >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                            {p.epa > 0 ? `+${p.epa.toFixed(1)}` : p.epa?.toFixed(1)} EPA
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-ink-dim font-mono">No receiving plays recorded.</p>
                  )}
                </div>
              </div>

              {/* Link to Franchise Page */}
              <div className="pt-2 flex justify-end">
                <Link
                  href={`/franchises/${selectedFranchiseDetail.franchise_id}`}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-brand-blue px-4 py-2 text-xs font-mono font-bold text-white shadow-lg hover:bg-brand-blue/90 transition-colors"
                >
                  <span>Open Full Franchise Chronicle</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Glossary Modal */}
      {glossaryOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in"
          onClick={() => setGlossaryOpen(false)}
        >
          <div
            className="w-full max-w-2xl rounded-2xl bg-card border border-rule-bright shadow-2xl p-6 space-y-5 max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-rule pb-3">
              <div className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5 text-brand-blue" />
                <h3 className="font-mono text-base font-bold text-ink uppercase">
                  nflverse & SumerSports Metrics Guide
                </h3>
              </div>
              <button onClick={() => setGlossaryOpen(false)} className="rounded p-1 text-ink-dim hover:text-ink">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs font-sans leading-relaxed text-ink-muted">
              <div>
                <h4 className="font-mono font-bold text-ink text-sm text-brand-blue">Expected Points Added (EPA)</h4>
                <p>Quantifies the net point value contributed by every play based on down, distance, field position, and game clock. Positive EPA indicates the play improved scoring expectation.</p>
              </div>
              <div>
                <h4 className="font-mono font-bold text-ink text-sm text-brand-blue">Completion Percentage Over Expected (CPOE)</h4>
                <p>Calculates the difference between actual completion rate and expected completion rate modeled by historical pass depth, receiver separation, and throw difficulty.</p>
              </div>
              <div>
                <h4 className="font-mono font-bold text-ink text-sm text-brand-lime">Rushing Success Rate</h4>
                <p>Percentage of run attempts with positive EPA. A reliable measure of run game consistency, rewarding chain-moving runs rather than occasional fluky long gains.</p>
              </div>
              <div>
                <h4 className="font-mono font-bold text-ink text-sm text-brand-lime">Stuff Rate & Explosive Run Rate</h4>
                <p><strong>Stuff Rate:</strong> Percentage of carries tackled for zero or negative yards. <strong>Explosive Rate:</strong> Percentage of carries gaining 10 or more yards.</p>
              </div>
              <div>
                <h4 className="font-mono font-bold text-ink text-sm text-purple-400">Air Yards & aDOT</h4>
                <p>The distance from the line of scrimmage to the point of intended catch. Average Depth of Target (aDOT) measures downfield aggressiveness per attempt.</p>
              </div>
              <div>
                <h4 className="font-mono font-bold text-ink text-sm text-purple-400">PACR & RACR</h4>
                <p><strong>PACR:</strong> Passing Air Conversion Ratio (Passing Yards / Air Yards). <strong>RACR:</strong> Receiver Air Conversion Ratio (Receiving Yards / Targeted Air Yards).</p>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

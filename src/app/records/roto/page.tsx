"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { 
  Award, 
  Sparkles, 
  TrendingUp, 
  Shield, 
  Calendar, 
  BarChart2, 
  Activity, 
  Layers, 
  ArrowRight, 
  ArrowUp, 
  ArrowDown, 
  ArrowUpDown,
  Bookmark
} from "lucide-react";
import { fetchMartJson } from "@/lib/api";
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Tooltip } from "recharts";
import FranchiseLogo from "@/components/FranchiseLogo";

export default function RotoStandingsPage() {
  const [rotoData, setRotoData] = useState<any>(null);
  const [selectedSeason, setSelectedSeason] = useState<string>("ALL-TIME");
  const [selectedFranchise, setSelectedFranchise] = useState<string>("ALL");
  const [viewMode, setViewMode] = useState<"values" | "points">("values");
  const [loading, setLoading] = useState<boolean>(true);
  const [sortState, setSortState] = useState<{ key: string; dir: "asc" | "desc" }>({
    key: "roto_score",
    dir: "desc"
  });

  useEffect(() => {
    async function loadData() {
      try {
        const data = await fetchMartJson("mart_affl_roto_skill_radar.json");
        setRotoData(data);
      } catch (err) {
        console.error("Error loading roto data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const seasonList = ["ALL-TIME", "2025", "2024", "2023", "2022", "2021", "2020", "2019", "2018"];

  const currentSeasonData = useMemo(() => {
    if (!rotoData) return [];
    let raw = [];
    if (selectedSeason === "ALL-TIME") {
      raw = rotoData.all_time_roto || [];
    } else {
      raw = rotoData.season_roto?.[selectedSeason] || [];
    }

    return [...raw].sort((a, b) => {
      let valA = a[sortState.key];
      let valB = b[sortState.key];

      if (typeof valA === "string") {
        valA = valA.toLowerCase();
        valB = (valB || "").toLowerCase();
      } else {
        valA = Number(valA || 0);
        valB = Number(valB || 0);
      }
      if (valA < valB) return sortState.dir === "asc" ? -1 : 1;
      if (valA > valB) return sortState.dir === "asc" ? 1 : -1;
      return 0;
    });
  }, [rotoData, selectedSeason, sortState]);

  const handleSort = (key: string) => {
    if (sortState.key === key) {
      setSortState({ key, dir: sortState.dir === "asc" ? "desc" : "asc" });
    } else {
      setSortState({ key, dir: "desc" });
    }
  };

  const renderSortHeader = (label: string, key: string, align: "left" | "center" | "right" = "left", extraClass: string = "") => {
    const isSorted = sortState.key === key;
    return (
      <th
        onClick={() => handleSort(key)}
        className={`py-3 px-3 cursor-pointer select-none hover:text-brand-blue transition-colors ${
          align === "center" ? "text-center" : align === "right" ? "text-right" : "text-left"
        } ${isSorted ? "text-brand-orange bg-brand-orange/5" : "text-ink-dim"} ${extraClass}`}
      >
        <div className={`inline-flex items-center gap-1 ${align === "right" ? "justify-end" : align === "center" ? "justify-center" : "justify-start"}`}>
          <span>{label}</span>
          {isSorted ? (
            sortState.dir === "desc" ? (
              <ArrowDown className="h-3 w-3 text-brand-orange" />
            ) : (
              <ArrowUp className="h-3 w-3 text-brand-orange" />
            )
          ) : (
            <ArrowUpDown className="h-2.5 w-2.5 opacity-30 group-hover:opacity-100" />
          )}
        </div>
      </th>
    );
  };

  // Radar chart data for selected franchise
  const radarData = useMemo(() => {
    if (!currentSeasonData || currentSeasonData.length === 0) return [];
    const target = selectedFranchise !== "ALL" 
      ? currentSeasonData.find((r: any) => r.franchise_id === selectedFranchise) 
      : currentSeasonData[0];
    
    if (!target) return [];

    return [
      { category: "Pass Yds", value: target.pass_yds_pts || 6, fullMark: 16 },
      { category: "Pass TDs", value: target.pass_tds_pts || 6, fullMark: 16 },
      { category: "Rush Yds", value: target.rush_yds_pts || 6, fullMark: 16 },
      { category: "Rush TDs", value: target.rush_tds_pts || 6, fullMark: 16 },
      { category: "Yards/Carry", value: target.ypc_pts || 6, fullMark: 16 },
      { category: "Rec Yds", value: target.rec_yds_pts || 6, fullMark: 16 },
      { category: "Rec TDs", value: target.rec_tds_pts || 6, fullMark: 16 },
      { category: "Yards/Rec", value: target.ypr_pts || 6, fullMark: 16 }
    ];
  }, [currentSeasonData, selectedFranchise]);

  if (loading) {
    return (
      <div className="py-24 text-center text-xs font-mono text-ink-dim">
        Compiling 10-Category Fantasy Genius Roto Standings...
      </div>
    );
  }

  const isAllTime = selectedSeason === "ALL-TIME";

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-rule pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-brand-blue uppercase tracking-wider mb-1">
            <span>AFFL ANNALS</span>
            <span>•</span>
            <span>10-CATEGORY ROTO STANDINGS</span>
          </div>
          <h1 className="font-mono text-2xl md:text-3xl font-black text-ink tracking-tight flex items-center gap-3">
            <Award className="h-7 w-7 text-brand-yellow" />
            <span>{isAllTime ? "All-Time Cumulative Roto Standings" : `${selectedSeason} Roto Standings & Skill Radar`}</span>
          </h1>
          <p className="text-xs md:text-sm text-ink-muted mt-1 max-w-3xl">
            {isAllTime 
              ? "All-Time cumulative starting lineup production ever accumulated by each franchise across all competition eras (2014–2025). Independent of head-to-head matchup variance."
              : "Reconstructed from the Fantasy Genius 10-Category model. Evaluates starting lineup production across Passing, Rushing, and Receiving dimensions."}
          </p>
        </div>

        {/* Value vs Points Toggle */}
        <div className="flex items-center rounded-lg bg-card-elevated p-1 border border-rule self-start md:self-auto">
          <button
            onClick={() => setViewMode("values")}
            className={`px-3 py-1.5 rounded text-xs font-mono font-semibold transition-all ${
              viewMode === "values"
                ? "bg-brand-blue text-white shadow-sm"
                : "text-ink-muted hover:text-ink"
            }`}
          >
            Raw Stat Values
          </button>
          <button
            onClick={() => setViewMode("points")}
            className={`px-3 py-1.5 rounded text-xs font-mono font-semibold transition-all ${
              viewMode === "points"
                ? "bg-brand-blue text-white shadow-sm"
                : "text-ink-muted hover:text-ink"
            }`}
          >
            Roto Points ({isAllTime ? "1–16" : "1–12"})
          </button>
        </div>
      </div>

      {/* Season Selector Filter */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-card p-3 rounded-xl border border-rule">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-mono text-ink-dim uppercase mr-1">Scope:</span>
          {seasonList.map((yr) => (
            <button
              key={yr}
              onClick={() => {
                setSelectedSeason(yr);
                setSelectedFranchise("ALL");
              }}
              className={`px-2.5 py-1 rounded text-xs font-mono font-bold transition-colors ${
                selectedSeason === yr
                  ? "bg-brand-blue text-white shadow-sm"
                  : "text-ink-muted hover:text-ink hover:bg-card-elevated"
              }`}
            >
              {yr}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="text-ink-dim uppercase text-[10px]">Highlight Club:</span>
          <select
            value={selectedFranchise}
            onChange={(e) => setSelectedFranchise(e.target.value)}
            className="bg-card-elevated border border-rule rounded px-2.5 py-1 text-xs text-ink font-semibold focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Franchises</option>
            {currentSeasonData.map((r: any) => (
              <option key={r.franchise_id} value={r.franchise_id}>
                {r.franchise_name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Grid: Radar Chart + Standings Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Radar Chart Card */}
        <div className="glass-card rounded-xl p-5 border border-rule space-y-4 shadow-xl flex flex-col items-center justify-between">
          <div className="w-full flex items-center justify-between border-b border-rule pb-2">
            <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-ink flex items-center gap-1.5">
              <Activity className="h-4 w-4 text-brand-blue" />
              <span>Skill Radar Profile</span>
            </h3>
            <span className="text-[10px] font-mono text-brand-lime font-bold">
              {isAllTime ? "All-Time Scale: 1–16" : "Season Scale: 1–12"}
            </span>
          </div>

          <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="var(--border)" strokeDasharray="3 3" />
                <PolarAngleAxis 
                  dataKey="category" 
                  tick={{ fill: "var(--foreground)", fontSize: 10, fontFamily: "monospace" }} 
                />
                <PolarRadiusAxis 
                  angle={30} 
                  domain={[0, isAllTime ? 16 : 12]} 
                  tick={{ fill: "var(--muted-foreground)", fontSize: 8 }} 
                />
                <Radar 
                  name="Roto Score" 
                  dataKey="value" 
                  stroke="#00a2ff" 
                  fill="#00a2ff" 
                  fillOpacity={0.45} 
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "var(--card)", 
                    borderColor: "var(--border)", 
                    fontSize: "11px", 
                    fontFamily: "monospace",
                    borderRadius: "8px" 
                  }} 
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          <p className="text-[10px] text-ink-dim font-mono text-center">
            {isAllTime 
              ? "All-time franchise capability profile across all started player-weeks in league history."
              : "Ten-axis starter capability profile compared to league maximums across regular season weeks."}
          </p>
        </div>

        {/* Full 10-Category Roto Table */}
        <div className="lg:col-span-2 rounded-xl border border-rule bg-card overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-rule bg-card-elevated/70 text-[10px] font-mono uppercase text-ink-dim">
                  {renderSortHeader("Rank", "overall_roto_rank", "center")}
                  {renderSortHeader("Franchise", "franchise_name", "left")}
                  {isAllTime && renderSortHeader("Eras", "seasons", "center")}
                  {renderSortHeader("Pass Yds", "pass_yds", "right")}
                  {renderSortHeader("Pass TD", "pass_tds", "right")}
                  {renderSortHeader("Rush Yds", "rush_yds", "right")}
                  {renderSortHeader("Rush TD", "rush_tds", "right")}
                  {renderSortHeader("YPC", "ypc", "right")}
                  {renderSortHeader("Rec Yds", "rec_yds", "right")}
                  {renderSortHeader("Rec TD", "rec_tds", "right")}
                  {renderSortHeader("Total Roto", "roto_score", "center", "font-bold text-brand-yellow")}
                </tr>
              </thead>
              <tbody className="divide-y divide-rule/60 stat-mono text-ink-muted">
                {currentSeasonData.map((row: any, idx: number) => {
                  const isHighlighted = selectedFranchise === row.franchise_id;
                  const rank = row.overall_roto_rank || idx + 1;
                  const totalScore = row.roto_score || row.career_roto_score;

                  return (
                    <tr 
                      key={idx} 
                      className={`hover:bg-card-hover/80 transition-colors ${
                        isHighlighted ? "bg-brand-blue/10 border-l-2 border-brand-blue" : ""
                      }`}
                    >
                      <td className="py-2.5 px-3 text-center font-mono font-bold text-ink">
                        #{rank}
                      </td>
                      <td className="py-2.5 px-3 font-sans font-semibold text-ink">
                        <Link 
                          href={`/franchises/${row.franchise_id}`} 
                          className="hover:underline flex items-center gap-2.5"
                        >
                          <FranchiseLogo franchiseId={row.franchise_id} size="sm" />
                          <span className="truncate max-w-[150px]">{row.franchise_name}</span>
                        </Link>
                      </td>
                      {isAllTime && (
                        <td className="py-2.5 px-3 text-center font-mono text-ink-dim">
                          {row.seasons}
                        </td>
                      )}
                      <td className="py-2.5 px-3 text-right font-mono text-ink">
                        {viewMode === "points" 
                          ? Number(row.pass_yds_pts || 0).toFixed(1)
                          : Math.round(row.pass_yds || 0).toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono">
                        {viewMode === "points" 
                          ? Number(row.pass_tds_pts || 0).toFixed(1)
                          : Math.round(row.pass_tds || 0).toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-ink">
                        {viewMode === "points" 
                          ? Number(row.rush_yds_pts || 0).toFixed(1)
                          : Math.round(row.rush_yds || 0).toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono">
                        {viewMode === "points" 
                          ? Number(row.rush_tds_pts || 0).toFixed(1)
                          : Math.round(row.rush_tds || 0).toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-brand-lime">
                        {viewMode === "points" 
                          ? Number(row.ypc_pts || 0).toFixed(1)
                          : Number(row.ypc || 0).toFixed(2)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-ink">
                        {viewMode === "points" 
                          ? Number(row.rec_yds_pts || 0).toFixed(1)
                          : Math.round(row.rec_yds || 0).toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono">
                        {viewMode === "points" 
                          ? Number(row.rec_tds_pts || 0).toFixed(1)
                          : Math.round(row.rec_tds || 0).toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono font-bold text-brand-yellow">
                        {Number(totalScore || 0).toFixed(1)}
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

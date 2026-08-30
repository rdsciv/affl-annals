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
  ArrowRight
} from "lucide-react";
import { fetchMartJson } from "@/lib/api";
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Tooltip } from "recharts";

export default function RotoStandingsPage() {
  const [rotoData, setRotoData] = useState<any>(null);
  const [selectedSeason, setSelectedSeason] = useState<string>("2025");
  const [selectedFranchise, setSelectedFranchise] = useState<string>("ALL");
  const [viewMode, setViewMode] = useState<"points" | "values">("points");
  const [loading, setLoading] = useState<boolean>(true);

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

  const seasonList = ["2025", "2024", "2023", "2022", "2021", "2020", "2019", "2018", "ALL-TIME"];
  const currentSeasonData = useMemo(() => {
    if (!rotoData) return [];
    if (selectedSeason === "ALL-TIME") {
      return rotoData.all_time_roto || [];
    }
    return rotoData.season_roto?.[selectedSeason] || [];
  }, [rotoData, selectedSeason]);

  // Radar chart data for selected franchise
  const radarData = useMemo(() => {
    if (!currentSeasonData || currentSeasonData.length === 0) return [];
    const target = selectedFranchise !== "ALL" 
      ? currentSeasonData.find((r: any) => r.franchise_id === selectedFranchise) 
      : currentSeasonData[0];
    
    if (!target) return [];

    const isAllTime = selectedSeason === "ALL-TIME";
    return [
      { category: "Pass Yds", value: target[isAllTime ? "avg_pass_yds_pts" : "pass_yds_pts"] || 6, fullMark: 12 },
      { category: "Pass TDs", value: target[isAllTime ? "avg_pass_tds_pts" : "pass_tds_pts"] || 6, fullMark: 12 },
      { category: "Rush Yds", value: target[isAllTime ? "avg_rush_yds_pts" : "rush_yds_pts"] || 6, fullMark: 12 },
      { category: "Rush TDs", value: target[isAllTime ? "avg_rush_tds_pts" : "rush_tds_pts"] || 6, fullMark: 12 },
      { category: "Yards/Carry", value: target[isAllTime ? "avg_ypc_pts" : "ypc_pts"] || 6, fullMark: 12 },
      { category: "Rec Yds", value: target[isAllTime ? "avg_rec_yds_pts" : "rec_yds_pts"] || 6, fullMark: 12 },
      { category: "Rec TDs", value: target[isAllTime ? "avg_rec_tds_pts" : "rec_tds_pts"] || 6, fullMark: 12 },
      { category: "Yards/Rec", value: target[isAllTime ? "avg_ypr_pts" : "ypr_pts"] || 6, fullMark: 12 }
    ];
  }, [currentSeasonData, selectedFranchise, selectedSeason]);

  if (loading) {
    return (
      <div className="py-24 text-center text-xs font-mono text-ink-dim">
        Compiling 10-Category Fantasy Genius Roto Standings...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-rule pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-brand-blue uppercase tracking-wider mb-1">
            <span>AFFL SAVANT</span>
            <span>•</span>
            <span>ROTO STANDINGS & SKILL RADAR</span>
          </div>
          <h1 className="font-mono text-2xl md:text-3xl font-black text-ink tracking-tight flex items-center gap-3">
            <Award className="h-7 w-7 text-brand-yellow" />
            <span>10-Category Roto Skill Radar</span>
          </h1>
          <p className="text-xs md:text-sm text-ink-muted mt-1 max-w-3xl">
            Reconstructed from the Fantasy Genius 10-Category model. Evaluates starting lineup production across Passing, Rushing, and Receiving dimensions independent of matchup schedule variance.
          </p>
        </div>

        {/* Value vs Points Toggle */}
        <div className="flex items-center rounded-lg bg-card-elevated p-1 border border-rule self-start md:self-auto">
          <button
            onClick={() => setViewMode("points")}
            className={`px-3 py-1.5 rounded text-xs font-mono font-semibold transition-all ${
              viewMode === "points"
                ? "bg-brand-blue text-white shadow-sm"
                : "text-ink-muted hover:text-ink"
            }`}
          >
            Roto Points (1–12)
          </button>
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
        </div>
      </div>

      {/* Season Selector Filter */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-card p-3 rounded-xl border border-rule">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-mono text-ink-dim uppercase mr-1">Season:</span>
          {seasonList.map((yr) => (
            <button
              key={yr}
              onClick={() => {
                setSelectedSeason(yr);
                setSelectedFranchise("ALL");
              }}
              className={`px-2.5 py-1 rounded text-xs font-mono font-bold transition-colors ${
                selectedSeason === yr
                  ? "bg-brand-blue text-white"
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
        <div className="glass-card rounded-xl p-5 border border-rule space-y-4 shadow-xl flex flex-col items-center justify-center">
          <div className="w-full flex items-center justify-between border-b border-rule pb-2">
            <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-ink flex items-center gap-1.5">
              <Activity className="h-4 w-4 text-brand-blue" />
              <span>Skill Radar Profile</span>
            </h3>
            <span className="text-[10px] font-mono text-brand-lime font-bold">
              Scale: 1–12 Pts
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
                  domain={[0, 12]} 
                  tick={{ fill: "var(--muted-foreground)", fontSize: 8 }} 
                />
                <Radar 
                  name="Roto Score" 
                  dataKey="value" 
                  stroke="#00a2ff" 
                  fill="#00a2ff" 
                  fillOpacity={0.4} 
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
            Ten-axis starter capability profile compared to league maximums across regular season weeks.
          </p>
        </div>

        {/* Full 10-Category Roto Table */}
        <div className="lg:col-span-2 rounded-xl border border-rule bg-card overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-rule bg-card-elevated/70 text-[10px] font-mono uppercase text-ink-dim">
                  <th className="py-3 px-3 text-center">Rank</th>
                  <th className="py-3 px-3">Franchise</th>
                  <th className="py-3 px-2 text-right">Pass Yds</th>
                  <th className="py-3 px-2 text-right">Pass TD</th>
                  <th className="py-3 px-2 text-right">Rush Yds</th>
                  <th className="py-3 px-2 text-right">Rush TD</th>
                  <th className="py-3 px-2 text-right">YPC</th>
                  <th className="py-3 px-2 text-right">Rec Yds</th>
                  <th className="py-3 px-2 text-right">Rec TD</th>
                  <th className="py-3 px-3 text-center font-bold text-brand-yellow">Total Roto</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-rule/60 stat-mono text-ink-muted">
                {currentSeasonData.map((row: any, idx: number) => {
                  const isAllTime = selectedSeason === "ALL-TIME";
                  const isHighlighted = selectedFranchise === row.franchise_id;
                  const rank = isAllTime ? idx + 1 : row.overall_roto_rank;
                  const totalScore = isAllTime ? row.career_roto_score : row.roto_score;

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
                          className="hover:underline flex items-center gap-2"
                        >
                          <div 
                            className="h-2 w-2 rounded-full shrink-0" 
                            style={{ backgroundColor: row.primary_color }} 
                          />
                          <span className="truncate max-w-[130px]">{row.franchise_name}</span>
                        </Link>
                      </td>
                      <td className="py-2.5 px-2 text-right font-mono">
                        {viewMode === "points" 
                          ? (isAllTime ? row.avg_pass_yds_pts?.toFixed(1) : row.pass_yds_pts) 
                          : Math.round(isAllTime ? row.avg_pass_yds : row.pass_yds)}
                      </td>
                      <td className="py-2.5 px-2 text-right font-mono">
                        {viewMode === "points" 
                          ? (isAllTime ? row.avg_pass_tds_pts?.toFixed(1) : row.pass_tds_pts) 
                          : Math.round(isAllTime ? row.avg_pass_tds : row.pass_tds)}
                      </td>
                      <td className="py-2.5 px-2 text-right font-mono">
                        {viewMode === "points" 
                          ? (isAllTime ? row.avg_rush_yds_pts?.toFixed(1) : row.rush_yds_pts) 
                          : Math.round(isAllTime ? row.avg_rush_yds : row.rush_yds)}
                      </td>
                      <td className="py-2.5 px-2 text-right font-mono">
                        {viewMode === "points" 
                          ? (isAllTime ? row.avg_rush_tds_pts?.toFixed(1) : row.rush_tds_pts) 
                          : Math.round(isAllTime ? row.avg_rush_tds : row.rush_tds)}
                      </td>
                      <td className="py-2.5 px-2 text-right font-mono">
                        {viewMode === "points" 
                          ? (isAllTime ? row.avg_ypc_pts?.toFixed(1) : row.ypc_pts) 
                          : (isAllTime ? row.avg_ypc?.toFixed(2) : row.ypc?.toFixed(2))}
                      </td>
                      <td className="py-2.5 px-2 text-right font-mono">
                        {viewMode === "points" 
                          ? (isAllTime ? row.avg_rec_yds_pts?.toFixed(1) : row.rec_yds_pts) 
                          : Math.round(isAllTime ? row.avg_rec_yds : row.rec_yds)}
                      </td>
                      <td className="py-2.5 px-2 text-right font-mono">
                        {viewMode === "points" 
                          ? (isAllTime ? row.avg_rec_tds_pts?.toFixed(1) : row.rec_tds_pts) 
                          : Math.round(isAllTime ? row.avg_rec_tds : row.rec_tds)}
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono font-bold text-brand-yellow">
                        {Number(totalScore).toFixed(1)}
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

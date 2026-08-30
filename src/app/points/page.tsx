"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { 
  Sparkles, 
  TrendingUp, 
  Layers, 
  Shield, 
  Calendar, 
  PieChart, 
  Activity, 
  ArrowRight,
  Award,
  Filter,
  ArrowUp,
  ArrowDown,
  ArrowUpDown
} from "lucide-react";
import { fetchMartJson } from "@/lib/api";

export default function PointsAcquisitionPage() {
  const [data, setData] = useState<any>(null);
  const [selectedSeason, setSelectedSeason] = useState<string>("2025");
  const [loading, setLoading] = useState<boolean>(true);
  const [sortState, setSortState] = useState<{ key: string; dir: "asc" | "desc" }>({
    key: "non_draft_pct",
    dir: "desc"
  });

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetchMartJson("mart_affl_points_acquisition.json");
        setData(res);
      } catch (err) {
        console.error("Error loading points acquisition mart:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const seasonsList = ["2025", "2024", "2023", "2022", "2021", "2020", "2019", "2018", "ALL-TIME"];

  const currentData = useMemo(() => {
    if (!data) return [];
    let raw = [];
    if (selectedSeason === "ALL-TIME") {
      raw = data.all_time_acquisitions || [];
    } else {
      raw = (data.season_acquisitions || []).filter((r: any) => r.season === parseInt(selectedSeason));
    }

    return [...raw].sort((a, b) => {
      let valA = a[sortState.key];
      let valB = b[sortState.key];
      if (typeof valA === "string") {
        valA = valA.toLowerCase();
        valB = (valB || "").toLowerCase();
      }
      if (valA < valB) return sortState.dir === "asc" ? -1 : 1;
      if (valA > valB) return sortState.dir === "asc" ? 1 : -1;
      return 0;
    });
  }, [data, selectedSeason, sortState]);

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

  // Aggregate totals
  const summaryTotals = useMemo(() => {
    if (!currentData || currentData.length === 0) return { total: 0, draft: 0, waiver: 0, fa: 0, nonDraftPct: 0 };
    const tot = currentData.reduce((acc: number, r: any) => acc + (r.total_starter_points || 0), 0);
    const dr = currentData.reduce((acc: number, r: any) => acc + (r.draft_points || 0), 0);
    const wv = currentData.reduce((acc: number, r: any) => acc + (r.waiver_points || 0), 0);
    const fa = currentData.reduce((acc: number, r: any) => acc + (r.free_agent_points || 0), 0);
    return {
      total: Math.round(tot),
      draft: Math.round(dr),
      waiver: Math.round(wv),
      fa: Math.round(fa),
      nonDraftPct: tot > 0 ? Math.round(((wv + fa) / tot) * 100) : 0
    };
  }, [currentData]);

  if (loading) {
    return (
      <div className="py-24 text-center text-xs font-mono text-ink-dim">
        Reconciling 24,762 Starting Lineup Points to Acquisition Sources...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="border-b border-rule pb-6 space-y-2">
        <div className="flex items-center gap-2 text-xs font-mono font-bold text-brand-blue uppercase tracking-wider">
          <span>AFFL SAVANT</span>
          <span>•</span>
          <span>POINT ACQUISITION RECONCILER</span>
        </div>
        <h1 className="font-mono text-2xl md:text-3xl font-black text-ink tracking-tight flex items-center gap-3">
          <Layers className="h-7 w-7 text-brand-lime" />
          <span>Where Points Came From</span>
        </h1>
        <p className="text-xs md:text-sm text-ink-muted max-w-3xl">
          Every started point in AFFL history reconciled to its exact acquisition source: Auction Draft, Waiver Wire FAAB claims, or Free Agency wire additions.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card rounded-xl p-5 border border-rule space-y-1.5 shadow-xl">
          <div className="text-[10px] font-mono text-ink-dim uppercase">Total Started Points ({selectedSeason})</div>
          <div className="font-mono text-2xl font-black text-ink">
            {summaryTotals.total.toLocaleString()} pts
          </div>
          <p className="text-[11px] text-ink-dim font-mono">100% verified non-PPR starting lineups</p>
        </div>

        <div className="glass-card rounded-xl p-5 border border-rule space-y-1.5 shadow-xl">
          <div className="text-[10px] font-mono text-ink-dim uppercase">Draft & Auction Share</div>
          <div className="font-mono text-2xl font-black text-brand-blue">
            {summaryTotals.total > 0 ? Math.round((summaryTotals.draft / summaryTotals.total) * 100) : 0}%
          </div>
          <p className="text-[11px] text-ink-dim font-mono">{summaryTotals.draft.toLocaleString()} pts from drafted assets</p>
        </div>

        <div className="glass-card rounded-xl p-5 border border-rule space-y-1.5 shadow-xl">
          <div className="text-[10px] font-mono text-ink-dim uppercase">Waiver Wire Share</div>
          <div className="font-mono text-2xl font-black text-brand-yellow">
            {summaryTotals.total > 0 ? Math.round((summaryTotals.waiver / summaryTotals.total) * 100) : 0}%
          </div>
          <p className="text-[11px] text-ink-dim font-mono">{summaryTotals.waiver.toLocaleString()} pts from FAAB claims</p>
        </div>

        <div className="glass-card rounded-xl p-5 border border-rule space-y-1.5 shadow-xl">
          <div className="text-[10px] font-mono text-ink-dim uppercase">In-Season Wire Impact</div>
          <div className="font-mono text-2xl font-black text-brand-lime">
            {summaryTotals.nonDraftPct}%
          </div>
          <p className="text-[11px] text-ink-dim font-mono">Points created through in-season management</p>
        </div>
      </div>

      {/* Season Selector */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-card p-3 rounded-xl border border-rule">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-mono text-ink-dim uppercase mr-2">Select Season:</span>
          {seasonsList.map((yr) => (
            <button
              key={yr}
              onClick={() => setSelectedSeason(yr)}
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
        <span className="text-[11px] font-mono text-ink-dim">
          Click any column header to sort
        </span>
      </div>

      {/* Main Table */}
      <div className="rounded-xl border border-rule bg-card overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-rule bg-card-elevated/70 text-[10px] font-mono uppercase">
                {renderSortHeader("Franchise", "franchise_name", "left", "px-4")}
                {renderSortHeader("Total Pts", "total_starter_points", "right")}
                {renderSortHeader("Draft Pts", "draft_points", "right")}
                {renderSortHeader("Draft %", "draft_pct", "center")}
                {renderSortHeader("Waiver Pts", "waiver_points", "right")}
                {renderSortHeader("Waiver %", "waiver_pct", "center")}
                {renderSortHeader("Free Agent Pts", "free_agent_points", "right")}
                {renderSortHeader("FA %", "fa_pct", "center")}
                {renderSortHeader("Wire Creation %", "non_draft_pct", "center", "px-4 font-bold text-brand-lime")}
              </tr>
            </thead>
            <tbody className="divide-y divide-rule/60 stat-mono text-ink-muted">
              {currentData.map((row: any, idx: number) => (
                <tr key={idx} className="hover:bg-card-hover/80 transition-colors">
                  <td className="py-3 px-4 font-sans font-semibold text-ink">
                    <Link
                      href={`/franchises/${row.franchise_id}`}
                      className="hover:underline flex items-center gap-2"
                    >
                      <div
                        className="h-2.5 w-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: row.primary_color }}
                      />
                      <span>{row.franchise_name}</span>
                    </Link>
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-ink">
                    {Number(row.total_starter_points).toLocaleString(undefined, { maximumFractionDigits: 1 })}
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-brand-blue font-semibold">
                    {Number(row.draft_points).toLocaleString(undefined, { maximumFractionDigits: 1 })}
                  </td>
                  <td className="py-3 px-3 text-center font-mono text-ink-dim">
                    {row.draft_pct}%
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-brand-yellow font-semibold">
                    {Number(row.waiver_points).toLocaleString(undefined, { maximumFractionDigits: 1 })}
                  </td>
                  <td className="py-3 px-3 text-center font-mono text-ink-dim">
                    {row.waiver_pct}%
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-ink font-semibold">
                    {Number(row.free_agent_points).toLocaleString(undefined, { maximumFractionDigits: 1 })}
                  </td>
                  <td className="py-3 px-3 text-center font-mono text-ink-dim">
                    {row.fa_pct}%
                  </td>
                  <td className="py-3 px-4 text-center font-mono font-bold text-brand-lime">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[11px]">
                      {row.non_draft_pct}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

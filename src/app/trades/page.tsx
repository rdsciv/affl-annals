"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Repeat, Shield, Calendar, Search, ArrowLeftRight } from "lucide-react";
import { CANONICAL_FRANCHISES } from "@/lib/constants";
import { fetchMartJson } from "@/lib/api";

export default function TradesPage() {
  const [trades, setTrades] = useState<any[]>([]);
  const [selectedSeason, setSelectedSeason] = useState<number | "ALL">("ALL");
  const [selectedFranchise, setSelectedFranchise] = useState<string>("ALL");
  const [search, setSearch] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadTrades() {
      try {
        const data = await fetchMartJson("mart_affl_trades.json");
        setTrades(data || []);
      } catch (err) {
        console.error("Error loading trades mart:", err);
      } finally {
        setLoading(false);
      }
    }
    loadTrades();
  }, []);

  const [sortBy, setSortBy] = useState<string>("newest");

  const filteredTrades = useMemo(() => {
    const raw = (trades || []).filter((t) => {
      if (selectedSeason !== "ALL" && t.season !== selectedSeason) return false;
      if (
        selectedFranchise !== "ALL" &&
        t.team1_franchise_id !== selectedFranchise &&
        t.team2_franchise_id !== selectedFranchise
      ) {
        return false;
      }
      if (search) {
        const q = search.toLowerCase();
        const t1 = (t.team1_name || "").toLowerCase();
        const t2 = (t.team2_name || "").toLowerCase();
        const p1 = (t.team1_sent || []).some((p: any) =>
          (p.player_name || "").toLowerCase().includes(q)
        );
        const p2 = (t.team2_sent || []).some((p: any) =>
          (p.player_name || "").toLowerCase().includes(q)
        );
        if (!t1.includes(q) && !t2.includes(q) && !p1 && !p2) return false;
      }
      return true;
    });

    return [...raw].sort((a, b) => {
      if (sortBy === "newest") {
        if (b.season !== a.season) return b.season - a.season;
        return (b.week || 0) - (a.week || 0);
      }
      if (sortBy === "oldest") {
        if (a.season !== b.season) return a.season - b.season;
        return (a.week || 0) - (b.week || 0);
      }
      if (sortBy === "most_assets") {
        const totalA = (a.team1_sent?.length || 0) + (a.team2_sent?.length || 0);
        const totalB = (b.team1_sent?.length || 0) + (b.team2_sent?.length || 0);
        return totalB - totalA;
      }
      if (sortBy === "team1") {
        return (a.team1_name || "").localeCompare(b.team1_name || "");
      }
      return 0;
    });
  }, [trades, selectedSeason, selectedFranchise, search, sortBy]);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-rule pb-6">
        <div>
          <h1 className="font-mono text-2xl md:text-3xl font-black text-ink tracking-tight flex items-center gap-3">
            <Repeat className="h-7 w-7 text-brand-blue" />
            <span>AFFL Canonical Trade Ledger</span>
          </h1>
          <p className="text-xs md:text-sm text-ink-muted mt-1">
            Complete database of all {trades.length} verified two-way player trades executed across AFFL history (2014–2025).
          </p>
        </div>
        <div className="flex items-center gap-2 font-mono text-xs text-ink-dim bg-card-elevated px-3 py-1.5 rounded-lg border border-rule">
          <span>Verified Two-Way Trades:</span>
          <strong className="text-brand-blue">{trades.length}</strong>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-rule bg-card p-4">
        <div className="flex flex-wrap items-center gap-2">
          {/* Season Selector */}
          <div className="flex items-center gap-1.5 text-xs">
            <Calendar className="h-3.5 w-3.5 text-ink-dim" />
            <select
              value={selectedSeason}
              onChange={(e) =>
                setSelectedSeason(e.target.value === "ALL" ? "ALL" : parseInt(e.target.value))
              }
              className="bg-card-elevated text-ink font-semibold rounded px-2.5 py-1 border border-rule focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Seasons</option>
              {Array.from({ length: 12 }, (_, i) => 2025 - i).map((y) => (
                <option key={y} value={y}>
                  {y} Season
                </option>
              ))}
            </select>
          </div>

          {/* Franchise Selector */}
          <div className="flex items-center gap-1.5 text-xs">
            <Shield className="h-3.5 w-3.5 text-ink-dim" />
            <select
              value={selectedFranchise}
              onChange={(e) => setSelectedFranchise(e.target.value)}
              className="bg-card-elevated text-ink font-semibold rounded px-2.5 py-1 border border-rule focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Franchises</option>
              {CANONICAL_FRANCHISES.map((f) => (
                <option key={f.franchise_id} value={f.franchise_id}>
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
              className="bg-card-elevated text-ink font-semibold rounded px-2.5 py-1 border border-rule focus:outline-none cursor-pointer"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="most_assets">Most Assets Exchanged</option>
              <option value="team1">By Club Name</option>
            </select>
          </div>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-ink-dim" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search player or team..."
            className="w-full rounded-lg bg-card-elevated pl-8 pr-3 py-1.5 text-xs text-ink placeholder-ink-dim border border-rule focus:border-brand-blue focus:outline-none"
          />
        </div>
      </div>

      {/* Trades Grid */}
      {loading ? (
        <div className="py-24 text-center text-xs font-mono text-ink-dim">
          Loading verified trades ledger...
        </div>
      ) : filteredTrades.length === 0 ? (
        <div className="rounded-xl border border-rule bg-card py-16 text-center text-ink-muted">
          <p className="font-mono text-sm">No trades found matching the current filters.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTrades.map((trade, idx) => (
            <div
              key={trade.trade_id}
              className="rounded-xl p-5 border border-rule bg-card hover:border-rule-bright transition-all space-y-4 shadow-md"
            >
              {/* Header */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-rule pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="rounded bg-card-elevated font-mono font-bold text-xs text-brand-blue px-2 py-0.5 border border-rule">
                    {trade.season} · Week {trade.week}
                  </span>
                  <span className="font-mono text-xs font-semibold text-ink">
                    {trade.team1_name} &harr; {trade.team2_name}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[11px] text-ink-dim">
                    Trade #{idx + 1} of {filteredTrades.length}
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-brand-blue/10 text-brand-blue border border-brand-blue/20">
                    Two-Way Swap
                  </span>
                </div>
              </div>

              {/* Two Sides of the Trade */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Team 1 Receives */}
                <div className="rounded-lg bg-card-elevated/60 border border-rule/70 p-4 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: trade.team1_franchise_color || "#5b87ac" }}
                      />
                      <span className="font-mono text-xs font-bold text-ink">
                        {trade.team1_name}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-ink-dim">
                      Receives ({trade.team2_sent?.length || 0})
                    </span>
                  </div>

                  <div className="space-y-1.5 pt-1">
                    {trade.team2_sent.map((p: any, pIdx: number) => (
                      <div
                        key={pIdx}
                        className="flex items-center justify-between text-xs py-1.5 px-2.5 rounded bg-card border border-rule/50"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[10px] font-bold text-brand-blue px-1.5 py-0.5 rounded bg-brand-blue/10 border border-brand-blue/20">
                            {p.position}
                          </span>
                          <span className="font-medium text-ink">{p.player_name}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Team 2 Receives */}
                <div className="rounded-lg bg-card-elevated/60 border border-rule/70 p-4 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: trade.team2_franchise_color || "#c05a34" }}
                      />
                      <span className="font-mono text-xs font-bold text-ink">
                        {trade.team2_name}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-ink-dim">
                      Receives ({trade.team1_sent?.length || 0})
                    </span>
                  </div>

                  <div className="space-y-1.5 pt-1">
                    {trade.team1_sent.map((p: any, pIdx: number) => (
                      <div
                        key={pIdx}
                        className="flex items-center justify-between text-xs py-1.5 px-2.5 rounded bg-card border border-rule/50"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[10px] font-bold text-brand-orange px-1.5 py-0.5 rounded bg-brand-orange/10 border border-brand-orange/20">
                            {p.position}
                          </span>
                          <span className="font-medium text-ink">{p.player_name}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

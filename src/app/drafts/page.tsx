"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { ListOrdered, Search, Shield, DollarSign, Award, Sparkles, Filter } from "lucide-react";
import { CANONICAL_FRANCHISES } from "@/lib/constants";

export default function DraftsPage() {
  const [draftPicks, setDraftPicks] = useState<any[]>([]);
  const [selectedSeason, setSelectedSeason] = useState<number>(2025);
  const [selectedFranchise, setSelectedFranchise] = useState<string>("ALL");
  const [selectedPos, setSelectedPos] = useState<string>("ALL");
  const [search, setSearch] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadDrafts() {
      try {
        const res = await fetch("/data/marts/mart_affl_draft_value.json");
        if (res.ok) {
          const data = await res.json();
          setDraftPicks(data);
        }
      } catch (err) {
        console.error("Error loading draft values:", err);
      } finally {
        setLoading(false);
      }
    }
    loadDrafts();
  }, []);

  const filteredPicks = useMemo(() => {
    return draftPicks.filter((p) => {
      if (p.season !== selectedSeason) return false;
      if (selectedFranchise !== "ALL" && p.franchise_id !== selectedFranchise) return false;
      if (selectedPos !== "ALL" && p.position !== selectedPos) return false;
      if (search && !p.player_name.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [draftPicks, selectedSeason, selectedFranchise, selectedPos, search]);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-rule pb-6">
        <div>
          <h1 className="font-mono text-2xl md:text-3xl font-black text-ink tracking-tight flex items-center gap-3">
            <ListOrdered className="h-7 w-7 text-brand-blue" />
            <span>AFFL Draft & Auction Value Ledger</span>
          </h1>
          <p className="text-xs md:text-sm text-ink-muted mt-1">
            Historical draft auction dollars, keeper selections, realized fantasy points, and Draft Points Above Replacement (Draft PAR).
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-rule bg-card p-4">
        <div className="flex flex-wrap items-center gap-2">
          {/* Season Selector */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="font-mono text-ink-dim uppercase text-[10px]">Season:</span>
            <select
              value={selectedSeason}
              onChange={(e) => setSelectedSeason(parseInt(e.target.value))}
              className="rounded-md bg-card-elevated px-2.5 py-1.5 text-xs text-ink font-semibold border border-rule focus:outline-none"
            >
              {Array.from({ length: 12 }, (_, i) => 2025 - i).map((y) => (
                <option key={y} value={y}>{y} Draft</option>
              ))}
            </select>
          </div>

          {/* Franchise Selector */}
          <div className="flex items-center gap-1.5 text-xs">
            <Shield className="h-3.5 w-3.5 text-ink-dim" />
            <select
              value={selectedFranchise}
              onChange={(e) => setSelectedFranchise(e.target.value)}
              className="rounded-md bg-card-elevated px-2.5 py-1.5 text-xs text-ink font-medium border border-rule focus:outline-none max-w-[180px]"
            >
              <option value="ALL">All Franchises</option>
              {CANONICAL_FRANCHISES.map((f) => (
                <option key={f.franchise_id} value={f.franchise_id}>
                  {f.display_name}
                </option>
              ))}
            </select>
          </div>

          {/* Position Selector */}
          <div className="flex items-center gap-1.5 text-xs">
            <Filter className="h-3.5 w-3.5 text-ink-dim" />
            <select
              value={selectedPos}
              onChange={(e) => setSelectedPos(e.target.value)}
              className="rounded-md bg-card-elevated px-2.5 py-1.5 text-xs text-ink font-medium border border-rule focus:outline-none"
            >
              <option value="ALL">All Pos</option>
              <option value="QB">QB</option>
              <option value="RB">RB</option>
              <option value="WR">WR</option>
              <option value="TE">TE</option>
              <option value="K">K</option>
              <option value="D/ST">D/ST</option>
            </select>
          </div>
        </div>

        {/* Search */}
        <div className="relative min-w-[200px]">
          <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-ink-dim" />
          <input
            type="text"
            placeholder="Search drafted player..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-md bg-card-elevated pl-8 pr-3 py-1.5 text-xs text-ink placeholder-ink-dim border border-rule focus:border-brand-blue focus:outline-none"
          />
        </div>
      </div>

      {/* Draft Table */}
      {loading ? (
        <div className="py-20 text-center text-xs font-mono text-ink-dim">
          Loading draft ledger...
        </div>
      ) : (
        <div className="rounded-xl border border-rule bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-rule bg-card-elevated/70 text-[11px] font-mono uppercase tracking-wider text-ink-dim">
                  <th className="py-3 px-4">Pick #</th>
                  <th className="py-3 px-4">Player</th>
                  <th className="py-3 px-3">Pos</th>
                  <th className="py-3 px-4">Drafting Franchise</th>
                  <th className="py-3 px-3 text-right">Price</th>
                  <th className="py-3 px-3 text-center">Keeper</th>
                  <th className="py-3 px-4 text-right">Season Points</th>
                  <th className="py-3 px-3 text-right">Starts</th>
                  <th className="py-3 px-4 text-right">Draft PAR</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-rule/60 stat-mono">
                {filteredPicks.map((pick, idx) => {
                  const isHighVal = pick.draft_par > 20;

                  return (
                    <tr key={idx} className="hover:bg-card-hover/80 transition-colors">
                      <td className="py-2.5 px-4 font-mono font-semibold text-ink-dim">
                        #{pick.pick_overall || idx + 1}
                      </td>
                      <td className="py-2.5 px-4 font-sans font-bold text-ink">
                        <Link
                          href={`/players/${pick.gsis_id || pick.player_name}`}
                          className="hover:text-brand-blue transition-colors"
                        >
                          {pick.player_name}
                        </Link>
                      </td>
                      <td className="py-2.5 px-3 font-mono">
                        <span className="rounded bg-card-elevated px-1.5 py-0.5 text-[10px] font-semibold text-ink-muted border border-rule">
                          {pick.position}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 font-sans text-xs">
                        <Link
                          href={`/franchises/${pick.franchise_id}`}
                          className="hover:underline font-medium text-brand-blue"
                        >
                          {pick.franchise_name}
                        </Link>
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-brand-yellow">
                        \${pick.auction_price}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        {pick.is_keeper === 1 ? (
                          <span className="rounded bg-brand-lime/15 px-1.5 py-0.5 text-[9px] font-mono font-bold text-brand-lime border border-brand-lime/30">
                            KEEPER
                          </span>
                        ) : (
                          <span className="text-ink-dim text-[10px]">—</span>
                        )}
                      </td>
                      <td className="py-2.5 px-4 text-right font-bold text-ink">
                        {Number(pick.total_season_points || 0).toFixed(1)}
                      </td>
                      <td className="py-2.5 px-3 text-right text-ink-muted">
                        {pick.weeks_started} wks
                      </td>
                      <td className={`py-2.5 px-4 text-right font-bold ${
                        isHighVal ? "text-brand-lime" : pick.draft_par > 0 ? "text-ink" : "text-ink-dim"
                      }`}>
                        {Number(pick.draft_par || 0) > 0 ? `+${Number(pick.draft_par || 0).toFixed(1)}` : Number(pick.draft_par || 0).toFixed(1)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { ListOrdered, Search, Shield, DollarSign, Award, Sparkles, Filter, Grid, Table as TableIcon, Flame, AlertTriangle } from "lucide-react";
import { CANONICAL_FRANCHISES } from "@/lib/constants";
import { fetchMartJson } from "@/lib/api";
import DraftBoardGrid from "@/components/DraftBoardGrid";

export default function DraftsPage() {
  const [draftPicks, setDraftPicks] = useState<any[]>([]);
  const [selectedSeason, setSelectedSeason] = useState<number>(2025);
  const [selectedFranchise, setSelectedFranchise] = useState<string>("ALL");
  const [selectedPos, setSelectedPos] = useState<string>("ALL");
  const [search, setSearch] = useState<string>("");
  const [viewMode, setViewMode] = useState<"table" | "board" | "steals_busts">("table");
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadDrafts() {
      try {
        const data = await fetchMartJson("mart_affl_draft_value.json");
        setDraftPicks(data || []);
      } catch (err) {
        console.error("Error loading draft values:", err);
      } finally {
        setLoading(false);
      }
    }
    loadDrafts();
  }, []);

  const seasonPicks = useMemo(() => {
    return (draftPicks || []).filter((p) => p.season === selectedSeason);
  }, [draftPicks, selectedSeason]);

  const [sortState, setSortState] = useState<{ key: string; dir: "asc" | "desc" }>({
    key: "pick_overall",
    dir: "asc"
  });

  const filteredPicks = useMemo(() => {
    const raw = seasonPicks.filter((p) => {
      if (selectedFranchise !== "ALL" && p.franchise_id !== selectedFranchise) return false;
      if (selectedPos !== "ALL" && p.position !== selectedPos) return false;
      if (search && !(p.player_name || "").toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });

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
  }, [seasonPicks, selectedFranchise, selectedPos, search, sortState]);

  const handleSort = (key: string) => {
    if (sortState.key === key) {
      setSortState({ key, dir: sortState.dir === "asc" ? "desc" : "asc" });
    } else {
      setSortState({ key, dir: ["pick_overall", "player_name", "position", "franchise_name"].includes(key) ? "asc" : "desc" });
    }
  };

  const renderSortHeader = (label: string, key: string, align: "left" | "center" | "right" = "left", extraClass: string = "") => {
    const isSorted = sortState.key === key;
    return (
      <th
        onClick={() => handleSort(key)}
        className={`py-3 px-4 cursor-pointer select-none hover:text-brand-blue transition-colors ${
          align === "center" ? "text-center" : align === "right" ? "text-right" : "text-left"
        } ${isSorted ? "text-brand-orange bg-brand-orange/5" : "text-ink-dim"} ${extraClass}`}
      >
        <div className={`inline-flex items-center gap-1 ${align === "right" ? "justify-end" : align === "center" ? "justify-center" : "justify-start"}`}>
          <span>{label}</span>
          {isSorted ? (
            sortState.dir === "desc" ? (
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

  // All-time steals & busts calculations
  const allTimeSteals = useMemo(() => {
    return [...(draftPicks || [])]
      .filter((p) => p.auction_price <= 10 && p.draft_par > 0)
      .sort((a, b) => b.draft_par - a.draft_par)
      .slice(0, 10);
  }, [draftPicks]);

  const allTimeBusts = useMemo(() => {
    return [...(draftPicks || [])]
      .filter((p) => p.auction_price >= 30)
      .sort((a, b) => a.draft_par - b.draft_par)
      .slice(0, 10);
  }, [draftPicks]);

  // Spend DNA for selected season
  const spendDNA = useMemo(() => {
    const totalSpend = seasonPicks.reduce((acc, p) => acc + (p.auction_price || 0), 0);
    if (!totalSpend) return { QB: 0, RB: 0, WR: 0, TE: 0, OTHER: 0, totalSpend: 0 };

    const posSpend: Record<string, number> = { QB: 0, RB: 0, WR: 0, TE: 0, OTHER: 0 };
    for (const p of seasonPicks) {
      if (["QB", "RB", "WR", "TE"].includes(p.position)) {
        posSpend[p.position] += p.auction_price || 0;
      } else {
        posSpend["OTHER"] += p.auction_price || 0;
      }
    }
    return {
      QB: Math.round((posSpend["QB"] / totalSpend) * 100),
      RB: Math.round((posSpend["RB"] / totalSpend) * 100),
      WR: Math.round((posSpend["WR"] / totalSpend) * 100),
      TE: Math.round((posSpend["TE"] / totalSpend) * 100),
      OTHER: Math.round((posSpend["OTHER"] / totalSpend) * 100),
      totalSpend,
    };
  }, [seasonPicks]);

  const getPositionBadge = (pos: string) => {
    switch (pos) {
      case "QB":
        return "bg-rose-500/15 text-rose-400 border-rose-500/30";
      case "RB":
        return "bg-emerald-500/15 text-emerald-400 border-emerald-500/30";
      case "WR":
        return "bg-sky-500/15 text-sky-400 border-sky-500/30";
      case "TE":
        return "bg-amber-500/15 text-amber-400 border-amber-500/30";
      case "DST":
      case "D/ST":
        return "bg-purple-500/15 text-purple-400 border-purple-500/30";
      default:
        return "bg-card-elevated text-ink-dim border-rule";
    }
  };

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

        {/* View Mode Toggle */}
        <div className="flex items-center rounded-lg bg-card-elevated p-1 border border-rule self-start md:self-auto">
          <button
            onClick={() => setViewMode("table")}
            className={`flex items-center gap-1.5 rounded px-3 py-1.5 text-xs font-medium transition-all ${
              viewMode === "table"
                ? "bg-brand-blue text-canvas font-semibold shadow-sm"
                : "text-ink-muted hover:text-ink"
            }`}
          >
            <TableIcon className="h-3.5 w-3.5" />
            <span>Table</span>
          </button>
          <button
            onClick={() => setViewMode("board")}
            className={`flex items-center gap-1.5 rounded px-3 py-1.5 text-xs font-medium transition-all ${
              viewMode === "board"
                ? "bg-brand-blue text-canvas font-semibold shadow-sm"
                : "text-ink-muted hover:text-ink"
            }`}
          >
            <Grid className="h-3.5 w-3.5" />
            <span>Draft Board</span>
          </button>
          <button
            onClick={() => setViewMode("steals_busts")}
            className={`flex items-center gap-1.5 rounded px-3 py-1.5 text-xs font-medium transition-all ${
              viewMode === "steals_busts"
                ? "bg-brand-blue text-canvas font-semibold shadow-sm"
                : "text-ink-muted hover:text-ink"
            }`}
          >
            <Flame className="h-3.5 w-3.5 text-brand-orange" />
            <span>Steals & Busts</span>
          </button>
        </div>
      </div>

      {/* Spend DNA Banner */}
      {viewMode !== "steals_busts" && (
        <div className="rounded-xl border border-rule bg-card p-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-brand-lime" />
            <span className="font-mono text-xs font-bold text-ink">
              {selectedSeason} Auction Spend DNA:
            </span>
            <span className="font-mono text-xs text-ink-dim">
              (${spendDNA.totalSpend.toLocaleString()} Total)
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono">
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-rose-500"></span> QB: <strong>{spendDNA.QB}%</strong>
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-emerald-500"></span> RB: <strong>{spendDNA.RB}%</strong>
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-sky-500"></span> WR: <strong>{spendDNA.WR}%</strong>
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-amber-500"></span> TE: <strong>{spendDNA.TE}%</strong>
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-purple-500"></span> D/K: <strong>{spendDNA.OTHER}%</strong>
            </span>
          </div>
        </div>
      )}

      {/* Filter Bar (for Table and Board modes) */}
      {viewMode !== "steals_busts" && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-rule bg-card p-4">
          <div className="flex flex-wrap items-center gap-2">
            {/* Season Selector */}
            <div className="flex items-center gap-1.5 text-xs">
              <span className="font-mono text-ink-dim uppercase text-[10px]">Season:</span>
              <select
                value={selectedSeason}
                onChange={(e) => setSelectedSeason(parseInt(e.target.value))}
                className="rounded-md bg-card-elevated px-2.5 py-1.5 text-xs text-ink font-semibold border border-rule focus:outline-none cursor-pointer"
              >
                {Array.from({ length: 12 }, (_, i) => 2025 - i).map((y) => (
                  <option key={y} value={y}>
                    {y} Draft
                  </option>
                ))}
              </select>
            </div>

            {viewMode === "table" && (
              <>
                {/* Franchise Selector */}
                <div className="flex items-center gap-1.5 text-xs">
                  <Shield className="h-3.5 w-3.5 text-ink-dim" />
                  <select
                    value={selectedFranchise}
                    onChange={(e) => setSelectedFranchise(e.target.value)}
                    className="rounded-md bg-card-elevated px-2.5 py-1.5 text-xs text-ink font-medium border border-rule focus:outline-none max-w-[180px] cursor-pointer"
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
                    className="rounded-md bg-card-elevated px-2.5 py-1.5 text-xs text-ink font-medium border border-rule focus:outline-none cursor-pointer"
                  >
                    <option value="ALL">All Pos</option>
                    <option value="QB">QB</option>
                    <option value="RB">RB</option>
                    <option value="WR">WR</option>
                    <option value="TE">TE</option>
                    <option value="K">K</option>
                    <option value="DST">DST</option>
                  </select>
                </div>
              </>
            )}
          </div>

          {viewMode === "table" && (
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-ink-dim" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search player name..."
                className="w-full rounded-lg bg-card-elevated pl-8 pr-3 py-1.5 text-xs text-ink placeholder-ink-dim border border-rule focus:border-brand-blue focus:outline-none"
              />
            </div>
          )}
        </div>
      )}

      {/* Main Content Area */}
      {loading ? (
        <div className="py-24 text-center text-xs font-mono text-ink-dim">
          Loading canonical draft records...
        </div>
      ) : viewMode === "board" ? (
        <DraftBoardGrid picks={seasonPicks} season={selectedSeason} />
      ) : viewMode === "steals_busts" ? (
        /* Steals & Busts Leaderboard */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Top All-Time Steals */}
          <div className="rounded-xl border border-rule bg-card p-5 space-y-4 shadow-xl">
            <div className="flex items-center gap-2 border-b border-rule pb-3">
              <Flame className="h-5 w-5 text-emerald-400" />
              <div>
                <h3 className="font-mono text-sm font-bold text-ink">
                  Top 10 All-Time Draft Steals
                </h3>
                <p className="text-[11px] text-ink-muted">
                  Highest Draft PAR achieved on bargain auction spend ($10 or less).
                </p>
              </div>
            </div>

            <div className="space-y-2.5">
              {allTimeSteals.map((s, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-card-elevated/70 border border-rule text-xs"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="font-mono font-bold text-emerald-400 text-xs w-5">
                      #{idx + 1}
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-ink truncate">{s.player_name}</span>
                        <span className={`text-[9px] font-mono px-1 py-0.2 rounded border ${getPositionBadge(s.position)}`}>
                          {s.position}
                        </span>
                      </div>
                      <div className="text-[11px] text-ink-dim truncate">
                        {s.season} Draft · {s.franchise_name}
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="font-mono font-black text-brand-lime">${s.auction_price}</div>
                    <div className="font-mono text-[11px] font-bold text-emerald-400">
                      +{s.draft_par.toFixed(1)} PAR
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top All-Time Busts */}
          <div className="rounded-xl border border-rule bg-card p-5 space-y-4 shadow-xl">
            <div className="flex items-center gap-2 border-b border-rule pb-3">
              <AlertTriangle className="h-5 w-5 text-rose-400" />
              <div>
                <h3 className="font-mono text-sm font-bold text-ink">
                  Top 10 All-Time Draft Busts
                </h3>
                <p className="text-[11px] text-ink-muted">
                  Lowest Draft PAR returns on premium auction spend ($30 or more).
                </p>
              </div>
            </div>

            <div className="space-y-2.5">
              {allTimeBusts.map((b, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-card-elevated/70 border border-rule text-xs"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="font-mono font-bold text-rose-400 text-xs w-5">
                      #{idx + 1}
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-ink truncate">{b.player_name}</span>
                        <span className={`text-[9px] font-mono px-1 py-0.2 rounded border ${getPositionBadge(b.position)}`}>
                          {b.position}
                        </span>
                      </div>
                      <div className="text-[11px] text-ink-dim truncate">
                        {b.season} Draft · {b.franchise_name}
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="font-mono font-black text-rose-400">${b.auction_price}</div>
                    <div className="font-mono text-[11px] font-bold text-rose-400">
                      {b.draft_par.toFixed(1)} PAR
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Table View */
        <div className="rounded-xl border border-rule bg-card overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-rule bg-card-elevated text-ink-dim font-mono uppercase text-[10px] tracking-wider">
                  {renderSortHeader("Pick", "pick_overall", "left")}
                  {renderSortHeader("Player", "player_name", "left")}
                  {renderSortHeader("Pos", "position", "left")}
                  {renderSortHeader("Franchise", "franchise_name", "left")}
                  {renderSortHeader("Auction $", "auction_price", "right")}
                  {renderSortHeader("Status", "is_keeper", "center")}
                  {renderSortHeader("Rostered", "weeks_rostered", "right")}
                  {renderSortHeader("Started", "weeks_started", "right")}
                  {renderSortHeader("Points", "total_season_points", "right")}
                  {renderSortHeader("Draft PAR", "draft_par", "right")}
                </tr>
              </thead>
              <tbody className="divide-y divide-rule font-mono">
                {filteredPicks.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-12 text-center text-ink-dim">
                      No draft selections found matching current filters.
                    </td>
                  </tr>
                ) : (
                  filteredPicks.map((pick, idx) => (
                    <tr key={idx} className="hover:bg-card-elevated/50 transition-colors">
                      <td className="py-2.5 px-4 text-ink-dim">#{pick.pick_overall}</td>
                      <td className="py-2.5 px-4 font-sans font-semibold text-ink">
                        {pick.gsis_id ? (
                          <Link
                            href={`/players/${encodeURIComponent(pick.gsis_id)}`}
                            className="hover:text-brand-blue transition-colors"
                          >
                            {pick.player_name}
                          </Link>
                        ) : (
                          pick.player_name
                        )}
                      </td>
                      <td className="py-2.5 px-4">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${getPositionBadge(pick.position)}`}>
                          {pick.position}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 font-sans text-ink-muted">{pick.franchise_name}</td>
                      <td className="py-2.5 px-4 text-right font-bold text-brand-lime">
                        ${pick.auction_price}
                      </td>
                      <td className="py-2.5 px-4 text-center">
                        {pick.is_keeper === 1 ? (
                          <span className="rounded bg-amber-500/10 text-amber-400 px-1.5 py-0.5 text-[9px] border border-amber-500/20">
                            Keeper
                          </span>
                        ) : (
                          <span className="text-ink-dim text-[10px]">Draft</span>
                        )}
                      </td>
                      <td className="py-2.5 px-4 text-right text-ink-muted">{pick.weeks_rostered} wks</td>
                      <td className="py-2.5 px-4 text-right text-ink-muted">{pick.weeks_started} wks</td>
                      <td className="py-2.5 px-4 text-right font-bold text-brand-blue">
                        {pick.total_season_points.toFixed(1)}
                      </td>
                      <td
                        className={`py-2.5 px-4 text-right font-bold ${
                          pick.draft_par >= 0 ? "text-emerald-400" : "text-rose-400"
                        }`}
                      >
                        {pick.draft_par > 0 ? `+${pick.draft_par.toFixed(1)}` : pick.draft_par.toFixed(1)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

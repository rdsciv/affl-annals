"use client";

import { useState, useEffect, useMemo } from "react";
import { CANONICAL_FRANCHISES } from "@/lib/constants";
import { fetchMartJson } from "@/lib/api";
import { Swords, X, Trophy, ChevronRight, Calendar, Award } from "lucide-react";

interface H2HPair {
  franchise1_id: string;
  franchise2_id: string;
  total_games: number;
  f1_wins: number;
  f2_wins: number;
  ties: number;
  f1_total_points: number;
  f2_total_points: number;
  games: {
    season: number;
    week: number;
    phase: string;
    f1_name: string;
    f1_points: number;
    f2_name: string;
    f2_points: number;
    winner: string;
  }[];
}

export default function HeadToHeadMatrix() {
  const [h2hData, setH2hData] = useState<H2HPair[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPair, setSelectedPair] = useState<H2HPair | null>(null);
  const [viewTab, setViewTab] = useState<"matrix" | "rivalries">("matrix");

  useEffect(() => {
    async function loadH2H() {
      try {
        const data = await fetchMartJson("mart_affl_head_to_head.json");
        setH2hData(data || []);
      } catch (err) {
        console.error("Error loading H2H mart:", err);
      } finally {
        setLoading(false);
      }
    }
    loadH2H();
  }, []);

  const franchises = CANONICAL_FRANCHISES;

  // Lookup map for (f1, f2) -> H2HPair
  const pairMap = useMemo(() => {
    const map = new Map<string, H2HPair>();
    for (const p of h2hData) {
      const key = `${p.franchise1_id}_${p.franchise2_id}`;
      map.set(key, p);
    }
    return map;
  }, [h2hData]);

  // Top rivalries sorted by total games played
  const topRivalries = useMemo(() => {
    return [...h2hData].sort((a, b) => b.total_games - a.total_games).slice(0, 15);
  }, [h2hData]);

  const getRecordForCell = (fRowId: string, fColId: string) => {
    if (fRowId === fColId) return null;
    const key = [fRowId, fColId].sort().join("_");
    const pair = pairMap.get(key);
    if (!pair) return { wins: 0, losses: 0, ties: 0, total: 0, pair: null };

    if (pair.franchise1_id === fRowId) {
      return {
        wins: pair.f1_wins,
        losses: pair.f2_wins,
        ties: pair.ties,
        total: pair.total_games,
        pair,
      };
    } else {
      return {
        wins: pair.f2_wins,
        losses: pair.f1_wins,
        ties: pair.ties,
        total: pair.total_games,
        pair,
      };
    }
  };

  if (loading) {
    return (
      <div className="py-16 text-center text-xs font-mono text-ink-dim">
        Loading canonical rivalry matrix...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header & Mode Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-rule pb-4">
        <div>
          <h2 className="font-mono text-xl font-bold text-ink flex items-center gap-2.5">
            <Swords className="h-5 w-5 text-brand-orange" />
            <span>All-Time Head-to-Head Rivalry Matrix</span>
          </h2>
          <p className="text-xs text-ink-muted mt-0.5">
            Lifetime head-to-head records and game logs across all 12 seasons (2014–2025).
          </p>
        </div>

        <div className="flex items-center rounded-lg bg-card-elevated p-1 border border-rule self-start sm:self-auto">
          <button
            onClick={() => setViewTab("matrix")}
            className={`rounded px-3 py-1 text-xs font-medium transition-all ${
              viewTab === "matrix"
                ? "bg-brand-blue text-canvas font-semibold shadow-sm"
                : "text-ink-muted hover:text-ink"
            }`}
          >
            Grid Matrix
          </button>
          <button
            onClick={() => setViewTab("rivalries")}
            className={`rounded px-3 py-1 text-xs font-medium transition-all ${
              viewTab === "rivalries"
                ? "bg-brand-blue text-canvas font-semibold shadow-sm"
                : "text-ink-muted hover:text-ink"
            }`}
          >
            Top Rivalries
          </button>
        </div>
      </div>

      {viewTab === "matrix" ? (
        /* Matrix Grid View */
        <div className="rounded-xl border border-rule bg-card p-4 overflow-x-auto shadow-xl">
          <table className="w-full text-center border-collapse text-xs">
            <thead>
              <tr>
                <th className="p-2 text-left font-mono font-bold text-ink-dim text-[11px] border-b border-r border-rule bg-card-elevated sticky left-0 z-10">
                  Franchise
                </th>
                {franchises.map((f) => (
                  <th
                    key={f.franchise_id}
                    className="p-2 font-mono font-bold text-ink text-[11px] border-b border-rule whitespace-nowrap min-w-[70px]"
                    title={f.display_name}
                  >
                    <div className="flex items-center justify-center gap-1.5">
                      <div
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: f.primary_color }}
                      />
                      <span>{f.franchise_id.replace("FRAN_", "")}</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {franchises.map((fRow) => (
                <tr key={fRow.franchise_id} className="hover:bg-card-elevated/40 transition-colors">
                  <td className="p-2.5 text-left font-mono font-bold text-ink border-r border-b border-rule bg-card sticky left-0 z-10 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div
                        className="h-2.5 w-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: fRow.primary_color }}
                      />
                      <span className="text-xs">{fRow.display_name}</span>
                    </div>
                  </td>
                  {franchises.map((fCol) => {
                    const rec = getRecordForCell(fRow.franchise_id, fCol.franchise_id);
                    if (!rec) {
                      return (
                        <td
                          key={fCol.franchise_id}
                          className="p-2 border-b border-rule bg-card-elevated/20 text-ink-dim/40 font-mono text-[11px]"
                        >
                          —
                        </td>
                      );
                    }
                    const isWinning = rec.wins > rec.losses;
                    const isLosing = rec.losses > rec.wins;
                    return (
                      <td
                        key={fCol.franchise_id}
                        onClick={() => rec.pair && setSelectedPair(rec.pair)}
                        className={`p-2 border-b border-rule font-mono text-[11px] font-semibold cursor-pointer transition-all hover:scale-105 ${
                          rec.total === 0
                            ? "text-ink-dim"
                            : isWinning
                            ? "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                            : isLosing
                            ? "bg-rose-500/10 text-rose-400 hover:bg-rose-500/20"
                            : "bg-amber-500/10 text-amber-400 hover:bg-amber-500/20"
                        }`}
                        title={`${fRow.display_name} vs ${fCol.display_name}: ${rec.wins}-${rec.losses}-${rec.ties} (${rec.total} games)`}
                      >
                        {rec.total > 0 ? `${rec.wins}-${rec.losses}` : "0-0"}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-3 flex items-center justify-between text-[11px] font-mono text-ink-dim px-2">
            <span>Click any cell to view complete game logs and playoff matchups.</span>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded bg-emerald-500"></span> Winning Record</span>
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded bg-rose-500"></span> Losing Record</span>
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded bg-amber-500"></span> Tied</span>
            </div>
          </div>
        </div>
      ) : (
        /* Top Rivalries Cards */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {topRivalries.map((pair, idx) => {
            const f1 = franchises.find((f) => f.franchise_id === pair.franchise1_id);
            const f2 = franchises.find((f) => f.franchise_id === pair.franchise2_id);
            return (
              <div
                key={idx}
                onClick={() => setSelectedPair(pair)}
                className="rounded-xl border border-rule bg-card p-4 hover:border-brand-blue hover:shadow-lg transition-all cursor-pointer space-y-3"
              >
                <div className="flex items-center justify-between border-b border-rule pb-2 text-xs">
                  <span className="font-mono text-ink-dim font-bold">Rivalry #{idx + 1}</span>
                  <span className="font-mono text-brand-blue font-semibold">{pair.total_games} Games Played</span>
                </div>

                <div className="flex items-center justify-between gap-3">
                  {/* F1 */}
                  <div className="flex items-center gap-2 min-w-0">
                    <div
                      className="h-3 w-3 rounded-full shrink-0"
                      style={{ backgroundColor: f1?.primary_color || "#00a2ff" }}
                    />
                    <div className="min-w-0">
                      <div className="font-bold text-xs text-ink truncate">{f1?.display_name || pair.franchise1_id}</div>
                      <div className="font-mono text-[11px] text-brand-lime font-bold">{pair.f1_wins} Wins</div>
                    </div>
                  </div>

                  <span className="font-mono text-xs text-ink-dim">vs</span>

                  {/* F2 */}
                  <div className="flex items-center gap-2 min-w-0 text-right">
                    <div className="min-w-0">
                      <div className="font-bold text-xs text-ink truncate">{f2?.display_name || pair.franchise2_id}</div>
                      <div className="font-mono text-[11px] text-brand-orange font-bold">{pair.f2_wins} Wins</div>
                    </div>
                    <div
                      className="h-3 w-3 rounded-full shrink-0"
                      style={{ backgroundColor: f2?.primary_color || "#ff6a00" }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-[10px] font-mono text-ink-dim pt-1 border-t border-rule/50">
                  <span>Pts: {pair.f1_total_points.toFixed(0)} - {pair.f2_total_points.toFixed(0)}</span>
                  <span className="flex items-center text-brand-blue">View Game Log <ChevronRight className="h-3 w-3 ml-0.5" /></span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Rivalry Drilldown Modal */}
      {selectedPair && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in"
          onClick={() => setSelectedPair(null)}
        >
          <div
            className="w-full max-w-2xl rounded-2xl bg-card border border-rule-bright shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-rule bg-card-elevated">
              <div className="flex items-center gap-3">
                <Swords className="h-5 w-5 text-brand-orange" />
                <div>
                  <h3 className="font-mono text-sm font-bold text-ink">
                    {franchises.find((f) => f.franchise_id === selectedPair.franchise1_id)?.display_name || selectedPair.franchise1_id} vs{" "}
                    {franchises.find((f) => f.franchise_id === selectedPair.franchise2_id)?.display_name || selectedPair.franchise2_id}
                  </h3>
                  <p className="text-[11px] text-ink-muted">
                    {selectedPair.total_games} Total Matchups · {selectedPair.f1_wins}W - {selectedPair.f2_wins}L - {selectedPair.ties}T
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedPair(null)}
                className="rounded p-1 text-ink-dim hover:text-ink hover:bg-card-hover"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Game Logs List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2.5 divide-y divide-rule/30">
              {selectedPair.games.map((g, gIdx) => {
                const isF1Win = g.f1_points > g.f2_points;
                const isF2Win = g.f2_points > g.f1_points;
                return (
                  <div key={gIdx} className="pt-2.5 first:pt-0 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-card-elevated text-brand-blue border border-rule">
                        {g.season} · Wk {g.week}
                      </span>
                      {g.phase === "championship" && (
                        <span className="font-mono text-[9px] uppercase px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                          <Award className="h-2.5 w-2.5" /> Playoffs
                        </span>
                      )}
                    </div>

                    {/* Scores */}
                    <div className="flex items-center gap-4 font-mono">
                      <div className={`flex items-center gap-1.5 ${isF1Win ? "font-bold text-emerald-400" : "text-ink-muted"}`}>
                        <span>{g.f1_name}</span>
                        <span>{g.f1_points.toFixed(1)}</span>
                      </div>
                      <span className="text-ink-dim">-</span>
                      <div className={`flex items-center gap-1.5 ${isF2Win ? "font-bold text-emerald-400" : "text-ink-muted"}`}>
                        <span>{g.f2_points.toFixed(1)}</span>
                        <span>{g.f2_name}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer Summary */}
            <div className="px-6 py-3 bg-card-elevated border-t border-rule flex items-center justify-between text-xs font-mono text-ink-dim">
              <span>Points: {selectedPair.f1_total_points.toFixed(1)} vs {selectedPair.f2_total_points.toFixed(1)}</span>
              <span>AFFL Canonical Archive</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { CANONICAL_FRANCHISES } from "@/lib/constants";
import { Sparkles, DollarSign, Award, X, Users, ArrowUpRight } from "lucide-react";

interface DraftBoardGridProps {
  picks: any[];
  season: number;
}

export default function DraftBoardGrid({ picks, season }: DraftBoardGridProps) {
  const [selectedPick, setSelectedPick] = useState<any | null>(null);

  // Group picks by franchise and round
  const { participatingFranchises, gridMap, maxRounds } = useMemo(() => {
    const pSet = new Set<string>();
    let maxR = 1;
    const map = new Map<string, any>(); // key: `${franchise_id}_${round}`

    for (const p of picks) {
      if (p.franchise_id) pSet.add(p.franchise_id);
      if (p.round > maxR) maxR = p.round;
      const key = `${p.franchise_id}_${p.round}`;
      // In auction drafts, if multiple picks in round, store as array or pick
      if (!map.has(key)) {
        map.set(key, p);
      }
    }

    const franchises = CANONICAL_FRANCHISES.filter((f) => pSet.has(f.franchise_id));
    return {
      participatingFranchises: franchises,
      gridMap: map,
      maxRounds: Math.max(maxR, 15),
    };
  }, [picks]);

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
    <div className="space-y-4">
      {/* Draft Board Container */}
      <div className="rounded-xl border border-rule bg-card p-4 overflow-x-auto shadow-xl">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr>
              <th className="p-2.5 font-mono font-bold text-ink-dim text-[11px] border-b border-r border-rule bg-card-elevated sticky left-0 z-10 min-w-[60px] text-center">
                Rd
              </th>
              {participatingFranchises.map((f) => (
                <th
                  key={f.franchise_id}
                  className="p-2.5 font-mono font-bold text-ink text-[11px] border-b border-rule min-w-[140px]"
                >
                  <div className="flex items-center gap-1.5">
                    <div
                      className="h-2.5 w-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: f.primary_color }}
                    />
                    <span className="truncate">{f.display_name}</span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: maxRounds }, (_, rIdx) => {
              const roundNum = rIdx + 1;
              return (
                <tr key={roundNum} className="hover:bg-card-elevated/20 transition-colors">
                  <td className="p-2.5 font-mono font-bold text-ink-dim text-center border-r border-b border-rule bg-card sticky left-0 z-10">
                    #{roundNum}
                  </td>
                  {participatingFranchises.map((f) => {
                    const pick = gridMap.get(`${f.franchise_id}_${roundNum}`);
                    if (!pick) {
                      return (
                        <td
                          key={f.franchise_id}
                          className="p-2 border-b border-rule text-ink-dim/30 font-mono text-[10px]"
                        >
                          —
                        </td>
                      );
                    }
                    const isHighValue = pick.draft_par > 25;
                    return (
                      <td
                        key={f.franchise_id}
                        onClick={() => setSelectedPick(pick)}
                        className={`p-2 border-b border-rule cursor-pointer transition-all hover:bg-card-elevated hover:scale-[1.02] ${
                          isHighValue ? "bg-emerald-500/5" : ""
                        }`}
                      >
                        <div className="rounded-lg p-2 bg-card-elevated/70 border border-rule/70 space-y-1 hover:border-brand-blue/60 transition-colors">
                          <div className="flex items-center justify-between gap-1">
                            <span
                              className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded border ${getPositionBadge(
                                pick.position
                              )}`}
                            >
                              {pick.position}
                            </span>
                            <span className="font-mono text-xs font-black text-brand-lime">
                              ${pick.auction_price}
                            </span>
                          </div>
                          <div className="font-semibold text-xs text-ink truncate" title={pick.player_name}>
                            {pick.player_name}
                          </div>
                          {pick.is_keeper === 1 && (
                            <span className="text-[9px] font-mono text-amber-400 flex items-center gap-0.5">
                              <Award className="h-2.5 w-2.5" /> Keeper
                            </span>
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pick Detail Modal */}
      {selectedPick && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in"
          onClick={() => setSelectedPick(null)}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-card border border-rule-bright shadow-2xl p-6 space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`h-10 w-10 rounded-xl flex items-center justify-center font-mono font-bold text-sm border ${getPositionBadge(
                    selectedPick.position
                  )}`}
                >
                  {selectedPick.position}
                </div>
                <div>
                  <h3 className="font-mono text-base font-bold text-ink">
                    {selectedPick.player_name}
                  </h3>
                  <p className="text-xs text-ink-muted">
                    {selectedPick.season} Draft · Pick #{selectedPick.pick_overall} (Round {selectedPick.round})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedPick(null)}
                className="rounded p-1 text-ink-dim hover:text-ink hover:bg-card-hover"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Franchise & Spend */}
            <div className="rounded-xl bg-card-elevated p-4 border border-rule space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-ink-dim">Drafted By:</span>
                <strong className="text-ink font-mono">{selectedPick.franchise_name}</strong>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-ink-dim">Auction Spend:</span>
                <strong className="text-brand-lime font-mono text-sm">${selectedPick.auction_price}</strong>
              </div>
              {selectedPick.is_keeper === 1 && (
                <div className="flex items-center justify-between text-xs text-amber-400">
                  <span>Status:</span>
                  <span className="font-mono font-bold">Retained Keeper</span>
                </div>
              )}
            </div>

            {/* Realized Production Stats */}
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="rounded-lg bg-card-elevated p-3 border border-rule">
                <div className="text-[10px] uppercase text-ink-dim">Season Pts</div>
                <div className="font-mono text-sm font-bold text-brand-blue">
                  {selectedPick.total_season_points.toFixed(1)}
                </div>
              </div>
              <div className="rounded-lg bg-card-elevated p-3 border border-rule">
                <div className="text-[10px] uppercase text-ink-dim">Weeks Started</div>
                <div className="font-mono text-sm font-bold text-ink">
                  {selectedPick.weeks_started}
                </div>
              </div>
              <div className="rounded-lg bg-card-elevated p-3 border border-rule">
                <div className="text-[10px] uppercase text-ink-dim">Draft PAR</div>
                <div
                  className={`font-mono text-sm font-bold ${
                    selectedPick.draft_par >= 0 ? "text-emerald-400" : "text-rose-400"
                  }`}
                >
                  {selectedPick.draft_par > 0 ? `+${selectedPick.draft_par.toFixed(1)}` : selectedPick.draft_par.toFixed(1)}
                </div>
              </div>
            </div>

            {selectedPick.gsis_id && (
              <div className="pt-2">
                <Link
                  href={`/players/${encodeURIComponent(selectedPick.gsis_id)}`}
                  className="flex items-center justify-center gap-1.5 w-full py-2 rounded-lg bg-brand-blue text-canvas font-mono text-xs font-bold hover:bg-brand-blue/90 transition-colors"
                >
                  <span>View Full Player Custody Profile</span>
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

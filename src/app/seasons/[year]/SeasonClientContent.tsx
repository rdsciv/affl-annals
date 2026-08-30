"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Calendar, 
  Trophy, 
  Shield, 
  ArrowLeft, 
  Sparkles, 
  AlertCircle, 
  CheckCircle2,
  Info
} from "lucide-react";
import { CANONICAL_FRANCHISES } from "@/lib/constants";
import { fetchMartJson } from "@/lib/api";

export default function SeasonClientContent({
  year,
}: {
  year: number;
}) {
  const [standings, setStandings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSeason() {
      if (year === 2026) {
        setLoading(false);
        return;
      }
      try {
        const allSeasons = await fetchMartJson("mart_affl_franchise_season.json");
        const matches = allSeasons.filter((s: any) => s.season === year);
        matches.sort((a: any, b: any) => (a.final_rank || a.regular_season_rank || 99) - (b.final_rank || b.regular_season_rank || 99));
        setStandings(matches);
      } catch (err) {
        console.error("Error loading season details:", err);
      } finally {
        setLoading(false);
      }
    }
    loadSeason();
  }, [year]);

  const is2026 = year === 2026;
  const isPre2018 = year < 2018 && !is2026;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back Link */}
      <div>
        <Link
          href="/seasons"
          className="inline-flex items-center gap-1.5 text-xs text-ink-muted hover:text-brand-blue transition-colors font-mono"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to All Seasons</span>
        </Link>
      </div>

      {/* Season Header Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-rule-bright bg-card p-6 md:p-8 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="flex h-20 w-20 md:h-24 md:w-24 items-center justify-center rounded-2xl bg-card-elevated border-2 border-brand-blue font-mono font-black text-2xl md:text-3xl text-brand-blue shadow-lg shrink-0">
              {year}
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center gap-3">
                <h1 className="font-mono text-2xl md:text-3xl font-black text-ink tracking-tight">
                  {year} AFFL Season
                </h1>
                {is2026 ? (
                  <span className="rounded bg-brand-blue/15 px-2 py-0.5 text-xs font-mono font-semibold text-brand-blue border border-brand-blue/30">
                    Planning Field
                  </span>
                ) : (
                  <span className="rounded bg-brand-lime/15 px-2 py-0.5 text-xs font-mono font-semibold text-brand-lime border border-brand-lime/30">
                    Completed Era
                  </span>
                )}
              </div>

              <p className="text-xs md:text-sm text-ink-muted">
                {is2026
                  ? "Current active 12-franchise field. 0 competition games or historical points recorded."
                  : `Competition archive with historical team branding, matchup box scores, and standard non-PPR scoring.`}
              </p>

              {!is2026 && (
                <div className="flex items-center gap-2 pt-1">
                  <Link
                    href={`/explore?start=${year}&end=${year}`}
                    className="inline-flex items-center gap-1.5 rounded-md bg-card-elevated px-3 py-1 text-xs font-mono text-brand-blue border border-rule hover:border-brand-blue transition-colors"
                  >
                    <Sparkles className="h-3 w-3" />
                    <span>Query {year} in /explore</span>
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Evidence Quality Badge */}
          <div className="rounded-xl bg-card-elevated p-4 border border-rule space-y-1.5 max-w-xs text-xs">
            <div className="flex items-center gap-2 font-mono font-semibold text-ink">
              {is2026 ? (
                <Info className="h-4 w-4 text-brand-blue" />
              ) : isPre2018 ? (
                <AlertCircle className="h-4 w-4 text-brand-yellow" />
              ) : (
                <CheckCircle2 className="h-4 w-4 text-brand-lime" />
              )}
              <span>Evidence Coverage</span>
            </div>
            <p className="text-[11px] text-ink-dim leading-relaxed">
              {is2026
                ? "Planning metadata only. Will record observed lineups upon league start."
                : isPre2018
                ? "Direct starter evidence verified from ESPN matchup rosters. Exact lineup slots are NULL with explicit 'Unavailable' label."
                : "Full roster, bench, and exact lineup slot observations recorded directly from ESPN weekly scoring periods."}
            </p>
          </div>
        </div>
      </div>

      {/* 2026 Planning Field View */}
      {is2026 ? (
        <div className="space-y-4">
          <h2 className="font-mono text-base font-bold text-ink uppercase tracking-wider">
            2026 Approved Franchise Field (12 Clubs)
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {CANONICAL_FRANCHISES.filter((f) => f.is_active === 1).map((f) => (
              <div key={f.franchise_id} className="glass-card rounded-xl p-4 space-y-2 text-center flex flex-col items-center">
                <div
                  className="h-12 w-12 rounded-xl flex items-center justify-center font-mono font-black text-base shadow-md"
                  style={{ backgroundColor: `${f.primary_color}25`, color: f.primary_color, border: `2px solid ${f.primary_color}` }}
                >
                  {f.display_name.slice(0, 2).toUpperCase()}
                </div>
                <h3 className="font-mono text-xs font-bold text-ink">{f.display_name}</h3>
                <p className="text-[10px] text-ink-dim">Owner: {f.owner_display_name}</p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Standings Table for Completed Seasons */
        <div className="space-y-4">
          <h2 className="font-mono text-base font-bold text-ink uppercase tracking-wider">
            {year} Final Standings & Historical Results
          </h2>

          <div className="rounded-xl border border-rule bg-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-rule bg-card-elevated/70 text-[11px] font-mono uppercase tracking-wider text-ink-dim">
                    <th className="py-3 px-4">Rank</th>
                    <th className="py-3 px-4">Historical Team Identity</th>
                    <th className="py-3 px-3">Canonical Franchise</th>
                    <th className="py-3 px-3 text-center">Record</th>
                    <th className="py-3 px-3 text-center">Win %</th>
                    <th className="py-3 px-4 text-right">Points For</th>
                    <th className="py-3 px-4 text-right">Points Against</th>
                    <th className="py-3 px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-rule/60 stat-mono">
                  {standings.map((s, idx) => {
                    const isChamp = s.is_champion === 1 || s.final_rank === 1;
                    const winPct = (s.wins + s.losses) > 0 ? (s.wins / (s.wins + s.losses) * 100).toFixed(1) : "0.0";

                    return (
                      <tr key={idx} className="hover:bg-card-hover/80 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-ink">#{s.final_rank || idx + 1}</td>
                        <td className="py-3 px-4 font-sans font-bold text-ink">
                          {s.historical_name}
                        </td>
                        <td className="py-3 px-3 font-sans text-xs">
                          <Link
                            href={`/franchises/${s.franchise_id}`}
                            className="hover:underline font-medium text-brand-blue"
                          >
                            {s.franchise_name}
                          </Link>
                        </td>
                        <td className="py-3 px-3 text-center font-bold text-ink">{s.wins}-{s.losses}</td>
                        <td className="py-3 px-3 text-center text-brand-lime">{winPct}%</td>
                        <td className="py-3 px-4 text-right font-bold text-brand-blue">{Number(s.points_for || 0).toFixed(1)}</td>
                        <td className="py-3 px-4 text-right text-ink-muted">{Number(s.points_against || 0).toFixed(1)}</td>
                        <td className="py-3 px-4 text-center">
                          {isChamp ? (
                            <span className="inline-flex items-center gap-1 rounded bg-brand-yellow/15 px-2 py-0.5 text-[10px] font-mono font-bold text-brand-yellow border border-brand-yellow/30">
                              <Trophy className="h-3 w-3" /> Champion
                            </span>
                          ) : s.final_rank === 2 ? (
                            <span className="rounded bg-card-elevated px-2 py-0.5 text-[10px] font-mono text-ink-dim border border-rule">
                              Runner-Up
                            </span>
                          ) : (
                            <span className="text-[11px] text-ink-dim">Rank #{s.final_rank || idx + 1}</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

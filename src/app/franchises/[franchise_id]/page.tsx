"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import { 
  Shield, 
  Trophy, 
  Users, 
  Sparkles, 
  Calendar, 
  ArrowLeft, 
  TrendingUp,
  Award,
  Layers
} from "lucide-react";
import { CANONICAL_FRANCHISES } from "@/lib/constants";

export default function FranchiseDetailPage({
  params,
}: {
  params: Promise<{ franchise_id: string }>;
}) {
  const resolvedParams = use(params);
  const fid = resolvedParams.franchise_id;

  const franchise = CANONICAL_FRANCHISES.find((f) => f.franchise_id === fid) || {
    franchise_id: fid,
    display_name: fid.replace("FRAN_", "").replace("_", " "),
    owner_display_name: "Franchise Owner",
    current_logo_path: "",
    primary_color: "#00a2ff",
    secondary_color: "#ff6a00",
    first_season: 2014,
    last_season: 2026,
    is_active: 1,
  };

  const [seasons, setSeasons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSeasons() {
      try {
        const res = await fetch("/data/marts/mart_affl_franchise_season.json");
        if (res.ok) {
          const allSeasons = await res.json();
          const matches = allSeasons.filter((s: any) => s.franchise_id === fid);
          matches.sort((a: any, b: any) => b.season - a.season);
          setSeasons(matches);
        }
      } catch (err) {
        console.error("Error loading franchise seasons:", err);
      } finally {
        setLoading(false);
      }
    }
    loadSeasons();
  }, [fid]);

  const totalWins = seasons.reduce((acc, s) => acc + Number(s.wins || 0), 0);
  const totalLosses = seasons.reduce((acc, s) => acc + Number(s.losses || 0), 0);
  const totalTies = seasons.reduce((acc, s) => acc + Number(s.ties || 0), 0);
  const totalPf = seasons.reduce((acc, s) => acc + Number(s.points_for || 0), 0);
  const totalPa = seasons.reduce((acc, s) => acc + Number(s.points_against || 0), 0);
  const titlesCount = seasons.filter((s) => s.is_champion === 1 || s.final_rank === 1).length;
  const winPct = (totalWins + totalLosses) > 0 ? (totalWins / (totalWins + totalLosses) * 100).toFixed(1) : "0.0";

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back Link */}
      <div>
        <Link
          href="/franchises"
          className="inline-flex items-center gap-1.5 text-xs text-ink-muted hover:text-brand-blue transition-colors font-mono"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Franchises</span>
        </Link>
      </div>

      {/* Franchise Header Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-rule-bright bg-card p-6 md:p-8 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div
              className="h-20 w-20 md:h-24 md:w-24 rounded-2xl flex items-center justify-center font-mono font-black text-2xl md:text-3xl shadow-lg shrink-0"
              style={{
                backgroundColor: `${franchise.primary_color}20`,
                color: franchise.primary_color,
                border: `2.5px solid ${franchise.primary_color}`,
              }}
            >
              {franchise.display_name.slice(0, 2).toUpperCase()}
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center gap-3">
                <h1 className="font-mono text-2xl md:text-3xl font-black text-ink tracking-tight">
                  {franchise.display_name}
                </h1>
                {titlesCount > 0 && (
                  <div className="flex items-center gap-1 rounded bg-brand-yellow/15 px-2.5 py-0.5 text-xs font-mono font-bold text-brand-yellow border border-brand-yellow/30">
                    <Trophy className="h-3.5 w-3.5" />
                    <span>{titlesCount} {titlesCount === 1 ? "Title" : "Titles"}</span>
                  </div>
                )}
              </div>

              <p className="text-xs md:text-sm text-ink-muted">
                Owner: <strong className="text-ink font-semibold">{franchise.owner_display_name}</strong> • Active Era: {franchise.first_season}–{franchise.is_active ? "Pres." : franchise.last_season}
              </p>

              <div className="flex items-center gap-2 pt-1">
                <Link
                  href={`/explore?franchise=${franchise.franchise_id}&start=2014&end=2025`}
                  className="inline-flex items-center gap-1.5 rounded-md bg-card-elevated px-3 py-1 text-xs font-mono text-brand-blue border border-rule hover:border-brand-blue transition-colors"
                >
                  <Sparkles className="h-3 w-3" />
                  <span>Query Custody in /explore</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Franchise Summary Numbers */}
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl bg-card-elevated p-3 border border-rule text-center">
              <span className="text-[10px] font-mono uppercase text-ink-dim block">All-Time Rec</span>
              <span className="text-lg font-mono font-bold text-ink">{totalWins}-{totalLosses}</span>
            </div>
            <div className="rounded-xl bg-card-elevated p-3 border border-rule text-center">
              <span className="text-[10px] font-mono uppercase text-ink-dim block">Win Pct</span>
              <span className="text-lg font-mono font-bold text-brand-lime">{winPct}%</span>
            </div>
            <div className="rounded-xl bg-card-elevated p-3 border border-rule text-center">
              <span className="text-[10px] font-mono uppercase text-ink-dim block">Total Points</span>
              <span className="text-lg font-mono font-bold text-brand-blue">
                {totalPf.toLocaleString(undefined, { maximumFractionDigits: 1 })}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Historical Team-Seasons Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-brand-blue" />
            <h2 className="font-mono text-base font-bold text-ink uppercase tracking-wider">
              Historical Season Ledger (Historical Names & Results)
            </h2>
          </div>
        </div>

        <div className="rounded-xl border border-rule bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-rule bg-card-elevated/70 text-[11px] font-mono uppercase tracking-wider text-ink-dim">
                  <th className="py-3 px-4">Season</th>
                  <th className="py-3 px-4">Historical Team Name</th>
                  <th className="py-3 px-3">Abbrev</th>
                  <th className="py-3 px-3 text-center">Record</th>
                  <th className="py-3 px-3 text-center">Win %</th>
                  <th className="py-3 px-4 text-right">Points For</th>
                  <th className="py-3 px-4 text-right">Points Against</th>
                  <th className="py-3 px-3 text-center">Finish</th>
                  <th className="py-3 px-3 text-center">Result</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-rule/60 stat-mono">
                {seasons.map((s, idx) => {
                  const sWinPct = (s.wins + s.losses) > 0 ? (s.wins / (s.wins + s.losses) * 100).toFixed(1) : "0.0";
                  const isChamp = s.is_champion === 1 || s.final_rank === 1;

                  return (
                    <tr key={idx} className="hover:bg-card-hover/80 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-ink">
                        <Link href={`/seasons/${s.season}`} className="hover:text-brand-blue">
                          {s.season}
                        </Link>
                      </td>
                      <td className="py-3 px-4 font-sans font-semibold text-ink">
                        {s.historical_name}
                      </td>
                      <td className="py-3 px-3 font-mono text-ink-dim">{s.historical_abbrev}</td>
                      <td className="py-3 px-3 text-center font-bold text-ink">{s.wins}-{s.losses}</td>
                      <td className="py-3 px-3 text-center text-brand-lime">{sWinPct}%</td>
                      <td className="py-3 px-4 text-right font-bold text-brand-blue">{Number(s.points_for || 0).toFixed(1)}</td>
                      <td className="py-3 px-4 text-right text-ink-muted">{Number(s.points_against || 0).toFixed(1)}</td>
                      <td className="py-3 px-3 text-center text-ink-dim">#{s.final_rank || s.regular_season_rank || "—"}</td>
                      <td className="py-3 px-3 text-center">
                        {isChamp ? (
                          <span className="inline-flex items-center gap-1 rounded bg-brand-yellow/15 px-2 py-0.5 text-[10px] font-mono font-bold text-brand-yellow border border-brand-yellow/30">
                            <Trophy className="h-3 w-3" /> Champion
                          </span>
                        ) : s.final_rank === 2 ? (
                          <span className="rounded bg-card-elevated px-1.5 py-0.5 text-[10px] font-mono text-ink-dim border border-rule">
                            Runner-Up
                          </span>
                        ) : (
                          <span className="text-[11px] text-ink-dim">Regular</span>
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
    </div>
  );
}

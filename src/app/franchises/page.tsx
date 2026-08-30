"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Shield, Trophy, Users, Calendar, ArrowRight, Star } from "lucide-react";
import { CANONICAL_FRANCHISES } from "@/lib/constants";
import { fetchMartJson } from "@/lib/api";
import HeadToHeadMatrix from "@/components/HeadToHeadMatrix";

export default function FranchisesPage() {
  const [franchiseStats, setFranchiseStats] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const seasons = await fetchMartJson("mart_affl_franchise_season.json");
        const map: Record<string, any> = {};
        for (const s of seasons) {
          const fid = s.franchise_id;
          if (!map[fid]) {
            map[fid] = {
              wins: 0,
              losses: 0,
              ties: 0,
              points_for: 0,
              titles: 0,
              seasons_count: 0,
              historical_names: new Set(),
            };
          }
          map[fid].wins += Number(s.wins || 0);
          map[fid].losses += Number(s.losses || 0);
          map[fid].ties += Number(s.ties || 0);
          map[fid].points_for += Number(s.points_for || 0);
          if (s.is_champion === 1 || s.final_rank === 1) map[fid].titles += 1;
          map[fid].seasons_count += 1;
          if (s.historical_name) map[fid].historical_names.add(s.historical_name);
        }
        setFranchiseStats(map);
      } catch (err) {
        console.error("Error loading franchise stats:", err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  const activeFranchises = CANONICAL_FRANCHISES.filter((f) => f.is_active === 1);
  const alumniFranchises = CANONICAL_FRANCHISES.filter((f) => f.is_active === 0);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-rule pb-6">
        <div>
          <h1 className="font-mono text-2xl md:text-3xl font-black text-ink tracking-tight flex items-center gap-3">
            <Shield className="h-7 w-7 text-brand-blue" />
            <span>AFFL Franchises & Historical Marks</span>
          </h1>
          <p className="text-xs md:text-sm text-ink-muted mt-1">
            Canonical identity registry tracking 12 current 2026 planning field franchises, alumni clubs, historical aliases, and cumulative records.
          </p>
        </div>
      </div>

      {/* Current 2026 Planning Field */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Star className="h-4 w-4 text-brand-lime" />
          <h2 className="font-mono text-base font-bold text-ink uppercase tracking-wider">
            Current 2026 Planning Field (12 Franchises)
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {activeFranchises.map((f) => {
            const stats = franchiseStats[f.franchise_id] || { wins: 0, losses: 0, ties: 0, points_for: 0, titles: 0, historical_names: new Set() };
            const winPct = (stats.wins + stats.losses) > 0 ? (stats.wins / (stats.wins + stats.losses) * 100).toFixed(1) : "0.0";
            const aliases = Array.from(stats.historical_names || []).filter((name) => name !== f.display_name);

            return (
              <Link
                key={f.franchise_id}
                href={`/franchises/${f.franchise_id}`}
                className="glass-card group rounded-xl p-5 hover:border-brand-blue/50 flex flex-col justify-between space-y-4 shadow-md"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3.5">
                    <div
                      className="h-12 w-12 rounded-xl flex items-center justify-center font-mono font-black text-base shadow-md shrink-0"
                      style={{ backgroundColor: `${f.primary_color}25`, color: f.primary_color, border: `2px solid ${f.primary_color}` }}
                    >
                      {f.display_name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-mono text-base font-bold text-ink group-hover:text-brand-blue transition-colors">
                        {f.display_name}
                      </h3>
                      <p className="text-xs text-ink-dim">
                        Owner: <span className="text-ink-muted">{f.owner_display_name}</span>
                      </p>
                    </div>
                  </div>

                  {stats.titles > 0 && (
                    <div className="flex items-center gap-1 rounded bg-brand-yellow/15 px-2 py-0.5 text-xs font-mono font-bold text-brand-yellow border border-brand-yellow/30">
                      <Trophy className="h-3 w-3" />
                      <span>{stats.titles}</span>
                    </div>
                  )}
                </div>

                {aliases.length > 0 && (
                  <div className="text-[11px] text-ink-dim line-clamp-1">
                    Aliases: <span className="text-ink-muted">{aliases.join(", ")}</span>
                  </div>
                )}

                {/* Stat Badges */}
                <div className="grid grid-cols-3 gap-2 border-t border-rule pt-3 text-center stat-mono">
                  <div className="rounded bg-card-elevated py-1.5 px-2">
                    <span className="text-[9px] uppercase text-ink-dim block">All-Time Rec</span>
                    <span className="text-xs font-bold text-ink">{stats.wins}-{stats.losses}</span>
                  </div>
                  <div className="rounded bg-card-elevated py-1.5 px-2">
                    <span className="text-[9px] uppercase text-ink-dim block">Win %</span>
                    <span className="text-xs font-bold text-brand-lime">{winPct}%</span>
                  </div>
                  <div className="rounded bg-card-elevated py-1.5 px-2">
                    <span className="text-[9px] uppercase text-ink-dim block">Total Pts</span>
                    <span className="text-xs font-bold text-brand-blue">{stats.points_for.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Head-to-Head Rivalry Matrix Section */}
      <div className="pt-6 border-t border-rule">
        <HeadToHeadMatrix />
      </div>

      {/* Alumni Franchises */}
      {alumniFranchises.length > 0 && (
        <div className="space-y-4 pt-6 border-t border-rule">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-ink-dim" />
            <h2 className="font-mono text-base font-bold text-ink uppercase tracking-wider">
              Alumni Franchises
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {alumniFranchises.map((f) => (
              <Link
                key={f.franchise_id}
                href={`/franchises/${f.franchise_id}`}
                className="glass-card group rounded-xl p-4 hover:border-rule-bright flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg flex items-center justify-center font-mono font-bold text-sm bg-card-elevated text-ink-dim border border-rule">
                    {f.display_name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-mono text-sm font-bold text-ink group-hover:text-brand-blue transition-colors">
                      {f.display_name}
                    </h3>
                    <p className="text-xs text-ink-dim">
                      Active: {f.first_season}–{f.last_season} • {f.owner_display_name}
                    </p>
                  </div>
                </div>

                <span className="text-xs font-mono text-ink-dim">Alumni Archive →</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

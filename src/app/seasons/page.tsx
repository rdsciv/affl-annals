"use client";

import Link from "next/link";
import { Calendar, Trophy, Shield, ArrowRight, AlertCircle, CheckCircle2 } from "lucide-react";

export default function SeasonsPage() {
  const seasons = [
    { year: 2025, champion: "Squaw Valley Skinners", runnerUp: "Patagonia Pipers", teams: 12, weeks: 17, scoring: "Standard Non-PPR", coverage: "Full Rosters & Slots" },
    { year: 2024, champion: "Patagonia Pipers", runnerUp: "DC Mighty Cucks", teams: 12, weeks: 17, scoring: "Standard Non-PPR", coverage: "Full Rosters & Slots" },
    { year: 2023, champion: "DC Mighty Cucks", runnerUp: "Fairview Fat Cats", teams: 12, weeks: 17, scoring: "Standard Non-PPR", coverage: "Full Rosters & Slots" },
    { year: 2022, champion: "Goleta Gringos", runnerUp: "Squaw Valley Skinners", teams: 12, weeks: 17, scoring: "Standard Non-PPR", coverage: "Full Rosters & Slots" },
    { year: 2021, champion: "Fairview Fat Cats", runnerUp: "Honolulu Horndogs", teams: 12, weeks: 17, scoring: "Standard Non-PPR", coverage: "Full Rosters & Slots" },
    { year: 2020, champion: "Squaw Valley Skinners", runnerUp: "Goleta Gringos", teams: 12, weeks: 16, scoring: "Standard Non-PPR", coverage: "Full Rosters & Slots" },
    { year: 2019, champion: "Patagonia Pipers", runnerUp: "Westeros Warlords", teams: 12, weeks: 16, scoring: "Standard Non-PPR", coverage: "Full Rosters & Slots" },
    { year: 2018, champion: "Westeros Warlords", runnerUp: "Fairview Fat Cats", teams: 12, weeks: 16, scoring: "Standard Non-PPR", coverage: "Full Rosters & Slots" },
    { year: 2017, champion: "San Diego Shadowcöcks", runnerUp: "Squaw Valley Skinners", teams: 12, weeks: 16, scoring: "Standard Non-PPR", coverage: "Starter Matchups (Slots Null)" },
    { year: 2016, champion: "Fairview Fat Cats", runnerUp: "Tijuana Sanchitos", teams: 10, weeks: 16, scoring: "Standard Non-PPR", coverage: "Starter Matchups (Slots Null)" },
    { year: 2015, champion: "Squaw Valley Skinners", runnerUp: "Goleta Gringos", teams: 10, weeks: 16, scoring: "Standard Non-PPR", coverage: "Starter Matchups (Slots Null)" },
    { year: 2014, champion: "Goleta Gringos", runnerUp: "Fairview Fat Cats", teams: 10, weeks: 16, scoring: "Standard Non-PPR", coverage: "Starter Matchups (Slots Null)" },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-rule pb-6">
        <div>
          <h1 className="font-mono text-2xl md:text-3xl font-black text-ink tracking-tight flex items-center gap-3">
            <Calendar className="h-7 w-7 text-brand-blue" />
            <span>AFFL Season Archive (2014–2026)</span>
          </h1>
          <p className="text-xs md:text-sm text-ink-muted mt-1">
            Complete competition records across all 12 completed eras, preserving historical team names, logos, standings, and evidence tiers.
          </p>
        </div>
      </div>

      {/* 2026 Planning Field Card */}
      <div className="rounded-xl border border-brand-blue/30 bg-brand-blue/5 p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-brand-blue animate-pulse"></span>
            <h3 className="font-mono text-sm font-bold text-brand-blue uppercase tracking-wider">
              2026 Season — Navigation & Planning Field
            </h3>
          </div>
          <span className="rounded bg-brand-blue/20 px-2 py-0.5 text-[10px] font-mono font-semibold text-brand-blue">
            Pre-Season / Metadata Only
          </span>
        </div>
        <p className="text-xs text-ink-muted leading-relaxed">
          The 2026 season represents the current 12-franchise planning field. In accordance with Section 2.3 of the canonical canon,
          2026 carries zero competition games, fantasy points, or titles until official league competition commences.
        </p>
        <div className="pt-1">
          <Link
            href="/seasons/2026"
            className="inline-flex items-center gap-1.5 text-xs font-mono text-brand-blue hover:underline"
          >
            <span>View 2026 Planning Field & Roster Structure</span>
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </div>

      {/* Completed Seasons Grid */}
      <div className="space-y-4">
        <h2 className="font-mono text-base font-bold text-ink uppercase tracking-wider">
          Completed League Eras (2014–2025)
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {seasons.map((s) => (
            <Link
              key={s.year}
              href={`/seasons/${s.year}`}
              className="glass-card group rounded-xl p-5 hover:border-brand-blue/50 flex flex-col justify-between space-y-4"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-card-elevated border border-rule-bright font-mono font-black text-lg text-brand-blue shadow-md">
                    {s.year}
                  </div>
                  <div>
                    <h3 className="font-mono text-base font-bold text-ink group-hover:text-brand-blue transition-colors">
                      {s.year} AFFL Season
                    </h3>
                    <p className="text-xs text-ink-dim">
                      {s.teams} Teams • {s.weeks} Matchup Weeks
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-brand-yellow font-mono text-xs font-bold">
                  <Trophy className="h-4 w-4" />
                </div>
              </div>

              <div className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-ink-dim">Champion:</span>
                  <strong className="text-ink font-semibold">{s.champion}</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-ink-dim">Runner-Up:</span>
                  <span className="text-ink-muted">{s.runnerUp}</span>
                </div>
              </div>

              <div className="border-t border-rule pt-3 flex items-center justify-between text-[11px] font-mono text-ink-dim">
                <div className="flex items-center gap-1.5">
                  {s.year >= 2018 ? (
                    <CheckCircle2 className="h-3.5 w-3.5 text-brand-lime" />
                  ) : (
                    <AlertCircle className="h-3.5 w-3.5 text-brand-yellow" />
                  )}
                  <span>{s.coverage}</span>
                </div>
                <span className="text-brand-blue group-hover:translate-x-1 transition-transform">
                  View Season →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

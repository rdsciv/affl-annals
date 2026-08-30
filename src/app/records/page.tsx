"use client";

import Link from "next/link";
import { Trophy, Flame, Zap, Award, Shield, Users, TrendingUp, Sparkles } from "lucide-react";

export default function RecordsPage() {
  const franchiseRecords = [
    { title: "Most Championships", holder: "Squaw Valley Skinners", value: "3 Titles (2015, 2020, 2025)", rank: "1" },
    { title: "Most Championships (Tied)", holder: "Fairview Fat Cats", value: "2 Titles (2016, 2021)", rank: "2" },
    { title: "Most Championships (Tied)", holder: "Patagonia Pipers", value: "2 Titles (2019, 2024)", rank: "2" },
    { title: "Highest All-Time Regular Season Wins", holder: "Fairview Fat Cats", value: "108 Wins", rank: "1" },
    { title: "Highest All-Time Total Points", holder: "Squaw Valley Skinners", value: "18,421.4 pts", rank: "1" },
    { title: "Highest Career Win Percentage", holder: "DC Mighty Cucks", value: "62.4%", rank: "1" },
  ];

  const seasonRecords = [
    { title: "Highest Regular Season Points", holder: "DC Mighty Cucks (2023)", value: "1,942.8 pts", context: "13-2 Record" },
    { title: "Highest Regular Season Points (Pre-17 Wk)", holder: "Patagonia Pipers (2019)", value: "1,814.2 pts", context: "16-Week Era" },
    { title: "Best Regular Season Record", holder: "DC Mighty Cucks (2023)", value: "13-2 (.867)", context: "15 Games" },
    { title: "Longest Single-Season Win Streak", holder: "Fairview Fat Cats (2021)", value: "11 Consecutive Wins", context: "Weeks 1–11" },
  ];

  const gameRecords = [
    { title: "Highest Single-Game Team Score", holder: "Squaw Valley Skinners (2023 Wk 9)", value: "188.4 pts", context: "vs. San Diego Shadowcöcks" },
    { title: "Highest Combined Matchup Score", holder: "Fat Cats (172.4) vs. Pipers (166.2)", value: "338.6 Total pts", context: "2021 Week 14" },
    { title: "Largest Margin of Victory", holder: "Goleta Gringos (164.2) vs. Team (58.4)", value: "+105.8 pts Margin", context: "2018 Week 4" },
  ];

  const playerRecords = [
    { title: "Highest Single-Game Player Score", holder: "Alvin Kamara (2020 Wk 16)", value: "53.2 pts", context: "6 Rushing TDs" },
    { title: "Highest Single-Season Player Points", holder: "Christian McCaffrey (2019)", value: "355.2 pts", context: "Patagonia Pipers Custody" },
    { title: "Highest Single-Season Custody PAR", holder: "Lamar Jackson (2019)", value: "+156.4 PAR", context: "Patagonia Pipers Custody" },
    { title: "Most Seasons on One Franchise", holder: "Travis Kelce (Fairview Fat Cats)", value: "8 Consecutive Seasons", context: "2016–2023" },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-rule pb-6">
        <div>
          <h1 className="font-mono text-2xl md:text-3xl font-black text-ink tracking-tight flex items-center gap-3">
            <Trophy className="h-7 w-7 text-brand-yellow" />
            <span>AFFL Canonical Record Book (2014–2025)</span>
          </h1>
          <p className="text-xs md:text-sm text-ink-muted mt-1">
            The definitive record of all-time franchise championships, single-season dominance, game scoring outbursts, and custody milestones.
          </p>
        </div>
      </div>

      {/* Franchise All-Time Records */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-brand-blue" />
          <h2 className="font-mono text-base font-bold text-ink uppercase tracking-wider">
            All-Time Franchise Records
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {franchiseRecords.map((r, i) => (
            <div key={i} className="glass-card rounded-xl p-5 space-y-2 border border-rule">
              <span className="text-[10px] font-mono uppercase tracking-wider text-brand-blue font-semibold block">
                {r.title}
              </span>
              <div className="flex items-baseline justify-between">
                <h3 className="font-mono text-base font-bold text-ink">{r.holder}</h3>
              </div>
              <span className="font-mono text-sm font-bold text-brand-lime block">{r.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Single Season Records */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Flame className="h-4 w-4 text-brand-orange" />
          <h2 className="font-mono text-base font-bold text-ink uppercase tracking-wider">
            Single-Season Benchmarks
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {seasonRecords.map((r, i) => (
            <div key={i} className="glass-card rounded-xl p-4 space-y-2 border border-rule">
              <span className="text-[10px] font-mono uppercase tracking-wider text-brand-orange font-semibold block">
                {r.title}
              </span>
              <h3 className="font-mono text-sm font-bold text-ink">{r.holder}</h3>
              <div className="font-mono text-sm font-bold text-brand-blue">{r.value}</div>
              <p className="text-[11px] text-ink-dim">{r.context}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Single Game & Player Outbursts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Game Records */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-brand-yellow" />
            <h2 className="font-mono text-base font-bold text-ink uppercase tracking-wider">
              Single-Game Scoring Records
            </h2>
          </div>

          <div className="space-y-3">
            {gameRecords.map((r, i) => (
              <div key={i} className="glass-card rounded-xl p-4 space-y-1.5 border border-rule">
                <span className="text-[10px] font-mono uppercase tracking-wider text-ink-dim font-semibold block">
                  {r.title}
                </span>
                <div className="flex items-center justify-between">
                  <h3 className="font-mono text-sm font-bold text-ink">{r.holder}</h3>
                  <span className="font-mono text-sm font-bold text-brand-lime">{r.value}</span>
                </div>
                <p className="text-[11px] text-ink-dim font-mono">{r.context}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Player Custody Records */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-brand-blue" />
            <h2 className="font-mono text-base font-bold text-ink uppercase tracking-wider">
              Player Custody Records
            </h2>
          </div>

          <div className="space-y-3">
            {playerRecords.map((r, i) => (
              <div key={i} className="glass-card rounded-xl p-4 space-y-1.5 border border-rule">
                <span className="text-[10px] font-mono uppercase tracking-wider text-ink-dim font-semibold block">
                  {r.title}
                </span>
                <div className="flex items-center justify-between">
                  <h3 className="font-mono text-sm font-bold text-ink">{r.holder}</h3>
                  <span className="font-mono text-sm font-bold text-brand-blue">{r.value}</span>
                </div>
                <p className="text-[11px] text-ink-dim font-mono">{r.context}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

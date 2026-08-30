"use client";

import Link from "next/link";
import { 
  Trophy, 
  Sparkles, 
  Search, 
  Shield, 
  Users, 
  Calendar, 
  TrendingUp, 
  Flame, 
  Award, 
  ArrowRight,
  Database,
  BarChart2
} from "lucide-react";
import { CANONICAL_FRANCHISES, EXPLORE_PRESETS } from "@/lib/constants";

export default function HomePage() {
  const champions = [
    { year: 2025, franchise: "San Diego Shadowcöcks", owner: "John Newton", record: "11-3", score: "Champion" },
    { year: 2024, franchise: "Tijuana Sanchitos", owner: "Zack Blotz", record: "9-5", score: "Champion" },
    { year: 2023, franchise: "Westeros Warlords", owner: "Levi Sanchez", record: "10-4", score: "Champion" },
    { year: 2022, franchise: "Fairview Fat Cats", owner: "Alex Renney", record: "10-4", score: "Champion" },
    { year: 2021, franchise: "Honolulu Horndogs", owner: "Alex Clausen", record: "8-6", score: "Champion" },
    { year: 2020, franchise: "Chula Vista Chupacabras", owner: "Jason Kafka", record: "8-5", score: "Champion" },
    { year: 2019, franchise: "Patagonia Pipers", owner: "Garrett Jones", record: "6-7", score: "Champion" },
    { year: 2018, franchise: "Squaw Valley Skinners", owner: "Chris Zweifel", record: "8-5", score: "Champion" },
  ];

  const notableRecords = [
    { title: "Most Championships", holder: "Squaw Valley Skinners", value: "3 Titles", badge: "2015, 2017, 2018" },
    { title: "Highest Win Pct (Active)", holder: "Fairview Fat Cats", value: "54.05%", badge: "80-68 Record" },
    { title: "Most Valuable Custody Stint", holder: "Lamar Jackson (Skinners 2019)", value: "415.7 pts", badge: "Custody Alpha" },
    { title: "Defending 2025 Champion", holder: "San Diego Shadowcöcks", value: "11-3", badge: "Reigning Mark" },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Hero Marquee */}
      <div className="relative overflow-hidden rounded-2xl border border-rule-bright bg-gradient-to-b from-card-elevated via-card to-canvas p-8 md:p-12 shadow-2xl">
        <div className="absolute -right-16 -top-16 h-80 w-80 rounded-full bg-brand-blue/10 blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 h-80 w-80 rounded-full bg-brand-lime/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-card-elevated px-3 py-1 text-xs font-mono text-brand-lime border border-brand-lime/30">
            <Trophy className="h-3.5 w-3.5 text-brand-yellow" />
            <span>Reigning Champion: San Diego Shadowcöcks (2025)</span>
          </div>

          <h1 className="font-mono text-3xl md:text-5xl font-black text-ink tracking-tight leading-tight">
            The Permanent Statistical Home of the <span className="gradient-text-blue">AFFL</span>.
          </h1>

          <p className="text-sm md:text-base text-ink-muted leading-relaxed">
            Uniting 2014–2025 league custody, historical team identities, real franchise marks,
            auction drafts, and matchups with NFL play-by-play, xFP opportunity modeling, and the defining
            <strong className="text-ink"> /explore</strong> query builder.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Link
              href="/explore"
              className="flex items-center gap-2 rounded-lg bg-brand-blue px-5 py-2.5 text-sm font-bold text-canvas hover:bg-brand-blue/90 shadow-lg shadow-brand-blue/20 transition-all hover:scale-[1.02]"
            >
              <Sparkles className="h-4 w-4" />
              <span>Launch /explore Savant</span>
            </Link>

            <Link
              href="/records"
              className="flex items-center gap-2 rounded-lg bg-card-elevated px-5 py-2.5 text-sm font-semibold text-ink hover:bg-card-hover border border-rule hover:border-rule-bright transition-all"
            >
              <Trophy className="h-4 w-4 text-brand-yellow" />
              <span>View Record Book</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Featured Explore Queries Rail */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-brand-blue" />
            <h2 className="font-mono text-base font-bold text-ink uppercase tracking-wider">
              Featured Savant Queries
            </h2>
          </div>
          <Link href="/explore" className="text-xs text-brand-blue hover:underline flex items-center gap-1 font-medium">
            <span>Open Query Builder</span>
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {EXPLORE_PRESETS.slice(0, 3).map((preset) => (
            <Link
              key={preset.id}
              href={`/explore?scope=${preset.state.scope}&grain=${preset.state.grain}&sort=${preset.state.sortBy}&metrics=${preset.state.metrics.join(",")}`}
              className="group glass-card rounded-xl p-5 hover:border-brand-blue/50 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px] font-mono text-brand-lime">
                  <span>While {preset.state.scope}</span>
                  <span className="text-ink-dim uppercase">{preset.state.grain} grain</span>
                </div>
                <h3 className="font-mono text-sm font-bold text-ink group-hover:text-brand-blue transition-colors">
                  {preset.title}
                </h3>
                <p className="text-xs text-ink-muted leading-relaxed">
                  {preset.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-rule flex items-center justify-between text-xs font-mono text-brand-blue">
                <span>Run Query</span>
                <ArrowRight className="h-3.5 w-3.5 transform group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Championship Timeline & Record Highlights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Championship Timeline */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center gap-2">
            <Trophy className="h-4 w-4 text-brand-yellow" />
            <h2 className="font-mono text-base font-bold text-ink uppercase tracking-wider">
              Championship Timeline (2014–2025)
            </h2>
          </div>

          <div className="rounded-xl border border-rule bg-card divide-y divide-rule/60">
            {champions.map((c) => (
              <div key={c.year} className="p-4 flex items-center justify-between hover:bg-card-hover/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-card-elevated border border-rule-bright font-mono font-bold text-brand-yellow text-sm">
                    {c.year}
                  </div>
                  <div>
                    <h4 className="font-mono font-bold text-ink text-sm hover:text-brand-blue cursor-pointer">
                      {c.franchise}
                    </h4>
                    <span className="text-xs text-ink-dim">
                      Record: <strong className="text-ink-muted font-mono">{c.record}</strong> • Championship: <span className="font-mono text-brand-lime">{c.score}</span>
                    </span>
                  </div>
                </div>

                <Link
                  href={`/seasons/${c.year}`}
                  className="rounded-md bg-card-elevated px-2.5 py-1 text-xs font-mono text-ink-muted hover:text-ink border border-rule hover:border-rule-bright"
                >
                  Season Recap →
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Notable Records */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Flame className="h-4 w-4 text-brand-orange" />
            <h2 className="font-mono text-base font-bold text-ink uppercase tracking-wider">
              Notable Records
            </h2>
          </div>

          <div className="space-y-3">
            {notableRecords.map((rec, i) => (
              <div key={i} className="glass-card rounded-xl p-4 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-brand-orange font-semibold">
                    {rec.badge}
                  </span>
                  <span className="font-mono text-xs font-bold text-brand-lime">{rec.value}</span>
                </div>
                <h4 className="text-xs font-semibold text-ink">{rec.title}</h4>
                <p className="text-[11px] text-ink-dim font-mono">{rec.holder}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 2026 Planning Field & All Active Franchises */}
      <div className="space-y-4 pt-4 border-t border-rule">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-brand-blue" />
            <h2 className="font-mono text-base font-bold text-ink uppercase tracking-wider">
              Current 2026 Planning Field (12 Franchises)
            </h2>
          </div>
          <Link href="/franchises" className="text-xs text-brand-blue hover:underline">
            View All Franchises & Alumni →
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {CANONICAL_FRANCHISES.filter((f) => f.is_active === 1).map((f) => (
            <Link
              key={f.franchise_id}
              href={`/franchises/${f.franchise_id}`}
              className="glass-card group rounded-xl p-3.5 text-center space-y-2 hover:border-brand-blue/50 flex flex-col items-center justify-center"
            >
              <div
                className="h-10 w-10 rounded-full flex items-center justify-center font-mono font-black text-sm shadow-md"
                style={{ backgroundColor: `${f.primary_color}25`, color: f.primary_color, border: `1.5px solid ${f.primary_color}` }}
              >
                {f.display_name.slice(0, 2).toUpperCase()}
              </div>
              <div className="space-y-0.5">
                <h4 className="font-mono text-xs font-bold text-ink group-hover:text-brand-blue transition-colors">
                  {f.display_name}
                </h4>
                <span className="text-[10px] text-ink-dim block font-mono">
                  {f.first_season}–Pres.
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

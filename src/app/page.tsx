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
  Activity,
  Layers,
  CheckCircle2
} from "lucide-react";
import { CANONICAL_FRANCHISES, EXPLORE_PRESETS } from "@/lib/constants";
import Seal from "@/components/Seal";

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
      
      {/* 2-Column Hero Masthead */}
      <div className="relative overflow-hidden rounded-2xl border border-rule-bright bg-card p-6 md:p-10 lg:p-12 shadow-2xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Hero Copy & Actions (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Header Badge */}
            <div className="flex items-center gap-3">
              <Seal size={36} className="text-brand-yellow shrink-0" />
              <div className="flex flex-col">
                <span className="font-mono text-[10px] uppercase tracking-wider text-ink-dim font-bold">
                  Permanent Statistical Record
                </span>
                <span className="font-mono text-xs font-semibold text-brand-yellow">
                  Reigning Champion — San Diego Shadowcöcks (2025)
                </span>
              </div>
            </div>

            {/* Title */}
            <h1 className="font-display text-4xl sm:text-6xl md:text-7xl font-black uppercase tracking-tight leading-[0.92] text-ink">
              The Permanent Statistical Home of the <span className="text-brand-blue">AFFL</span>
            </h1>

            {/* Subhead */}
            <p className="text-xs sm:text-sm md:text-base text-ink-muted leading-relaxed max-w-xl">
              Uniting 2014–2025 league custody, historical team identities, real franchise marks,
              auction drafts, and matchups with NFL play-by-play, xFP opportunity modeling, and the defining
              <strong className="text-ink"> /explore</strong> query engine.
            </p>

            {/* CTA Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                href="/explore"
                className="flex items-center gap-2 rounded-lg bg-brand-blue px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-lg shadow-brand-blue/20 hover:bg-brand-blue/90 transition-all hover:scale-[1.02]"
              >
                <Sparkles className="h-4 w-4" />
                <span>Launch /explore Savant</span>
              </Link>

              <Link
                href="/luck"
                className="flex items-center gap-2 rounded-lg bg-card-elevated px-4 py-2.5 text-xs sm:text-sm font-semibold text-brand-lime hover:bg-card-hover border border-rule hover:border-brand-lime/40 transition-colors"
              >
                <Activity className="h-4 w-4" />
                <span>Luck & Skill</span>
              </Link>

              <Link
                href="/records"
                className="flex items-center gap-2 rounded-lg bg-card-elevated px-4 py-2.5 text-xs sm:text-sm font-semibold text-ink hover:bg-card-hover border border-rule hover:border-rule-bright transition-colors"
              >
                <Trophy className="h-4 w-4 text-brand-yellow" />
                <span>Record Book</span>
              </Link>
            </div>
          </div>

          {/* Right Column: Live Canonical Pulse Widget (5 cols) */}
          <div className="lg:col-span-5">
            <div className="glass-card rounded-2xl p-5 border border-rule-bright space-y-4 shadow-xl bg-card-elevated/70">
              
              {/* Reigning Champion Spotlight */}
              <div className="flex items-center justify-between border-b border-rule pb-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-brand-yellow/15 border border-brand-yellow/40 flex items-center justify-center text-brand-yellow font-black font-mono">
                    <Trophy className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-[9px] font-mono uppercase text-brand-yellow font-bold tracking-wider block">
                      Reigning Champion
                    </span>
                    <h3 className="font-mono text-sm font-bold text-ink">
                      San Diego Shadowcöcks
                    </h3>
                  </div>
                </div>
                <span className="font-mono text-xs font-bold text-brand-lime px-2 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/30">
                  11-3 (.786)
                </span>
              </div>

              {/* Live Archive Metrics Grid */}
              <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                <div className="rounded-xl bg-card p-3 border border-rule space-y-1">
                  <span className="text-[10px] uppercase text-ink-dim block">Seasons Archive</span>
                  <span className="text-base font-bold text-ink flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-brand-blue" />
                    <span>12 Eras (2014–25)</span>
                  </span>
                </div>

                <div className="rounded-xl bg-card p-3 border border-rule space-y-1">
                  <span className="text-[10px] uppercase text-ink-dim block">Starter Lineups</span>
                  <span className="text-base font-bold text-brand-lime flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>24,762 Started</span>
                  </span>
                </div>

                <div className="rounded-xl bg-card p-3 border border-rule space-y-1">
                  <span className="text-[10px] uppercase text-ink-dim block">Verified Trades</span>
                  <span className="text-base font-bold text-brand-orange flex items-center gap-1.5">
                    <TrendingUp className="h-3.5 w-3.5" />
                    <span>221 Swaps</span>
                  </span>
                </div>

                <div className="rounded-xl bg-card p-3 border border-rule space-y-1">
                  <span className="text-[10px] uppercase text-ink-dim block">Scoring Standard</span>
                  <span className="text-base font-bold text-brand-blue flex items-center gap-1.5">
                    <Shield className="h-3.5 w-3.5" />
                    <span>0.0 Non-PPR</span>
                  </span>
                </div>
              </div>

              {/* Trust Badge */}
              <div className="text-[11px] text-ink-dim font-mono flex items-center justify-between pt-1 border-t border-rule/50">
                <span>Verified SQLite + NFLverse Data Marts</span>
                <span className="text-brand-lime font-bold">100% Reconciled</span>
              </div>
            </div>
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
              className="group glass-card rounded-xl p-5 hover:border-brand-blue/60 flex flex-col justify-between transition-all hover:bg-card-elevated shadow-lg"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-[10px] font-mono">
                  <span className="px-2 py-0.5 rounded bg-brand-blue/15 text-brand-blue font-bold border border-brand-blue/30">
                    Scope: {preset.state.scope}
                  </span>
                  <span className="text-ink-dim uppercase font-semibold">{preset.state.grain} grain</span>
                </div>
                <h3 className="font-mono text-sm font-bold text-ink group-hover:text-brand-blue transition-colors">
                  {preset.title}
                </h3>
                <p className="text-xs text-ink-muted leading-relaxed">
                  {preset.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-rule flex items-center justify-between text-xs font-mono text-brand-blue font-semibold">
                <span>Run Query</span>
                <ArrowRight className="h-3.5 w-3.5 transform group-hover:translate-x-1.5 transition-transform" />
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

          <div className="rounded-xl border border-rule bg-card divide-y divide-rule/60 shadow-xl overflow-hidden">
            {champions.map((c, i) => (
              <div key={c.year} className="p-4 flex items-center justify-between hover:bg-card-hover/80 transition-colors">
                <div className="flex items-center gap-4">
                  {i === 0 ? (
                    <Seal size={38} className="text-brand-yellow shrink-0" />
                  ) : (
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-card-elevated border border-rule-bright font-mono font-bold text-brand-yellow text-xs shrink-0">
                      {c.year}
                    </div>
                  )}
                  <div>
                    <h4 className="font-mono font-bold text-ink text-sm hover:text-brand-blue cursor-pointer">
                      {c.franchise}
                    </h4>
                    <span className="text-xs text-ink-dim">
                      Record: <strong className="text-ink-muted font-mono">{c.record}</strong> • Owner: <span className="font-mono text-ink-muted">{c.owner}</span>
                    </span>
                  </div>
                </div>

                <Link
                  href={`/seasons/${c.year}`}
                  className="rounded-md bg-card-elevated px-2.5 py-1 text-xs font-mono text-brand-blue hover:text-white hover:bg-brand-blue border border-rule hover:border-brand-blue transition-colors"
                >
                  {c.year} Recap →
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
              <div key={i} className="glass-card rounded-xl p-4 space-y-1.5 shadow-md">
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
          <Link href="/franchises" className="text-xs text-brand-blue hover:underline font-mono">
            View All Franchises & Alumni →
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {CANONICAL_FRANCHISES.filter((f) => f.is_active === 1).map((f) => (
            <Link
              key={f.franchise_id}
              href={`/franchises/${f.franchise_id}`}
              className="glass-card group rounded-xl p-3.5 text-center space-y-2 hover:border-brand-blue/50 flex flex-col items-center justify-center shadow-md transition-all hover:bg-card-elevated"
            >
              <div
                className="h-10 w-10 rounded-full flex items-center justify-center font-mono font-black text-sm shadow-md"
                style={{ backgroundColor: `${f.primary_color}25`, color: f.primary_color, border: `1.5px solid ${f.primary_color}` }}
              >
                {f.display_name.slice(0, 2).toUpperCase()}
              </div>
              <div className="space-y-0.5">
                <h4 className="font-mono text-xs font-bold text-ink group-hover:text-brand-blue transition-colors truncate max-w-[130px]">
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

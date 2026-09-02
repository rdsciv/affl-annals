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
  CheckCircle2,
  Repeat,
  Bookmark,
  ChevronRight
} from "lucide-react";
import { CANONICAL_FRANCHISES, EXPLORE_PRESETS } from "@/lib/constants";
import { getAssetUrl } from "@/lib/api";
import Seal from "@/components/Seal";
import FranchiseLogo from "@/components/FranchiseLogo";

export default function HomePage() {
  const bannerUrl = getAssetUrl("/images/affl-banner.jpg");

  const champions = [
    { year: 2025, franchise_id: "FRAN_SDS", franchise: "San Diego Shadowcöcks", owner: "John Newton", record: "11-3", score: "Champion" },
    { year: 2024, franchise_id: "FRAN_TJS", franchise: "Tijuana Sanchitos", owner: "Zack Blotz", record: "9-5", score: "Champion" },
    { year: 2023, franchise_id: "FRAN_WWL", franchise: "Westeros Warlords", owner: "Levi Sanchez", record: "10-4", score: "Champion" },
    { year: 2022, franchise_id: "FRAN_FFC", franchise: "Fairview Fat Cats", owner: "Alex Renney", record: "10-4", score: "Champion" },
    { year: 2021, franchise_id: "FRAN_HLH", franchise: "Honolulu Horndogs", owner: "Alex Clausen", record: "8-6", score: "Champion" },
    { year: 2020, franchise_id: "FRAN_CVC", franchise: "Chula Vista Chupacabras", owner: "Jason Kafka", record: "8-5", score: "Champion" },
    { year: 2019, franchise_id: "FRAN_MCMD", franchise: "Muck City Mad Dawgs", owner: "Garrett Jones", record: "6-7", score: "Champion" },
    { year: 2018, franchise_id: "FRAN_SVS", franchise: "Squaw Valley Skinners", owner: "Chris Zweifel", record: "8-5", score: "Champion" },
    { year: 2017, franchise_id: "FRAN_SVS", franchise: "Squaw Valley Skinners", owner: "Chris Zweifel", record: "9-4", score: "Champion" },
    { year: 2016, franchise_id: "FRAN_DCMC", franchise: "DC Mighty Cucks", owner: "Austin Williams", record: "10-3", score: "Champion" },
    { year: 2015, franchise_id: "FRAN_SVS", franchise: "Squaw Valley Skinners", owner: "Chris Zweifel", record: "10-3", score: "Champion" },
    { year: 2014, franchise_id: "FRAN_DCMC", franchise: "DC Mighty Cucks", owner: "Austin Williams", record: "11-2", score: "Champion" },
  ];

  const notableRecords = [
    { title: "Most Championships", holder: "Squaw Valley Skinners", value: "3 Titles", badge: "2015, 2017, 2018" },
    { title: "Highest Win Pct (Active)", holder: "Fairview Fat Cats", value: "54.05%", badge: "80-68 Record" },
    { title: "Most Valuable Custody Stint", holder: "Lamar Jackson (Skinners 2019)", value: "415.7 pts", badge: "Custody Alpha" },
    { title: "Defending 2025 Champion", holder: "San Diego Shadowcöcks", value: "11-3", badge: "Reigning Mark" },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      
      {/* Masthead: Archival Chronicle Header */}
      <div className="relative overflow-hidden rounded-2xl border border-rule-bright bg-gradient-to-b from-card-elevated via-card to-canvas p-6 sm:p-8 lg:p-10 shadow-2xl">
        
        {/* Subtle grid pattern background accent */}
        <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-25 pointer-events-none" />

        <div className="relative flex flex-col lg:flex-row items-center justify-between gap-8">
          
          {/* Left: Electric Chrome Logo, Headline & Action Hub */}
          <div className="flex-1 space-y-5 text-center lg:text-left">
            
            {/* High-Resolution Chrome Electric Logo */}
            <div className="inline-flex items-center justify-center lg:justify-start">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={bannerUrl}
                alt="AFFL Official Chrome Electric Logo"
                className="h-20 sm:h-28 md:h-32 w-auto object-contain drop-shadow-[0_0_30px_rgba(0,162,255,0.6)] hover:scale-105 transition-transform duration-300"
              />
            </div>

            <div className="space-y-2">
              <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-black uppercase tracking-tight leading-none text-ink">
                The Permanent Annals of the <span className="text-brand-blue drop-shadow-[0_0_15px_rgba(91,135,172,0.6)]">AFFL</span>
              </h1>
              <p className="text-xs sm:text-sm text-ink-muted leading-relaxed max-w-2xl mx-auto lg:mx-0">
                Twelve competition eras (2014–2025) of franchise marks, roster custody, auction economics, and head-to-head lore preserved in immutable record, joined with NFL play-by-play and advanced opportunity modeling.
              </p>
            </div>

            {/* Main Action CTAs */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-1">
              <Link
                href="/explore"
                className="flex items-center gap-2 rounded-xl bg-brand-blue px-5 py-3 text-xs sm:text-sm font-bold text-white shadow-xl shadow-brand-blue/30 hover:bg-brand-blue/90 hover:scale-[1.02] transition-all"
              >
                <Sparkles className="h-4 w-4" />
                <span>Launch /explore Query Engine</span>
              </Link>

              <Link
                href="/luck"
                className="flex items-center gap-2 rounded-xl bg-card-elevated px-4 py-3 text-xs sm:text-sm font-bold text-brand-lime hover:bg-card-hover border border-rule hover:border-brand-lime/50 transition-all shadow-md"
              >
                <Activity className="h-4 w-4" />
                <span>Luck & Skill Suite</span>
              </Link>

              <Link
                href="/records/roto"
                className="flex items-center gap-2 rounded-xl bg-card-elevated px-4 py-3 text-xs sm:text-sm font-bold text-brand-yellow hover:bg-card-hover border border-rule hover:border-brand-yellow/50 transition-all shadow-md"
              >
                <Award className="h-4 w-4" />
                <span>10-Cat Roto Radar</span>
              </Link>
            </div>
          </div>

          {/* Right: Live Canonical Archive Pulse Card */}
          <div className="w-full lg:w-96 shrink-0">
            <div className="glass-card rounded-2xl p-5 border border-rule-bright space-y-4 shadow-2xl bg-card-elevated/90 backdrop-blur-xl">
              
              {/* Reigning Champion Honor Roll */}
              <div className="flex items-center justify-between border-b border-rule pb-3">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-xl bg-brand-yellow/15 border border-brand-yellow/40 flex items-center justify-center text-brand-yellow font-black font-mono shadow-lg">
                    <Trophy className="h-6 w-6" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono uppercase text-brand-yellow font-bold tracking-wider block">
                      2025 Reigning Champion
                    </span>
                    <h3 className="font-mono text-sm sm:text-base font-bold text-ink">
                      San Diego Shadowcöcks
                    </h3>
                  </div>
                </div>
                <span className="font-mono text-xs font-bold text-brand-lime px-2.5 py-1 rounded bg-emerald-500/15 border border-emerald-500/30">
                  11-3 (.786)
                </span>
              </div>

              {/* Verified League Metrics */}
              <div className="grid grid-cols-2 gap-2.5 text-xs font-mono">
                <div className="rounded-xl bg-card p-3 border border-rule space-y-1">
                  <span className="text-[10px] uppercase text-ink-dim block font-semibold">Competition Eras</span>
                  <span className="text-sm font-bold text-ink flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-brand-blue" />
                    <span>12 Seasons (2014–25)</span>
                  </span>
                </div>

                <div className="rounded-xl bg-card p-3 border border-rule space-y-1">
                  <span className="text-[10px] uppercase text-ink-dim block font-semibold">Starter Lineups</span>
                  <span className="text-sm font-bold text-brand-lime flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>24,762 Started</span>
                  </span>
                </div>

                <div className="rounded-xl bg-card p-3 border border-rule space-y-1">
                  <span className="text-[10px] uppercase text-ink-dim block font-semibold">Verified Trades</span>
                  <span className="text-sm font-bold text-brand-orange flex items-center gap-1.5">
                    <Repeat className="h-3.5 w-3.5" />
                    <span>221 Swaps</span>
                  </span>
                </div>

                <div className="rounded-xl bg-card p-3 border border-rule space-y-1">
                  <span className="text-[10px] uppercase text-ink-dim block font-semibold">Scoring Standard</span>
                  <span className="text-sm font-bold text-brand-blue flex items-center gap-1.5">
                    <Shield className="h-3.5 w-3.5" />
                    <span>0.0 Non-PPR</span>
                  </span>
                </div>
              </div>

              {/* Provenance Badge */}
              <div className="text-[11px] text-ink-dim font-mono flex items-center justify-between pt-1 border-t border-rule/50">
                <span className="flex items-center gap-1">
                  <Database className="h-3 w-3 text-brand-blue" />
                  <span>SQLite Warehouse + nflverse</span>
                </span>
                <span className="text-brand-lime font-bold">100% Reconciled</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* The Four Archival Pillars */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Bookmark className="h-4 w-4 text-brand-yellow" />
          <h2 className="font-mono text-sm sm:text-base font-bold text-ink uppercase tracking-wider">
            The Archival Pillars
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          <Link
            href="/explore"
            className="glass-card rounded-xl p-4 border border-rule hover:border-brand-blue/60 transition-all hover:bg-card-elevated group shadow-md flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold uppercase text-brand-blue px-2 py-0.5 rounded bg-brand-blue/15 border border-brand-blue/30">
                  Query Engine
                </span>
                <Sparkles className="h-4 w-4 text-brand-blue group-hover:rotate-12 transition-transform" />
              </div>
              <h3 className="font-mono text-sm font-bold text-ink group-hover:text-brand-blue transition-colors">
                /explore Savant
              </h3>
              <p className="text-[11px] text-ink-dim leading-relaxed">
                Multi-dimensional slice & dice queries across all 24,762 rostered player-weeks and franchise stints.
              </p>
            </div>
            <div className="mt-3 pt-2.5 border-t border-rule flex items-center justify-between text-xs font-mono text-brand-blue font-semibold">
              <span>Open Builder</span>
              <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          <Link
            href="/luck"
            className="glass-card rounded-xl p-4 border border-rule hover:border-brand-lime/60 transition-all hover:bg-card-elevated group shadow-md flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold uppercase text-brand-lime px-2 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/30">
                  Empirical Suite
                </span>
                <Activity className="h-4 w-4 text-brand-lime group-hover:scale-110 transition-transform" />
              </div>
              <h3 className="font-mono text-sm font-bold text-ink group-hover:text-brand-lime transition-colors">
                Luck & Skill Engine
              </h3>
              <p className="text-[11px] text-ink-dim leading-relaxed">
                Schedule swap simulations, All-Play win matrices, lineup efficiency, and agonizing coaching blunders.
              </p>
            </div>
            <div className="mt-3 pt-2.5 border-t border-rule flex items-center justify-between text-xs font-mono text-brand-lime font-semibold">
              <span>Simulate Luck</span>
              <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          <Link
            href="/points"
            className="glass-card rounded-xl p-4 border border-rule hover:border-brand-yellow/60 transition-all hover:bg-card-elevated group shadow-md flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold uppercase text-brand-yellow px-2 py-0.5 rounded bg-amber-500/15 border border-amber-500/30">
                  Reconciler
                </span>
                <Layers className="h-4 w-4 text-brand-yellow group-hover:scale-110 transition-transform" />
              </div>
              <h3 className="font-mono text-sm font-bold text-ink group-hover:text-brand-yellow transition-colors">
                Where Points Came From
              </h3>
              <p className="text-[11px] text-ink-dim leading-relaxed">
                Exact point acquisition breakdown: Draft allocation share vs Waiver Wire FAAB vs Free Agency wire gems.
              </p>
            </div>
            <div className="mt-3 pt-2.5 border-t border-rule flex items-center justify-between text-xs font-mono text-brand-yellow font-semibold">
              <span>Inspect Points</span>
              <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          <Link
            href="/records/roto"
            className="glass-card rounded-xl p-4 border border-rule hover:border-brand-orange/60 transition-all hover:bg-card-elevated group shadow-md flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold uppercase text-brand-orange px-2 py-0.5 rounded bg-rose-500/15 border border-rose-500/30">
                  10-Category
                </span>
                <Award className="h-4 w-4 text-brand-orange group-hover:scale-110 transition-transform" />
              </div>
              <h3 className="font-mono text-sm font-bold text-ink group-hover:text-brand-orange transition-colors">
                Roto Skill Radar
              </h3>
              <p className="text-[11px] text-ink-dim leading-relaxed">
                Fantasy Genius 10-category scoring radar analyzing passing, rushing, receiving, and efficiency marks.
              </p>
            </div>
            <div className="mt-3 pt-2.5 border-t border-rule flex items-center justify-between text-xs font-mono text-brand-orange font-semibold">
              <span>View Radars</span>
              <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>
      </div>

      {/* Featured Savant Queries Rail */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-brand-blue" />
            <h2 className="font-mono text-sm sm:text-base font-bold text-ink uppercase tracking-wider">
              Featured Annals Queries
            </h2>
          </div>
          <Link href="/explore" className="text-xs text-brand-blue hover:underline flex items-center gap-1 font-medium font-mono">
            <span>Open Query Builder</span>
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {EXPLORE_PRESETS.slice(0, 3).map((preset) => (
            <Link
              key={preset.id}
              href={`/explore?scope=${preset.state.scope}&grain=${preset.state.grain}&sort=${preset.state.sortBy}&metrics=${preset.state.metrics.join(",")}`}
              className="group glass-card rounded-xl p-4 hover:border-brand-blue/60 flex flex-col justify-between transition-all hover:bg-card-elevated shadow-lg"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[10px] font-mono">
                  <span className="px-2 py-0.5 rounded bg-brand-blue/15 text-brand-blue font-bold border border-brand-blue/30">
                    Scope: {preset.state.scope}
                  </span>
                  <span className="text-ink-dim uppercase font-semibold">{preset.state.grain} grain</span>
                </div>
                <h3 className="font-mono text-xs sm:text-sm font-bold text-ink group-hover:text-brand-blue transition-colors">
                  {preset.title}
                </h3>
                <p className="text-xs text-ink-muted leading-relaxed">
                  {preset.description}
                </p>
              </div>

              <div className="mt-3 pt-2.5 border-t border-rule flex items-center justify-between text-xs font-mono text-brand-blue font-semibold">
                <span>Run Query</span>
                <ArrowRight className="h-3.5 w-3.5 transform group-hover:translate-x-1.5 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Championship Timeline & Record Highlights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Championship Timeline */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center gap-2">
            <Trophy className="h-4 w-4 text-brand-yellow" />
            <h2 className="font-mono text-sm sm:text-base font-bold text-ink uppercase tracking-wider">
              Championship Chronicle (2014–2025)
            </h2>
          </div>

          <div className="rounded-xl border border-rule bg-card divide-y divide-rule/60 shadow-xl overflow-hidden">
            {champions.map((c, i) => (
              <div key={c.year} className="p-3.5 flex items-center justify-between hover:bg-card-hover/80 transition-colors text-xs">
                <div className="flex items-center gap-3.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-card-elevated border border-rule-bright font-mono font-bold text-brand-yellow text-xs shrink-0">
                    {c.year}
                  </div>
                  <FranchiseLogo franchiseId={c.franchise_id} size="md" />
                  <div>
                    <h4 className="font-mono font-bold text-ink hover:text-brand-blue cursor-pointer">
                      {c.franchise}
                    </h4>
                    <span className="text-[11px] text-ink-dim font-mono">
                      Record: <strong className="text-ink-muted">{c.record}</strong> • Owner: <span className="text-ink-muted">{c.owner}</span>
                    </span>
                  </div>
                </div>

                <Link
                  href={`/seasons/${c.year}`}
                  className="rounded-md bg-card-elevated px-2.5 py-1 text-xs font-mono text-brand-blue hover:text-white hover:bg-brand-blue border border-rule hover:border-brand-blue transition-colors"
                >
                  {c.year} Chronicle →
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Notable Records */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Flame className="h-4 w-4 text-brand-orange" />
            <h2 className="font-mono text-sm sm:text-base font-bold text-ink uppercase tracking-wider">
              Historical Marks
            </h2>
          </div>

          <div className="space-y-2.5">
            {notableRecords.map((rec, i) => (
              <div key={i} className="glass-card rounded-xl p-3.5 space-y-1 shadow-md">
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
      <div className="space-y-3 pt-2 border-t border-rule">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-brand-blue" />
            <h2 className="font-mono text-sm sm:text-base font-bold text-ink uppercase tracking-wider">
              Current 2026 Planning Field (12 Franchises)
            </h2>
          </div>
          <Link href="/franchises" className="text-xs text-brand-blue hover:underline font-mono">
            View All Franchises & Alumni →
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
          {CANONICAL_FRANCHISES.filter((f) => f.is_active === 1).map((f) => (
            <Link
              key={f.franchise_id}
              href={`/franchises/${f.franchise_id}`}
              className="glass-card group rounded-xl p-3 text-center space-y-1.5 hover:border-brand-blue/50 flex flex-col items-center justify-center shadow-md transition-all hover:bg-card-elevated"
            >
              <div
                className="h-9 w-9 rounded-full flex items-center justify-center font-mono font-black text-xs shadow-md"
                style={{ backgroundColor: `${f.primary_color}25`, color: f.primary_color, border: `1.5px solid ${f.primary_color}` }}
              >
                {f.display_name.slice(0, 2).toUpperCase()}
              </div>
              <div className="space-y-0.5">
                <h4 className="font-mono text-xs font-bold text-ink group-hover:text-brand-blue transition-colors truncate max-w-[120px]">
                  {f.display_name}
                </h4>
                <span className="text-[9px] text-ink-dim block font-mono">
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

"use client";

import { BookOpen, Shield, Database, Lock, CheckCircle2, AlertCircle, FileText, Code2 } from "lucide-react";
import { METRIC_DEFINITIONS } from "@/lib/constants";
import MethodologyCalculators from "@/components/MethodologyCalculators";

export default function MethodologyPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Header Banner */}
      <div className="border-b border-rule pb-6 space-y-2">
        <h1 className="font-mono text-2xl md:text-3xl font-black text-ink tracking-tight flex items-center gap-3">
          <BookOpen className="h-7 w-7 text-brand-blue" />
          <span>AFFL Savant Methodology & Provenance</span>
        </h1>
        <p className="text-xs md:text-sm text-ink-muted">
          Official documentation detailing data sources, identity resolution contracts, non-PPR scoring weights,
          evidence tiers, and analytical metric formulas.
        </p>
      </div>

      {/* 1. Core Data Sources */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Database className="h-4 w-4 text-brand-blue" />
          <h2 className="font-mono text-base font-bold text-ink uppercase tracking-wider">
            1. Authoritative Data Sources
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="glass-card rounded-xl p-5 space-y-2 border border-rule">
            <h3 className="font-mono text-sm font-bold text-brand-blue">AFFL League Warehouse (affl.db)</h3>
            <p className="text-xs text-ink-muted leading-relaxed">
              Canonical SQLite warehouse storing all 2014–2025 owners, franchises, historical team-seasons,
              weekly matchups, draft auction bids, keepers, transaction logs, and roster stints.
            </p>
          </div>

          <div className="glass-card rounded-xl p-5 space-y-2 border border-rule">
            <h3 className="font-mono text-sm font-bold text-brand-lime">NFL Analytical Warehouse (nflverse)</h3>
            <p className="text-xs text-ink-muted leading-relaxed">
              Play-by-play, weekly player statistics, GSIS player directory, official headshots, and Next Gen Stats
              sourced directly from open-access nflverse releases.
            </p>
          </div>
        </div>
      </section>

      {/* 2. Identity Contracts & Merges */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-brand-yellow" />
          <h2 className="font-mono text-base font-bold text-ink uppercase tracking-wider">
            2. Canonical Identity Rules
          </h2>
        </div>
        <div className="glass-card rounded-xl p-6 space-y-4 border border-rule text-xs text-ink-muted leading-relaxed">
          <ul className="space-y-2.5">
            <li className="flex items-start gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-blue mt-1.5 shrink-0"></span>
              <span>
                <strong className="text-ink font-semibold">Durable Franchise Identity:</strong> The owner/person is the durable AFFL franchise identity. ESPN team slots are transient per-season entities.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-blue mt-1.5 shrink-0"></span>
              <span>
                <strong className="text-ink font-semibold">Binding Merges:</strong> Historical aliases for Jason Kafka (DC Mighty Cucks), Kevin Sliger (Fairview Fat Cats), and Tanner Dunn (Central Oregon Gabagooners) are canonically merged across renames.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-blue mt-1.5 shrink-0"></span>
              <span>
                <strong className="text-ink font-semibold">Defense / Special Teams:</strong> NFL D/ST units are joined to normalized team-season identities and are never categorized as unresolved player entities.
              </span>
            </li>
          </ul>
        </div>
      </section>

      {/* 3. Evidence Tiers & Historical Gaps */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-brand-orange" />
          <h2 className="font-mono text-base font-bold text-ink uppercase tracking-wider">
            3. Evidence Tiers & Historical Gaps
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="glass-card rounded-xl p-5 space-y-2 border border-rule">
            <div className="flex items-center gap-2 text-brand-yellow font-mono text-xs font-bold">
              <AlertCircle className="h-4 w-4" />
              <span>2014–2017 Era Evidence</span>
            </div>
            <p className="text-xs text-ink-muted leading-relaxed">
              Verified starter membership is backed by direct ESPN matchup-roster evidence. Exact lineup slots are unavailable
              in historical archives and strictly remain <code className="text-brand-yellow bg-card-elevated px-1 py-0.5 rounded font-mono">NULL</code> with an explicit <code className="text-brand-yellow bg-card-elevated px-1 py-0.5 rounded font-mono">&apos;Unavailable&apos;</code> evidence label. No synthetic slots are inferred.
            </p>
          </div>

          <div className="glass-card rounded-xl p-5 space-y-2 border border-rule">
            <div className="flex items-center gap-2 text-brand-lime font-mono text-xs font-bold">
              <CheckCircle2 className="h-4 w-4" />
              <span>2018–2025 Era Evidence</span>
            </div>
            <p className="text-xs text-ink-muted leading-relaxed">
              Full weekly rosters, bench placements, waiver bids, trades, and exact lineup slots (QB, RB, WR, TE, FLEX, D/ST, K, BE, IR)
              are fully observed and labeled as <code className="text-brand-lime bg-card-elevated px-1 py-0.5 rounded font-mono">&apos;Observed&apos;</code>.
            </p>
          </div>
        </div>
      </section>

      {/* 4. Scoring Weights */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Lock className="h-4 w-4 text-brand-lime" />
          <h2 className="font-mono text-base font-bold text-ink uppercase tracking-wider">
            4. Standard Non-PPR Scoring System (0 PPR)
          </h2>
        </div>
        <div className="rounded-xl border border-rule bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-rule bg-card-elevated/70 text-[11px] font-mono uppercase tracking-wider text-ink-dim">
                  <th className="py-2.5 px-4">Category</th>
                  <th className="py-2.5 px-4">Stat Component</th>
                  <th className="py-2.5 px-4 text-right">Point Weight</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-rule/60 stat-mono text-ink-muted">
                <tr>
                  <td className="py-2 px-4 font-semibold text-ink">Passing</td>
                  <td className="py-2 px-4">Passing Yards / Passing TD / INT</td>
                  <td className="py-2 px-4 text-right font-bold text-ink">0.04 (1/25) / +4.0 / -2.0</td>
                </tr>
                <tr>
                  <td className="py-2 px-4 font-semibold text-ink">Rushing</td>
                  <td className="py-2 px-4">Rushing Yards / Rushing TD</td>
                  <td className="py-2 px-4 text-right font-bold text-ink">0.10 (1/10) / +6.0</td>
                </tr>
                <tr>
                  <td className="py-2 px-4 font-semibold text-ink">Receiving</td>
                  <td className="py-2 px-4">Receptions / Receiving Yards / Receiving TD</td>
                  <td className="py-2 px-4 text-right font-bold text-ink">0.0 (0 PPR) / 0.10 / +6.0</td>
                </tr>
                <tr>
                  <td className="py-2 px-4 font-semibold text-ink">Misc</td>
                  <td className="py-2 px-4">2-Point Conversions / Fumbles Lost</td>
                  <td className="py-2 px-4 text-right font-bold text-ink">+2.0 / -2.0</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* 4. Interactive Calculators */}
      <MethodologyCalculators />

      {/* 5. Metric Formulas */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Code2 className="h-4 w-4 text-brand-blue" />
          <h2 className="font-mono text-base font-bold text-ink uppercase tracking-wider">
            5. Analytical Metric Definitions & Mathematical Formulas
          </h2>
        </div>

        <div className="space-y-3">
          {Object.values(METRIC_DEFINITIONS).map((m) => (
            <div key={m.id} className="glass-card rounded-xl p-4 space-y-1.5 border border-rule">
              <div className="flex items-center justify-between">
                <h4 className="font-mono text-sm font-bold text-ink">{m.name}</h4>
                <span className="rounded bg-card-elevated px-2 py-0.5 text-[10px] font-mono text-brand-blue border border-rule">
                  {m.category.toUpperCase()}
                </span>
              </div>
              <p className="text-xs text-ink-muted leading-relaxed">{m.description}</p>
              <div className="text-[10px] font-mono text-ink-dim pt-1">
                Compatible Grains: {m.compatibleGrains.join(", ")}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

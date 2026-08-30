"use client";

import { CustodyScope, ResultGrain, ExploreQueryState } from "@/lib/types";
import { CANONICAL_FRANCHISES, GRAINS, METRIC_DEFINITIONS } from "@/lib/constants";
import { Sparkles, Layers, SlidersHorizontal, ArrowUpDown } from "lucide-react";

interface ExploreSentenceProps {
  state: ExploreQueryState;
  onChange: (updates: Partial<ExploreQueryState>) => void;
  rowCount: number;
  scannedCount: number;
  loading: boolean;
}

export default function ExploreSentence({
  state,
  onChange,
  rowCount,
  scannedCount,
  loading,
}: ExploreSentenceProps) {
  const currentGrain = GRAINS.find((g) => g.id === state.grain)?.label || state.grain;
  const currentFranchise = CANONICAL_FRANCHISES.find((f) => f.franchise_id === state.franchiseId);
  const primaryMetric = METRIC_DEFINITIONS[state.sortBy]?.name || state.sortBy;

  return (
    <div className="rounded-xl border border-rule bg-card p-5 shadow-lg shadow-black/40">
      <div className="flex flex-wrap items-center gap-2 text-sm md:text-base font-normal leading-relaxed text-ink-muted">
        <span className="font-mono text-xs font-semibold uppercase tracking-wider text-brand-blue flex items-center gap-1.5 bg-brand-blue/10 px-2 py-0.5 rounded border border-brand-blue/20">
          <Sparkles className="h-3 w-3" />
          Query Sentence
        </span>

        <span>Showing</span>

        {/* Result Grain Picker */}
        <div className="inline-block relative group">
          <select
            value={state.grain}
            onChange={(e) => onChange({ grain: e.target.value as ResultGrain })}
            className="cursor-pointer appearance-none rounded-md bg-card-elevated px-2.5 py-1 text-ink font-semibold border border-rule-bright hover:border-brand-blue focus:border-brand-blue focus:outline-none transition-colors"
          >
            {GRAINS.map((g) => (
              <option key={g.id} value={g.id}>
                {g.label}
              </option>
            ))}
          </select>
        </div>

        <span>production,</span>

        {/* Custody Scope Picker */}
        <div className="inline-block relative">
          <select
            value={state.scope}
            onChange={(e) => onChange({ scope: e.target.value as CustodyScope })}
            className="cursor-pointer appearance-none rounded-md bg-card-elevated px-2.5 py-1 text-brand-lime font-semibold border border-rule-bright hover:border-brand-lime focus:border-brand-lime focus:outline-none transition-colors"
          >
            <option value="rostered">during weeks rostered</option>
            <option value="started">during weeks started</option>
            <option value="ever">ever rostered (career qualification)</option>
          </select>
        </div>

        <span>by</span>

        {/* Franchise Filter */}
        <div className="inline-block relative">
          <select
            value={state.franchiseId || "ALL"}
            onChange={(e) => onChange({ franchiseId: e.target.value === "ALL" ? undefined : e.target.value })}
            className="cursor-pointer appearance-none rounded-md bg-card-elevated px-2.5 py-1 text-brand-blue font-semibold border border-rule-bright hover:border-brand-blue focus:border-brand-blue focus:outline-none transition-colors"
          >
            <option value="ALL">All AFFL Franchises</option>
            {CANONICAL_FRANCHISES.map((f) => (
              <option key={f.franchise_id} value={f.franchise_id}>
                {f.display_name}
              </option>
            ))}
          </select>
        </div>

        <span>across</span>

        {/* Season Range */}
        <div className="inline-flex items-center gap-1 bg-card-elevated px-2 py-0.5 rounded-md border border-rule-bright">
          <select
            value={state.startSeason}
            onChange={(e) => onChange({ startSeason: parseInt(e.target.value) })}
            className="bg-transparent text-ink font-semibold cursor-pointer focus:outline-none text-xs"
          >
            {Array.from({ length: 12 }, (_, i) => 2014 + i).map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
          <span className="text-ink-dim">–</span>
          <select
            value={state.endSeason}
            onChange={(e) => onChange({ endSeason: parseInt(e.target.value) })}
            className="bg-transparent text-ink font-semibold cursor-pointer focus:outline-none text-xs"
          >
            {Array.from({ length: 12 }, (_, i) => 2014 + i).map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>

        {/* Position Filter */}
        <div className="inline-block relative">
          <select
            value={state.position || "ALL"}
            onChange={(e) => onChange({ position: e.target.value === "ALL" ? undefined : e.target.value })}
            className="cursor-pointer appearance-none rounded-md bg-card-elevated px-2.5 py-1 text-ink font-medium border border-rule-bright text-xs focus:outline-none"
          >
            <option value="ALL">All Positions</option>
            <option value="QB">QB only</option>
            <option value="RB">RB only</option>
            <option value="WR">WR only</option>
            <option value="TE">TE only</option>
            <option value="K">K only</option>
            <option value="D/ST">D/ST only</option>
          </select>
        </div>

        <span>sorted by</span>

        {/* Sort Metric Picker */}
        <div className="inline-block relative">
          <select
            value={state.sortBy}
            onChange={(e) => onChange({ sortBy: e.target.value })}
            className="cursor-pointer appearance-none rounded-md bg-card-elevated px-2.5 py-1 text-brand-orange font-semibold border border-rule-bright hover:border-brand-orange focus:border-brand-orange focus:outline-none transition-colors text-xs"
          >
            {state.metrics.map((m) => (
              <option key={m} value={m}>
                {METRIC_DEFINITIONS[m]?.name || m}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={() => onChange({ sortDir: state.sortDir === "desc" ? "asc" : "desc" })}
          className="inline-flex items-center gap-1 rounded bg-card-elevated px-2 py-1 text-xs font-mono font-medium text-ink-muted hover:text-ink border border-rule-bright"
          title="Toggle sort direction"
        >
          <ArrowUpDown className="h-3 w-3" />
          <span>{state.sortDir.toUpperCase()}</span>
        </button>
      </div>

      {/* Query Status Bar */}
      <div className="mt-4 pt-3 border-t border-rule/60 flex flex-wrap items-center justify-between gap-3 text-xs text-ink-dim">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <Layers className="h-3.5 w-3.5 text-brand-blue" />
            <span>
              Results: <strong className="text-ink font-mono">{rowCount.toLocaleString()}</strong>
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span>Scanned: <strong className="text-ink-muted font-mono">{scannedCount.toLocaleString()} rows</strong></span>
          </div>
          <div className="hidden sm:flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-lime"></span>
            <span>Dataset: <span className="font-mono text-ink-muted">v1.0.0</span></span>
          </div>
        </div>

        <div className="text-[11px] font-mono text-ink-dim">
          Scope: <span className="text-brand-lime font-medium">While {state.scope}</span> • Scoring: <span className="text-ink-muted">Non-PPR</span>
        </div>
      </div>
    </div>
  );
}

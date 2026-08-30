"use client";

import { ExploreQueryState, MetricDefinition } from "@/lib/types";
import { EXPLORE_PRESETS, METRIC_DEFINITIONS } from "@/lib/constants";
import { Sparkles, Plus, X, Download, Share2, BarChart3, Table as TableIcon } from "lucide-react";
import { useState } from "react";

interface ExploreFiltersProps {
  state: ExploreQueryState;
  onChange: (updates: Partial<ExploreQueryState>) => void;
  viewMode: "table" | "chart";
  onToggleView: (mode: "table" | "chart") => void;
  onExportCsv: () => void;
  onExportJson?: () => void;
}

export default function ExploreFilters({
  state,
  onChange,
  viewMode,
  onToggleView,
  onExportCsv,
  onExportJson,
}: ExploreFiltersProps) {
  const [copied, setCopied] = useState(false);

  const availableMetrics = Object.values(METRIC_DEFINITIONS).filter(
    (m) => !state.metrics.includes(m.id) && m.compatibleGrains.includes(state.grain)
  );

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Presets Rail */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <span className="flex items-center gap-1 font-mono font-semibold text-brand-blue uppercase tracking-wider text-[11px] whitespace-nowrap pl-1">
          <Sparkles className="h-3 w-3" />
          Presets:
        </span>
        {EXPLORE_PRESETS.map((preset) => {
          const isSelected = state.presetId === preset.id;
          return (
            <button
              key={preset.id}
              onClick={() => onChange({ ...preset.state, presetId: preset.id })}
              className={`rounded-full px-3 py-1 font-medium whitespace-nowrap transition-all border ${
                isSelected
                  ? "bg-brand-blue/20 text-brand-blue border-brand-blue/40 shadow-sm"
                  : "bg-card text-ink-muted border-rule hover:bg-card-hover hover:text-ink"
              }`}
              title={preset.description}
            >
              {preset.title}
            </button>
          );
        })}
      </div>

      {/* Metric Chips & Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-rule bg-card px-4 py-3">
        {/* Metric Chips */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-semibold text-ink-dim mr-1">Metrics:</span>
          {state.metrics.map((metricId) => {
            const m = METRIC_DEFINITIONS[metricId];
            return (
              <span
                key={metricId}
                className="inline-flex items-center gap-1 rounded bg-card-elevated px-2 py-0.5 text-xs font-medium text-ink border border-rule-bright"
              >
                <span>{m?.name || metricId}</span>
                {state.metrics.length > 1 && (
                  <button
                    onClick={() =>
                      onChange({
                        metrics: state.metrics.filter((id) => id !== metricId),
                        sortBy: state.sortBy === metricId ? state.metrics[0] : state.sortBy,
                      })
                    }
                    className="text-ink-dim hover:text-red-400"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </span>
            );
          })}

          {/* Add Metric Dropdown */}
          {availableMetrics.length > 0 && (
            <div className="inline-block relative">
              <select
                onChange={(e) => {
                  if (e.target.value) {
                    onChange({ metrics: [...state.metrics, e.target.value] });
                    e.target.value = "";
                  }
                }}
                className="cursor-pointer appearance-none rounded bg-card px-2 py-0.5 text-xs text-brand-blue border border-dashed border-brand-blue/40 hover:border-brand-blue focus:outline-none"
                defaultValue=""
              >
                <option value="" disabled>
                  + Add Metric
                </option>
                {availableMetrics.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.category})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* View Toggle & Actions */}
        <div className="flex items-center gap-2">
          {/* Table / Chart Toggle */}
          <div className="flex items-center rounded-md bg-card-elevated p-0.5 border border-rule">
            <button
              onClick={() => onToggleView("table")}
              className={`flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-medium transition-all ${
                viewMode === "table"
                  ? "bg-brand-blue text-canvas font-semibold shadow-sm"
                  : "text-ink-muted hover:text-ink"
              }`}
            >
              <TableIcon className="h-3.5 w-3.5" />
              <span>Table</span>
            </button>
            <button
              onClick={() => onToggleView("chart")}
              className={`flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-medium transition-all ${
                viewMode === "chart"
                  ? "bg-brand-blue text-canvas font-semibold shadow-sm"
                  : "text-ink-muted hover:text-ink"
              }`}
            >
              <BarChart3 className="h-3.5 w-3.5" />
              <span>Chart</span>
            </button>
          </div>

          {/* Export CSV */}
          <button
            onClick={onExportCsv}
            className="flex items-center gap-1.5 rounded-md bg-card-elevated px-2.5 py-1 text-xs font-medium text-ink-muted hover:text-ink border border-rule hover:border-rule-bright transition-colors"
            title="Export full query results to CSV"
          >
            <Download className="h-3.5 w-3.5 text-brand-lime" />
            <span className="hidden sm:inline">CSV</span>
          </button>

          {/* Export JSON */}
          {onExportJson && (
            <button
              onClick={onExportJson}
              className="flex items-center gap-1.5 rounded-md bg-card-elevated px-2.5 py-1 text-xs font-medium text-ink-muted hover:text-ink border border-rule hover:border-rule-bright transition-colors"
              title="Export query results to JSON"
            >
              <Download className="h-3.5 w-3.5 text-brand-orange" />
              <span className="hidden sm:inline">JSON</span>
            </button>
          )}

          {/* Share URL */}
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 rounded-md bg-card-elevated px-2.5 py-1 text-xs font-medium text-ink-muted hover:text-ink border border-rule hover:border-rule-bright transition-colors"
            title="Copy shareable query URL"
          >
            <Share2 className="h-3.5 w-3.5 text-brand-blue" />
            <span className="hidden sm:inline">{copied ? "Copied!" : "Share"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

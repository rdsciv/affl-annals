"use client";

import { ExploreQueryState, MetricDefinition } from "@/lib/types";
import { METRIC_DEFINITIONS } from "@/lib/constants";
import { ArrowUp, ArrowDown, ExternalLink } from "lucide-react";
import Image from "next/image";

interface ExploreTableProps {
  data: any[];
  state: ExploreQueryState;
  onSort: (metricId: string) => void;
  onSelectRow: (row: any) => void;
}

export default function ExploreTable({
  data,
  state,
  onSort,
  onSelectRow,
}: ExploreTableProps) {
  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-rule bg-card py-16 text-center text-ink-muted">
        <p className="font-mono text-sm">No results match the selected query criteria.</p>
        <p className="text-xs text-ink-dim mt-1">Try expanding the season range or loosening the position filter.</p>
      </div>
    );
  }

  const isPlayerGrain = state.grain === "player";
  const isFranchiseGrain = state.grain === "franchise";

  return (
    <div className="rounded-xl border border-rule bg-card overflow-hidden shadow-lg shadow-black/30">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-rule bg-card-elevated/70 text-[11px] font-mono uppercase tracking-wider text-ink-dim">
              <th className="py-3 px-4 font-semibold text-ink">#</th>
              
              {/* Primary Label Column */}
              <th
                onClick={() => onSort(isPlayerGrain ? "player_name" : "franchise_name")}
                className={`py-3 px-4 font-semibold cursor-pointer hover:text-brand-blue transition-colors select-none ${
                  state.sortBy === (isPlayerGrain ? "player_name" : "franchise_name") ? "text-brand-orange bg-brand-orange/5" : "text-ink"
                }`}
              >
                <div className="flex items-center gap-1">
                  <span>{isPlayerGrain ? "Player" : isFranchiseGrain ? "AFFL Franchise" : "Entity"}</span>
                  {state.sortBy === (isPlayerGrain ? "player_name" : "franchise_name") && (
                    state.sortDir === "desc" ? (
                      <ArrowDown className="h-3 w-3 text-brand-orange" />
                    ) : (
                      <ArrowUp className="h-3 w-3 text-brand-orange" />
                    )
                  )}
                </div>
              </th>

              {isPlayerGrain && (
                <>
                  <th
                    onClick={() => onSort("position")}
                    className={`py-3 px-3 font-semibold cursor-pointer hover:text-brand-blue transition-colors select-none ${
                      state.sortBy === "position" ? "text-brand-orange bg-brand-orange/5" : "text-ink-dim"
                    }`}
                  >
                    <div className="flex items-center gap-1">
                      <span>Pos</span>
                      {state.sortBy === "position" && (
                        state.sortDir === "desc" ? (
                          <ArrowDown className="h-3 w-3 text-brand-orange" />
                        ) : (
                          <ArrowUp className="h-3 w-3 text-brand-orange" />
                        )
                      )}
                    </div>
                  </th>
                  <th
                    onClick={() => onSort("franchise_name")}
                    className={`py-3 px-3 font-semibold cursor-pointer hover:text-brand-blue transition-colors select-none ${
                      state.sortBy === "franchise_name" ? "text-brand-orange bg-brand-orange/5" : "text-ink-dim"
                    }`}
                  >
                    <div className="flex items-center gap-1">
                      <span>AFFL Franchise</span>
                      {state.sortBy === "franchise_name" && (
                        state.sortDir === "desc" ? (
                          <ArrowDown className="h-3 w-3 text-brand-orange" />
                        ) : (
                          <ArrowUp className="h-3 w-3 text-brand-orange" />
                        )
                      )}
                    </div>
                  </th>
                </>
              )}

              {/* Dynamic Metric Columns */}
              {state.metrics.map((metricId) => {
                const m = METRIC_DEFINITIONS[metricId];
                const isSorted = state.sortBy === metricId;
                return (
                  <th
                    key={metricId}
                    onClick={() => onSort(metricId)}
                    className={`py-3 px-4 text-right font-semibold cursor-pointer hover:text-brand-blue transition-colors select-none ${
                      isSorted ? "text-brand-orange bg-brand-orange/5" : ""
                    }`}
                  >
                    <div className="flex items-center justify-end gap-1">
                      <span>{m?.shortName || metricId}</span>
                      {isSorted && (
                        state.sortDir === "desc" ? (
                          <ArrowDown className="h-3 w-3 text-brand-orange" />
                        ) : (
                          <ArrowUp className="h-3 w-3 text-brand-orange" />
                        )
                      )}
                    </div>
                  </th>
                );
              })}

              <th className="py-3 px-3 text-center text-ink-dim">Drilldown</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-rule/60 stat-mono">
            {data.map((row, idx) => {
              const franchiseName = row.franchise_name || row.affl_franchise_name || "—";
              const playerName = row.player_name || row.display_name || "—";
              const position = row.position || "—";
              const logoPath = row.franchise_logo || row.current_logo_path;
              const franchiseColor = row.franchise_color || row.primary_color || "#5b87ac";

              return (
                <tr
                  key={idx}
                  onClick={() => onSelectRow(row)}
                  className="group cursor-pointer hover:bg-card-hover/80 transition-colors"
                >
                  <td className="py-2.5 px-4 text-ink-dim text-[11px]">{idx + 1}</td>

                  {/* Primary Name */}
                  <td className="py-2.5 px-4 font-sans font-medium text-ink">
                    <div className="flex items-center gap-2.5">
                      {isPlayerGrain && row.headshot_url && (
                        <div className="relative h-6 w-6 overflow-hidden rounded-full border border-rule-bright bg-canvas shrink-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={row.headshot_url}
                            alt={playerName}
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = "none";
                            }}
                          />
                        </div>
                      )}
                      {isFranchiseGrain && (
                        <div
                          className="h-3 w-3 rounded-full shrink-0"
                          style={{ backgroundColor: franchiseColor }}
                        />
                      )}
                      <span className="font-semibold text-ink group-hover:text-brand-blue transition-colors whitespace-nowrap">
                        {isPlayerGrain ? playerName : isFranchiseGrain ? franchiseName : (row.entity_label || playerName || franchiseName)}
                      </span>
                    </div>
                  </td>

                  {isPlayerGrain && (
                    <>
                      <td className="py-2.5 px-3">
                        <span className="inline-block rounded bg-card-elevated px-1.5 py-0.5 text-[10px] font-mono font-semibold text-ink-muted border border-rule">
                          {position}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-sans text-xs text-ink-muted whitespace-nowrap">
                        <span
                          className="font-medium"
                          style={{ color: franchiseColor }}
                        >
                          {franchiseName}
                        </span>
                      </td>
                    </>
                  )}

                  {/* Dynamic Metrics */}
                  {state.metrics.map((metricId) => {
                    const m = METRIC_DEFINITIONS[metricId];
                    const val = row[metricId];
                    const formatted = m ? m.format(val) : val?.toString() ?? "—";
                    const isSorted = state.sortBy === metricId;

                    return (
                      <td
                        key={metricId}
                        className={`py-2.5 px-4 text-right font-mono text-xs ${
                          isSorted ? "font-bold text-ink bg-brand-orange/5" : "text-ink-muted"
                        }`}
                      >
                        {formatted}
                      </td>
                    );
                  })}

                  <td className="py-2.5 px-3 text-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectRow(row);
                      }}
                      className="rounded p-1 text-ink-dim hover:bg-card-elevated hover:text-brand-blue transition-colors"
                      title="Inspect plays and supporting data"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

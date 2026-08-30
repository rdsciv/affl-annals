"use client";

import { useState, useMemo } from "react";
import { ExploreQueryState, MetricDefinition } from "@/lib/types";
import { METRIC_DEFINITIONS } from "@/lib/constants";
import { Search, Pin, Crosshair } from "lucide-react";

interface ExploreChartProps {
  data: any[];
  state: ExploreQueryState;
  onSelectRow: (row: any) => void;
}

export default function ExploreChart({
  data,
  state,
  onSelectRow,
}: ExploreChartProps) {
  const [xMetric, setXMetric] = useState<string>(
    state.metrics.length > 1 ? state.metrics[1] : (state.metrics[0] || "xfp")
  );
  const [yMetric, setYMetric] = useState<string>(state.metrics[0] || "affl_points");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [pinnedItem, setPinnedItem] = useState<any | null>(null);
  const [hoveredItem, setHoveredItem] = useState<any | null>(null);

  const xDef = METRIC_DEFINITIONS[xMetric];
  const yDef = METRIC_DEFINITIONS[yMetric];

  // Calculate coordinates and medians
  const { points, xMedian, yMedian, xMin, xMax, yMin, yMax } = useMemo(() => {
    if (!data.length) return { points: [], xMedian: 0, yMedian: 0, xMin: 0, xMax: 10, yMin: 0, yMax: 10 };

    const valid = data.filter(
      (d) => typeof d[xMetric] === "number" && typeof d[yMetric] === "number"
    );

    const xVals = valid.map((d) => d[xMetric]).sort((a, b) => a - b);
    const yVals = valid.map((d) => d[yMetric]).sort((a, b) => a - b);

    const xMed = xVals.length ? xVals[Math.floor(xVals.length / 2)] : 0;
    const yMed = yVals.length ? yVals[Math.floor(yVals.length / 2)] : 0;

    const x_min = xVals.length ? Math.min(xVals[0], 0) : 0;
    const x_max = xVals.length ? Math.max(xVals[xVals.length - 1], 10) * 1.05 : 10;

    const y_min = yVals.length ? Math.min(yVals[0], 0) : 0;
    const y_max = yVals.length ? Math.max(yVals[yVals.length - 1], 10) * 1.05 : 10;

    return {
      points: valid,
      xMedian: xMed,
      yMedian: yMed,
      xMin: x_min,
      xMax: x_max,
      yMin: y_min,
      yMax: y_max,
    };
  }, [data, xMetric, yMetric]);

  const filteredPoints = useMemo(() => {
    if (!searchQuery.trim()) return points;
    const q = searchQuery.toLowerCase();
    return points.filter(
      (p) =>
        (p.player_name && p.player_name.toLowerCase().includes(q)) ||
        (p.franchise_name && p.franchise_name.toLowerCase().includes(q))
    );
  }, [points, searchQuery]);

  // Scaler helper
  const scaleX = (val: number) => {
    const range = xMax - xMin || 1;
    return ((val - xMin) / range) * 88 + 6; // percentage padding
  };

  const scaleY = (val: number) => {
    const range = yMax - yMin || 1;
    return 94 - ((val - yMin) / range) * 88; // invert Y for SVG/CSS coords
  };

  // Initials generator
  const getInitials = (name: string) => {
    if (!name) return "•";
    const parts = name.split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="space-y-4 rounded-xl border border-rule bg-card p-5 shadow-lg shadow-black/40">
      {/* Chart Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-rule pb-4">
        <div className="flex flex-wrap items-center gap-3 text-xs">
          {/* Y Axis Selector */}
          <div className="flex items-center gap-1.5">
            <span className="font-mono font-semibold text-brand-orange uppercase text-[10px]">Y-Axis:</span>
            <select
              value={yMetric}
              onChange={(e) => setYMetric(e.target.value)}
              className="rounded-md bg-card-elevated px-2 py-1 text-ink font-medium border border-rule text-xs focus:outline-none"
            >
              {state.metrics.map((m) => (
                <option key={m} value={m}>
                  {METRIC_DEFINITIONS[m]?.name || m}
                </option>
              ))}
            </select>
          </div>

          {/* X Axis Selector */}
          <div className="flex items-center gap-1.5">
            <span className="font-mono font-semibold text-brand-blue uppercase text-[10px]">X-Axis:</span>
            <select
              value={xMetric}
              onChange={(e) => setXMetric(e.target.value)}
              className="rounded-md bg-card-elevated px-2 py-1 text-ink font-medium border border-rule text-xs focus:outline-none"
            >
              {state.metrics.map((m) => (
                <option key={m} value={m}>
                  {METRIC_DEFINITIONS[m]?.name || m}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Search / Filter in Chart */}
        <div className="relative">
          <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-ink-dim" />
          <input
            type="text"
            placeholder="Search point / player / franchise..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="rounded-md bg-card-elevated pl-8 pr-3 py-1 text-xs text-ink placeholder-ink-dim border border-rule focus:border-brand-blue focus:outline-none w-56"
          />
        </div>
      </div>

      {/* Scatterplot Canvas */}
      <div className="relative h-[480px] w-full rounded-lg bg-canvas-subtle border border-rule/60 overflow-hidden select-none">
        {/* Median Reference Lines */}
        {points.length > 0 && (
          <>
            {/* Vertical X-Median Line */}
            <div
              className="absolute top-0 bottom-0 border-r border-dashed border-rule-bright pointer-events-none"
              style={{ left: `${scaleX(xMedian)}%` }}
            >
              <span className="absolute top-2 left-1.5 font-mono text-[9px] text-ink-dim bg-canvas/80 px-1 rounded">
                Med: {xDef ? xDef.format(xMedian) : xMedian.toFixed(1)}
              </span>
            </div>

            {/* Horizontal Y-Median Line */}
            <div
              className="absolute left-0 right-0 border-b border-dashed border-rule-bright pointer-events-none"
              style={{ top: `${scaleY(yMedian)}%` }}
            >
              <span className="absolute right-2 bottom-1.5 font-mono text-[9px] text-ink-dim bg-canvas/80 px-1 rounded">
                Med: {yDef ? yDef.format(yMedian) : yMedian.toFixed(1)}
              </span>
            </div>
          </>
        )}

        {/* Data Points */}
        {filteredPoints.map((item, idx) => {
          const xVal = item[xMetric];
          const yVal = item[yMetric];
          const leftPct = scaleX(xVal);
          const topPct = scaleY(yVal);

          const isPinned = pinnedItem && pinnedItem === item;
          const isHovered = hoveredItem && hoveredItem === item;
          const franchiseColor = item.franchise_color || item.primary_color || "#00a2ff";
          const initials = getInitials(item.player_name || item.franchise_name || "Pt");

          return (
            <div
              key={idx}
              onClick={() => setPinnedItem(isPinned ? null : item)}
              onMouseEnter={() => setHoveredItem(item)}
              onMouseLeave={() => setHoveredItem(null)}
              className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-150 ${
                isPinned || isHovered ? "z-30 scale-125" : "z-10 hover:scale-110"
              }`}
              style={{ left: `${leftPct}%`, top: `${topPct}%` }}
            >
              <div
                className={`flex h-6 w-6 items-center justify-center rounded-full text-[9px] font-mono font-bold bg-canvas border-2 shadow-sm ${
                  isPinned ? "ring-2 ring-brand-lime" : ""
                }`}
                style={{ borderColor: franchiseColor, color: franchiseColor }}
              >
                {initials}
              </div>
            </div>
          );
        })}

        {/* Tooltip & Pinned Inspector */}
        {(hoveredItem || pinnedItem) && (
          (() => {
            const item = pinnedItem || hoveredItem;
            const xVal = item[xMetric];
            const yVal = item[yMetric];
            const leftPct = Math.min(80, Math.max(15, scaleX(xVal)));
            const topPct = scaleY(yVal) < 40 ? scaleY(yVal) + 8 : scaleY(yVal) - 22;

            return (
              <div
                className="absolute z-40 pointer-events-auto rounded-lg border border-rule-bright bg-card p-3 shadow-xl text-xs space-y-1.5 w-64 backdrop-blur-md"
                style={{ left: `${leftPct}%`, top: `${topPct}%` }}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-semibold text-ink font-sans">
                      {item.player_name || item.franchise_name}
                    </div>
                    {item.position && (
                      <div className="text-[10px] text-ink-dim font-mono">
                        {item.position} • {item.franchise_name}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => onSelectRow(item)}
                    className="rounded p-1 text-ink-dim hover:text-brand-blue"
                    title="Drilldown"
                  >
                    <Crosshair className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div className="border-t border-rule pt-1.5 grid grid-cols-2 gap-2 text-[11px] font-mono">
                  <div>
                    <span className="text-ink-dim block text-[9px] uppercase">{yDef?.name || yMetric}</span>
                    <span className="font-bold text-brand-orange">{yDef ? yDef.format(yVal) : yVal}</span>
                  </div>
                  <div>
                    <span className="text-ink-dim block text-[9px] uppercase">{xDef?.name || xMetric}</span>
                    <span className="font-bold text-brand-blue">{xDef ? xDef.format(xVal) : xVal}</span>
                  </div>
                </div>
              </div>
            );
          })()
        )}
      </div>

      {/* Axis Titles */}
      <div className="flex items-center justify-between text-xs font-mono text-ink-dim pt-1">
        <div>
          <span>Y: <strong className="text-brand-orange">{yDef?.name || yMetric}</strong></span>
        </div>
        <div>
          <span>X: <strong className="text-brand-blue">{xDef?.name || xMetric}</strong></span>
        </div>
      </div>
    </div>
  );
}

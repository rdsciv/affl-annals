"use client";

import { useState, useMemo } from "react";
import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  Tooltip,
  ReferenceLine,
  Cell,
} from "recharts";
import { ExploreQueryState } from "@/lib/types";
import { METRIC_DEFINITIONS } from "@/lib/constants";
import { Search, Pin, Crosshair, Sparkles, TrendingUp, Info } from "lucide-react";

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
  const [xMetric, setXMetric] = useState<string>("xfp");
  const [yMetric, setYMetric] = useState<string>("affl_points");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [pinnedItem, setPinnedItem] = useState<any | null>(null);

  const xDef = METRIC_DEFINITIONS[xMetric] || { name: xMetric, format: (v: number) => v.toFixed(1) };
  const yDef = METRIC_DEFINITIONS[yMetric] || { name: yMetric, format: (v: number) => v.toFixed(1) };

  // Calculate coordinates and medians
  const { chartData, xMedian, yMedian, xDomain, yDomain } = useMemo(() => {
    if (!data.length) return { chartData: [], xMedian: 0, yMedian: 0, xDomain: [0, 10], yDomain: [0, 10] };

    const valid = data.filter(
      (d) => typeof d[xMetric] === "number" && typeof d[yMetric] === "number"
    );

    const xVals = valid.map((d) => Number(d[xMetric] || 0)).sort((a, b) => a - b);
    const yVals = valid.map((d) => Number(d[yMetric] || 0)).sort((a, b) => a - b);

    const xMed = xVals.length ? xVals[Math.floor(xVals.length / 2)] : 0;
    const yMed = yVals.length ? yVals[Math.floor(yVals.length / 2)] : 0;

    const xMin = xVals.length ? Math.min(xVals[0], 0) : 0;
    const xMax = xVals.length ? Math.max(xVals[xVals.length - 1], 10) * 1.08 : 10;

    const yMin = yVals.length ? Math.min(yVals[0], 0) : 0;
    const yMax = yVals.length ? Math.max(yVals[yVals.length - 1], 10) * 1.08 : 10;

    const formatted = valid.map((d) => ({
      ...d,
      x: Number(d[xMetric] || 0),
      y: Number(d[yMetric] || 0),
      label: d.player_name || d.franchise_name || "Item",
      color: d.franchise_color || "#00a2ff",
    }));

    return {
      chartData: formatted,
      xMedian: xMed,
      yMedian: yMed,
      xDomain: [Math.floor(xMin), Math.ceil(xMax)],
      yDomain: [Math.floor(yMin), Math.ceil(yMax)],
    };
  }, [data, xMetric, yMetric]);

  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return chartData;
    const q = searchQuery.toLowerCase();
    return chartData.filter(
      (p) =>
        (p.player_name && p.player_name.toLowerCase().includes(q)) ||
        (p.franchise_name && p.franchise_name.toLowerCase().includes(q))
    );
  }, [chartData, searchQuery]);

  // Quadrant explanations
  const getQuadrantInfo = () => {
    return {
      q1: "High Opportunity & High Efficiency (League Winners)",
      q2: "Lower Opportunity & High Efficiency (Touchdown Regression Candidates)",
      q3: "Low Opportunity & Low Efficiency",
      q4: "High Opportunity & Low Efficiency (Positive Regression Candidates)",
    };
  };

  const quad = getQuadrantInfo();

  // Metric Options
  const metricOptions = [
    { id: "xfp", label: "Expected Fantasy Points (xFP)", cat: "Opportunity" },
    { id: "wopr", label: "Weighted Opportunity Rating (WOPR)", cat: "Opportunity" },
    { id: "target_share", label: "Target Share %", cat: "Opportunity" },
    { id: "air_yards_share", label: "Air Yards Share %", cat: "Opportunity" },
    { id: "targets", label: "Targets", cat: "Opportunity" },
    { id: "carries", label: "Carries", cat: "Opportunity" },
    { id: "affl_points", label: "AFFL Fantasy Points", cat: "Production" },
    { id: "fpoe", label: "Fantasy Points Over Expected (FPOE)", cat: "Efficiency" },
    { id: "custody_par", label: "Custody Points Above Replacement (PAR)", cat: "Production" },
    { id: "epa", label: "Total EPA (Expected Points Added)", cat: "Efficiency" },
    { id: "rush_yds", label: "Rushing Yards", cat: "Volume" },
    { id: "rec_yds", label: "Receiving Yards", cat: "Volume" },
    { id: "pass_yds", label: "Passing Yards", cat: "Volume" },
  ];

  // Custom Recharts Tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const p = payload[0].payload;
      return (
        <div className="rounded-xl border border-rule-bright bg-card-elevated p-3.5 shadow-2xl space-y-2 text-xs font-mono max-w-xs">
          <div className="flex items-center gap-2.5 border-b border-rule pb-2">
            {p.headshot_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={p.headshot_url}
                alt={p.label}
                className="h-7 w-7 rounded-full object-cover border border-rule"
              />
            )}
            <div>
              <div className="font-bold text-ink font-sans text-xs">{p.label}</div>
              <div className="text-[10px] text-ink-dim font-sans">
                {p.position ? `${p.position} · ` : ""}
                {p.franchise_name || ""}
              </div>
            </div>
          </div>

          <div className="space-y-1 text-[11px]">
            <div className="flex items-center justify-between">
              <span className="text-brand-orange">{xDef.name}:</span>
              <strong className="text-ink">{xDef.format ? xDef.format(p.x) : p.x}</strong>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-brand-blue">{yDef.name}:</span>
              <strong className="text-ink">{yDef.format ? yDef.format(p.y) : p.y}</strong>
            </div>
            {p.season && (
              <div className="flex items-center justify-between text-ink-dim pt-1 border-t border-rule/50">
                <span>Season:</span>
                <span>{p.season}</span>
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-4 rounded-xl border border-rule bg-card p-5 shadow-xl shadow-black/40">
      {/* Chart Control Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-rule pb-4">
        <div className="flex flex-wrap items-center gap-4 text-xs">
          {/* X Axis Selector */}
          <div className="flex items-center gap-1.5">
            <span className="font-mono font-bold text-brand-orange uppercase text-[10px]">
              X-Axis:
            </span>
            <select
              value={xMetric}
              onChange={(e) => setXMetric(e.target.value)}
              className="rounded bg-card-elevated px-2.5 py-1 text-ink font-semibold border border-rule focus:outline-none cursor-pointer"
            >
              {metricOptions.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Y Axis Selector */}
          <div className="flex items-center gap-1.5">
            <span className="font-mono font-bold text-brand-blue uppercase text-[10px]">
              Y-Axis:
            </span>
            <select
              value={yMetric}
              onChange={(e) => setYMetric(e.target.value)}
              className="rounded bg-card-elevated px-2.5 py-1 text-ink font-semibold border border-rule focus:outline-none cursor-pointer"
            >
              {metricOptions.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Filter / Search within Plot */}
        <div className="relative w-full sm:w-56">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-ink-dim" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Highlight entity..."
            className="w-full rounded-lg bg-card-elevated pl-8 pr-3 py-1 text-xs text-ink placeholder-ink-dim border border-rule focus:outline-none focus:border-brand-blue"
          />
        </div>
      </div>

      {/* Main Interactive Recharts Scatter Canvas */}
      <div className="h-[440px] w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart
            margin={{ top: 20, right: 30, bottom: 20, left: 10 }}
          >
            <XAxis
              type="number"
              dataKey="x"
              name={xDef.name}
              domain={xDomain}
              tick={{ fill: "#64748b", fontSize: 11, fontFamily: "monospace" }}
              axisLine={{ stroke: "#334155" }}
              tickLine={{ stroke: "#334155" }}
              unit=""
            />
            <YAxis
              type="number"
              dataKey="y"
              name={yDef.name}
              domain={yDomain}
              tick={{ fill: "#64748b", fontSize: 11, fontFamily: "monospace" }}
              axisLine={{ stroke: "#334155" }}
              tickLine={{ stroke: "#334155" }}
              unit=""
            />
            <ZAxis type="number" range={[50, 140]} />

            {/* Quadrant Median Reference Lines */}
            <ReferenceLine
              x={xMedian}
              stroke="#475569"
              strokeDasharray="4 4"
              label={{
                value: `Median: ${xMedian.toFixed(1)}`,
                fill: "#64748b",
                fontSize: 10,
                position: "insideTopRight",
              }}
            />
            <ReferenceLine
              y={yMedian}
              stroke="#475569"
              strokeDasharray="4 4"
              label={{
                value: `Median: ${yMedian.toFixed(1)}`,
                fill: "#64748b",
                fontSize: 10,
                position: "insideTopLeft",
              }}
            />

            <Tooltip content={<CustomTooltip />} />

            <Scatter
              data={filteredData}
              onClick={(node) => onSelectRow(node)}
              className="cursor-pointer"
            >
              {filteredData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color || "#00a2ff"}
                  opacity={0.85}
                  stroke="#ffffff20"
                  strokeWidth={1}
                />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      {/* Quadrant Guide Footnotes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-3 border-t border-rule text-[11px] font-mono text-ink-dim">
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
          <span>Top Right: {quad.q1}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-sky-500"></span>
          <span>Top Left: {quad.q2}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-amber-500"></span>
          <span>Bottom Right: {quad.q4}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-rose-500"></span>
          <span>Bottom Left: {quad.q3}</span>
        </div>
      </div>
    </div>
  );
}

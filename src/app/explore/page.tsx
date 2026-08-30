"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import ExploreSentence from "@/components/ExploreSentence";
import ExploreFilters from "@/components/ExploreFilters";
import ExploreTable from "@/components/ExploreTable";
import ExploreChart from "@/components/ExploreChart";
import PlayDrilldownModal from "@/components/PlayDrilldownModal";
import { ExploreQueryState, CustodyScope, ResultGrain } from "@/lib/types";
import { EXPLORE_PRESETS, METRIC_DEFINITIONS } from "@/lib/constants";
import { Loader2 } from "lucide-react";

function ExploreContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Initial State from URL params or default
  const [queryState, setQueryState] = useState<ExploreQueryState>(() => {
    const scope = (searchParams.get("scope") as CustodyScope) || "rostered";
    const grain = (searchParams.get("grain") as ResultGrain) || "player";
    const franchiseId = searchParams.get("franchise") || undefined;
    const position = searchParams.get("pos") || undefined;
    const startSeason = parseInt(searchParams.get("start") || "2014");
    const endSeason = parseInt(searchParams.get("end") || "2025");
    const sortBy = searchParams.get("sort") || "affl_points";
    const sortDir = (searchParams.get("dir") as "asc" | "desc") || "desc";
    const metricsParam = searchParams.get("metrics");
    const metrics = metricsParam ? metricsParam.split(",") : ["affl_points", "xfp", "fpoe", "custody_par", "rush_yds", "rec_yds", "pass_yds"];

    return {
      scope,
      grain,
      franchiseId,
      position,
      startSeason,
      endSeason,
      sortBy,
      sortDir,
      metrics,
      limit: 100,
    };
  });

  const [viewMode, setViewMode] = useState<"table" | "chart">("table");
  const [selectedRow, setSelectedRow] = useState<any | null>(null);
  const [rawDataset, setRawDataset] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Sync state changes into URL query params
  const updateQueryState = (updates: Partial<ExploreQueryState>) => {
    const next = { ...queryState, ...updates };
    setQueryState(next);

    const params = new URLSearchParams();
    params.set("scope", next.scope);
    params.set("grain", next.grain);
    if (next.franchiseId) params.set("franchise", next.franchiseId);
    if (next.position) params.set("pos", next.position);
    params.set("start", next.startSeason.toString());
    params.set("end", next.endSeason.toString());
    params.set("sort", next.sortBy);
    params.set("dir", next.sortDir);
    params.set("metrics", next.metrics.join(","));

    router.replace(`/explore?${params.toString()}`, { scroll: false });
  };

  // Load dataset from precomputed marts JSON
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const res = await fetch("/data/marts/mart_affl_player_season_custody.json");
        if (res.ok) {
          const data = await res.json();
          setRawDataset(data);
        } else {
          // Fallback fetch franchise season
          const resFs = await fetch("/data/marts/mart_affl_franchise_season.json");
          if (resFs.ok) {
            const dataFs = await resFs.json();
            setRawDataset(dataFs);
          }
        }
      } catch (err) {
        console.error("Error loading explore marts:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Compute Aggregations based on grain, filters, custody scope, and season range
  const { filteredRows, scannedCount } = useMemo(() => {
    if (!rawDataset.length) return { filteredRows: [], scannedCount: 0 };

    let filtered = rawDataset.filter((item) => {
      if (item.season < queryState.startSeason || item.season > queryState.endSeason) return false;
      if (queryState.franchiseId && item.franchise_id !== queryState.franchiseId) return false;
      if (queryState.position && item.position !== queryState.position) return false;
      return true;
    });

    const scanned = filtered.length;

    // Aggregate by Result Grain
    let aggregated: any[] = [];
    if (queryState.grain === "player") {
      const grouped: Record<string, any> = {};
      for (const row of filtered) {
        const key = `${row.gsis_id || row.player_name}_${row.franchise_id}`;
        if (!grouped[key]) {
          grouped[key] = {
            ...row,
            affl_points: 0,
            bench_points: 0,
            xfp: 0,
            fpoe: 0,
            custody_par: 0,
            targets: 0,
            receptions: 0,
            rec_yds: 0,
            rec_td: 0,
            rush_att: 0,
            rush_yds: 0,
            rush_td: 0,
            pass_att: 0,
            pass_cmp: 0,
            pass_yds: 0,
            pass_td: 0,
            pass_int: 0,
            seasons_count: 0,
          };
        }
        const g = grouped[key];
        g.affl_points += Number(row.affl_points || 0);
        g.bench_points += Number(row.bench_points || 0);
        g.xfp += Number(row.xfp || 0);
        g.fpoe += Number(row.fpoe || 0);
        g.custody_par += Number(row.custody_par || 0);
        g.targets += Number(row.targets || 0);
        g.receptions += Number(row.receptions || 0);
        g.rec_yds += Number(row.rec_yds || 0);
        g.rec_td += Number(row.rec_td || 0);
        g.rush_att += Number(row.rush_att || 0);
        g.rush_yds += Number(row.rush_yds || 0);
        g.rush_td += Number(row.rush_td || 0);
        g.pass_att += Number(row.pass_att || 0);
        g.pass_cmp += Number(row.pass_cmp || 0);
        g.pass_yds += Number(row.pass_yds || 0);
        g.pass_td += Number(row.pass_td || 0);
        g.pass_int += Number(row.pass_int || 0);
        g.seasons_count += 1;
      }
      aggregated = Object.values(grouped);
    } else if (queryState.grain === "franchise") {
      const grouped: Record<string, any> = {};
      for (const row of filtered) {
        const key = row.franchise_id;
        if (!grouped[key]) {
          grouped[key] = {
            franchise_id: row.franchise_id,
            franchise_name: row.franchise_name,
            franchise_logo: row.franchise_logo,
            franchise_color: row.franchise_color,
            affl_points: 0,
            bench_points: 0,
            xfp: 0,
            fpoe: 0,
            custody_par: 0,
            targets: 0,
            receptions: 0,
            rec_yds: 0,
            rec_td: 0,
            rush_att: 0,
            rush_yds: 0,
            rush_td: 0,
            pass_att: 0,
            pass_cmp: 0,
            pass_yds: 0,
            pass_td: 0,
            pass_int: 0,
          };
        }
        const g = grouped[key];
        g.affl_points += Number(row.affl_points || 0);
        g.bench_points += Number(row.bench_points || 0);
        g.xfp += Number(row.xfp || 0);
        g.fpoe += Number(row.fpoe || 0);
        g.custody_par += Number(row.custody_par || 0);
        g.targets += Number(row.targets || 0);
        g.receptions += Number(row.receptions || 0);
        g.rec_yds += Number(row.rec_yds || 0);
        g.rec_td += Number(row.rec_td || 0);
        g.rush_att += Number(row.rush_att || 0);
        g.rush_yds += Number(row.rush_yds || 0);
        g.rush_td += Number(row.rush_td || 0);
        g.pass_att += Number(row.pass_att || 0);
        g.pass_cmp += Number(row.pass_cmp || 0);
        g.pass_yds += Number(row.pass_yds || 0);
        g.pass_td += Number(row.pass_td || 0);
        g.pass_int += Number(row.pass_int || 0);
      }
      aggregated = Object.values(grouped);
    } else {
      aggregated = filtered;
    }

    // Sort
    const sortField = queryState.sortBy;
    const isDesc = queryState.sortDir === "desc";
    aggregated.sort((a, b) => {
      const valA = a[sortField] ?? 0;
      const valB = b[sortField] ?? 0;
      return isDesc ? valB - valA : valA - valB;
    });

    return {
      filteredRows: aggregated.slice(0, queryState.limit),
      scannedCount: scanned,
    };
  }, [rawDataset, queryState]);

  // CSV Export with Complete Metadata Headers
  const handleExportCsv = () => {
    if (!filteredRows.length) return;

    const headers = [
      "# AFFL Savant Query Export",
      `# Date: ${new Date().toISOString()}`,
      `# Custody Scope: While ${queryState.scope}`,
      `# Result Grain: ${queryState.grain}`,
      `# Seasons: ${queryState.startSeason}-${queryState.endSeason}`,
      `# Scoring: Standard Non-PPR (0 PPR)`,
      `# Dataset: v1.0.0 (affl.db + nflverse)`,
      "",
    ];

    const cols = Object.keys(filteredRows[0]);
    const csvContent = [
      ...headers,
      cols.join(","),
      ...filteredRows.map((r) =>
        cols.map((c) => (typeof r[c] === "string" ? `"${r[c]}"` : r[c] ?? "")).join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `affl_savant_explore_${queryState.grain}_${queryState.scope}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-mono text-2xl md:text-3xl font-black text-ink tracking-tight flex items-center gap-3">
            <span>/explore</span>
            <span className="text-xs font-sans font-medium px-2 py-0.5 rounded-full bg-brand-blue/15 text-brand-blue border border-brand-blue/30">
              Interactive Query Builder
            </span>
          </h1>
          <p className="text-xs md:text-sm text-ink-muted mt-1">
            NFL Savant-style exploration across AFFL franchise custody, opportunity models, and historical production.
          </p>
        </div>
      </div>

      {/* Query Sentence */}
      <ExploreSentence
        state={queryState}
        onChange={updateQueryState}
        rowCount={filteredRows.length}
        scannedCount={scannedCount}
        loading={loading}
      />

      {/* Filters Toolbar */}
      <ExploreFilters
        state={queryState}
        onChange={updateQueryState}
        viewMode={viewMode}
        onToggleView={setViewMode}
        onExportCsv={handleExportCsv}
      />

      {/* Results View */}
      {loading ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-rule bg-card py-24 text-ink-muted">
          <Loader2 className="h-8 w-8 animate-spin text-brand-blue mb-3" />
          <span className="font-mono text-xs">Scanning analytical marts...</span>
        </div>
      ) : viewMode === "table" ? (
        <ExploreTable
          data={filteredRows}
          state={queryState}
          onSort={(m) => {
            if (queryState.sortBy === m) {
              updateQueryState({ sortDir: queryState.sortDir === "desc" ? "asc" : "desc" });
            } else {
              updateQueryState({ sortBy: m, sortDir: "desc" });
            }
          }}
          onSelectRow={setSelectedRow}
        />
      ) : (
        <ExploreChart
          data={filteredRows}
          state={queryState}
          onSelectRow={setSelectedRow}
        />
      )}

      {/* Play Drilldown Modal */}
      <PlayDrilldownModal
        item={selectedRow}
        onClose={() => setSelectedRow(null)}
      />
    </div>
  );
}

export default function ExplorePage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs font-mono text-ink-dim">Loading Savant Engine...</div>}>
      <ExploreContent />
    </Suspense>
  );
}

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Users, 
  Shield, 
  Sparkles, 
  Calendar, 
  TrendingUp, 
  ArrowLeft, 
  Award, 
  Activity,
  Layers
} from "lucide-react";

export default function PlayerClientContent({
  gsisId,
}: {
  gsisId: string;
}) {
  const rawId = decodeURIComponent(gsisId);

  const [seasonsData, setSeasonsData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPlayerData() {
      try {
        const res = await fetch("/data/marts/mart_affl_player_season_custody.json");
        if (res.ok) {
          const allData = await res.json();
          const matches = allData.filter(
            (r: any) => r.gsis_id === rawId || r.player_name.toLowerCase() === rawId.toLowerCase()
          );
          matches.sort((a: any, b: any) => b.season - a.season);
          setSeasonsData(matches);
        }
      } catch (err) {
        console.error("Error loading player details:", err);
      } finally {
        setLoading(false);
      }
    }
    loadPlayerData();
  }, [rawId]);

  if (loading) {
    return (
      <div className="py-24 text-center text-xs font-mono text-ink-dim">
        Loading player custody record...
      </div>
    );
  }

  if (!seasonsData.length) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center space-y-4">
        <h2 className="font-mono text-xl font-bold text-ink">Player Record Not Found</h2>
        <p className="text-xs text-ink-muted">No historical AFFL custody rows found for &ldquo;{rawId}&rdquo;.</p>
        <Link href="/players" className="inline-flex items-center gap-2 text-xs text-brand-blue hover:underline">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Player Directory
        </Link>
      </div>
    );
  }

  const latest = seasonsData[0];
  const playerName = latest.player_name;
  const position = latest.position;
  const headshot = latest.headshot_url;
  const college = latest.college;

  const totalPoints = seasonsData.reduce((acc, r) => acc + Number(r.affl_points || 0), 0);
  const totalBenchPoints = seasonsData.reduce((acc, r) => acc + Number(r.bench_points || 0), 0);
  const totalStarted = seasonsData.reduce((acc, r) => acc + Number(r.weeks_started || 0), 0);
  const totalRostered = seasonsData.reduce((acc, r) => acc + Number(r.weeks_rostered || 0), 0);
  const totalXfp = seasonsData.reduce((acc, r) => acc + Number(r.xfp || 0), 0);
  const totalFpoe = seasonsData.reduce((acc, r) => acc + Number(r.fpoe || 0), 0);
  const totalPar = seasonsData.reduce((acc, r) => acc + Number(r.custody_par || 0), 0);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back Link */}
      <div>
        <Link
          href="/players"
          className="inline-flex items-center gap-1.5 text-xs text-ink-muted hover:text-brand-blue transition-colors font-mono"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Player Directory</span>
        </Link>
      </div>

      {/* Player Header Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-rule-bright bg-card p-6 md:p-8 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="relative h-20 w-20 md:h-24 md:w-24 rounded-full overflow-hidden border-2 border-rule-bright bg-canvas shrink-0 shadow-lg">
              {headshot ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={headshot}
                  alt={playerName}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center font-mono font-bold text-xl text-ink-dim bg-card-elevated">
                  {position}
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center gap-2.5">
                <h1 className="font-mono text-2xl md:text-3xl font-black text-ink tracking-tight">
                  {playerName}
                </h1>
                <span className="rounded bg-brand-blue/15 px-2 py-0.5 text-xs font-mono font-bold text-brand-blue border border-brand-blue/30">
                  {position}
                </span>
              </div>

              <p className="text-xs md:text-sm text-ink-muted">
                {college ? `College: ${college}` : "NFL Veteran"} • Active Seasons: {seasonsData[seasonsData.length - 1].season}–{latest.season}
              </p>

              <div className="flex items-center gap-2 pt-1">
                <Link
                  href={`/explore?grain=player&sort=affl_points&start=2014&end=2025`}
                  className="inline-flex items-center gap-1.5 rounded-md bg-card-elevated px-3 py-1 text-xs font-mono text-brand-blue border border-rule hover:border-brand-blue transition-colors"
                >
                  <Sparkles className="h-3 w-3" />
                  <span>Open in /explore</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Career Stat Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-xl bg-card-elevated p-3 border border-rule text-center">
              <span className="text-[10px] font-mono uppercase text-ink-dim block">Career AFFL Pts</span>
              <span className="text-lg font-mono font-bold text-brand-lime">{totalPoints.toFixed(1)}</span>
            </div>
            <div className="rounded-xl bg-card-elevated p-3 border border-rule text-center">
              <span className="text-[10px] font-mono uppercase text-ink-dim block">Career xFP</span>
              <span className="text-lg font-mono font-bold text-brand-blue">{totalXfp.toFixed(1)}</span>
            </div>
            <div className="rounded-xl bg-card-elevated p-3 border border-rule text-center">
              <span className="text-[10px] font-mono uppercase text-ink-dim block">Career FPOE</span>
              <span className="text-lg font-mono font-bold text-brand-orange">
                {totalFpoe > 0 ? `+${totalFpoe.toFixed(1)}` : totalFpoe.toFixed(1)}
              </span>
            </div>
            <div className="rounded-xl bg-card-elevated p-3 border border-rule text-center">
              <span className="text-[10px] font-mono uppercase text-ink-dim block">Custody PAR</span>
              <span className="text-lg font-mono font-bold text-ink">
                {totalPar > 0 ? `+${totalPar.toFixed(1)}` : totalPar.toFixed(1)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* AFFL Custody Timeline */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-brand-blue" />
          <h2 className="font-mono text-base font-bold text-ink uppercase tracking-wider">
            AFFL Custody Timeline & Stint Breakdown
          </h2>
        </div>

        <div className="rounded-xl border border-rule bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-rule bg-card-elevated/70 text-[11px] font-mono uppercase tracking-wider text-ink-dim">
                  <th className="py-3 px-4">Season</th>
                  <th className="py-3 px-4">AFFL Franchise</th>
                  <th className="py-3 px-3 text-right">Rostered</th>
                  <th className="py-3 px-3 text-right">Started</th>
                  <th className="py-3 px-4 text-right">AFFL Points</th>
                  <th className="py-3 px-4 text-right">Bench Points</th>
                  <th className="py-3 px-4 text-right">xFP</th>
                  <th className="py-3 px-4 text-right">FPOE</th>
                  <th className="py-3 px-4 text-right">Custody PAR</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-rule/60 stat-mono">
                {seasonsData.map((s, idx) => (
                  <tr key={idx} className="hover:bg-card-hover/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-ink">{s.season}</td>
                    <td className="py-3 px-4 font-sans font-semibold">
                      <Link
                        href={`/franchises/${s.franchise_id}`}
                        className="hover:underline flex items-center gap-2"
                        style={{ color: s.franchise_color || "#00a2ff" }}
                      >
                        <div
                          className="h-2.5 w-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: s.franchise_color || "#00a2ff" }}
                        />
                        <span>{s.franchise_name}</span>
                      </Link>
                    </td>
                    <td className="py-3 px-3 text-right text-ink-muted">{s.weeks_rostered} wks</td>
                    <td className="py-3 px-3 text-right font-bold text-brand-lime">{s.weeks_started} wks</td>
                    <td className="py-3 px-4 text-right font-bold text-ink">{Number(s.affl_points || 0).toFixed(1)}</td>
                    <td className="py-3 px-4 text-right text-ink-dim">{Number(s.bench_points || 0).toFixed(1)}</td>
                    <td className="py-3 px-4 text-right text-brand-blue">{Number(s.xfp || 0).toFixed(1)}</td>
                    <td className="py-3 px-4 text-right text-brand-orange">
                      {Number(s.fpoe || 0) > 0 ? `+${Number(s.fpoe || 0).toFixed(1)}` : Number(s.fpoe || 0).toFixed(1)}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-ink">
                      {Number(s.custody_par || 0) > 0 ? `+${Number(s.custody_par || 0).toFixed(1)}` : Number(s.custody_par || 0).toFixed(1)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

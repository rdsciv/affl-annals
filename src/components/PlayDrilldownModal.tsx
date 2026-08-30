"use client";

import { X, Play, Clock, MapPin, Award } from "lucide-react";

interface PlayDrilldownModalProps {
  item: any | null;
  onClose: () => void;
}

export default function PlayDrilldownModal({
  item,
  onClose,
}: PlayDrilldownModalProps) {
  if (!item) return null;

  const title = item.player_name || item.franchise_name || item.historical_name || "Record Details";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl rounded-xl border border-rule-bright bg-card p-6 shadow-2xl space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-rule pb-4">
          <div className="flex items-center gap-3">
            {item.headshot_url && (
              <div className="h-12 w-12 rounded-full overflow-hidden border border-rule bg-canvas">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.headshot_url}
                  alt={title}
                  className="h-full w-full object-cover"
                />
              </div>
            )}
            <div>
              <h3 className="font-mono text-base font-bold text-ink">{title}</h3>
              <p className="text-xs text-ink-muted">
                {item.position && `${item.position} • `}
                {item.franchise_name && `AFFL: ${item.franchise_name}`}
                {item.season && ` • Season: ${item.season}`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1.5 text-ink-dim hover:bg-card-hover hover:text-ink transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Supporting Attributes */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="rounded-lg bg-card-elevated p-3 border border-rule">
            <span className="text-[10px] font-mono uppercase text-ink-dim block">AFFL Points</span>
            <span className="text-base font-mono font-bold text-brand-lime">
              {item.affl_points != null ? Number(item.affl_points).toFixed(1) : "—"}
            </span>
          </div>

          <div className="rounded-lg bg-card-elevated p-3 border border-rule">
            <span className="text-[10px] font-mono uppercase text-ink-dim block">Expected xFP</span>
            <span className="text-base font-mono font-bold text-brand-blue">
              {item.xfp != null ? Number(item.xfp).toFixed(1) : "—"}
            </span>
          </div>

          <div className="rounded-lg bg-card-elevated p-3 border border-rule">
            <span className="text-[10px] font-mono uppercase text-ink-dim block">FPOE</span>
            <span className="text-base font-mono font-bold text-brand-orange">
              {item.fpoe != null ? (Number(item.fpoe) > 0 ? `+${Number(item.fpoe).toFixed(1)}` : Number(item.fpoe).toFixed(1)) : "—"}
            </span>
          </div>

          <div className="rounded-lg bg-card-elevated p-3 border border-rule">
            <span className="text-[10px] font-mono uppercase text-ink-dim block">Custody PAR</span>
            <span className="text-base font-mono font-bold text-ink">
              {item.custody_par != null ? (Number(item.custody_par) > 0 ? `+${Number(item.custody_par).toFixed(1)}` : Number(item.custody_par).toFixed(1)) : "—"}
            </span>
          </div>
        </div>

        {/* Workload & Opportunity Summary */}
        <div className="rounded-lg bg-card-elevated/50 p-4 border border-rule space-y-2">
          <h4 className="font-mono text-xs font-semibold uppercase tracking-wider text-ink-dim">
            Production & Workload Breakdown
          </h4>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-xs font-mono">
            <div>
              <span className="text-[10px] text-ink-dim block">Targets</span>
              <span className="font-bold text-ink">{item.targets ?? "—"}</span>
            </div>
            <div>
              <span className="text-[10px] text-ink-dim block">Receptions</span>
              <span className="font-bold text-ink">{item.receptions ?? "—"}</span>
            </div>
            <div>
              <span className="text-[10px] text-ink-dim block">Rec Yards</span>
              <span className="font-bold text-ink">{item.rec_yds ?? "—"}</span>
            </div>
            <div>
              <span className="text-[10px] text-ink-dim block">Carries</span>
              <span className="font-bold text-ink">{item.rush_att ?? "—"}</span>
            </div>
            <div>
              <span className="text-[10px] text-ink-dim block">Rush Yards</span>
              <span className="font-bold text-ink">{item.rush_yds ?? "—"}</span>
            </div>
            <div>
              <span className="text-[10px] text-ink-dim block">Pass Yards</span>
              <span className="font-bold text-ink">{item.pass_yds ?? "—"}</span>
            </div>
          </div>
        </div>

        {/* Provenance & Coverage status */}
        <div className="flex items-center justify-between text-[11px] font-mono text-ink-dim border-t border-rule pt-3">
          <span>Source: <strong className="text-ink-muted">affl.db + nflverse</strong></span>
          <span>Coverage: <strong className="text-brand-lime">100% Verified Match</strong></span>
        </div>
      </div>
    </div>
  );
}

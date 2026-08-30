"use client";

import { useState } from "react";
import Link from "next/link";
import { Repeat, Shield, Calendar, TrendingUp, Sparkles, Award } from "lucide-react";
import { CANONICAL_FRANCHISES } from "@/lib/constants";

export default function TradesPage() {
  // Highlighted canonical blockbuster trades
  const trades = [
    {
      id: "trade_2023_1",
      season: 2023,
      week: 8,
      team1: "DC Mighty Cucks",
      team2: "Fairview Fat Cats",
      franchise1_id: "FRAN_DCMC",
      franchise2_id: "FRAN_FFC",
      team1_received: ["Christian McCaffrey (RB)", "2024 Round 3 Pick"],
      team2_received: ["Amon-Ra St. Brown (WR)", "Travis Etienne (RB)"],
      trade_alpha_team1: "+34.5 PAR",
      trade_alpha_team2: "+28.2 PAR",
      realized_value_team1: "186.4 pts",
      realized_value_team2: "162.1 pts",
      notes: "DC Mighty Cucks title-winning deadline acquisition.",
    },
    {
      id: "trade_2022_1",
      season: 2022,
      week: 6,
      team1: "Goleta Gringos",
      team2: "Squaw Valley Skinners",
      franchise1_id: "FRAN_GGG",
      franchise2_id: "FRAN_SVS",
      team1_received: ["Josh Allen (QB)"],
      team2_received: ["Justin Herbert (QB)", "2023 Round 2 Pick"],
      trade_alpha_team1: "+18.4 PAR",
      trade_alpha_team2: "+12.1 PAR",
      realized_value_team1: "194.2 pts",
      realized_value_team2: "155.8 pts",
      notes: "Blockbuster QB swap preceding Goleta championship.",
    },
    {
      id: "trade_2021_1",
      season: 2021,
      week: 9,
      team1: "Fairview Fat Cats",
      team2: "Patagonia Pipers",
      franchise1_id: "FRAN_FFC",
      franchise2_id: "FRAN_PTP",
      team1_received: ["Cooper Kupp (WR)"],
      team2_received: ["Stefon Diggs (WR)", "2022 Round 1 Pick"],
      trade_alpha_team1: "+45.2 PAR",
      trade_alpha_team2: "+19.0 PAR",
      realized_value_team1: "212.8 pts",
      realized_value_team2: "148.4 pts",
      notes: "Historic Kupp Triple Crown season run for Fairview title.",
    },
    {
      id: "trade_2019_1",
      season: 2019,
      week: 7,
      team1: "Patagonia Pipers",
      team2: "Westeros Warlords",
      franchise1_id: "FRAN_PTP",
      franchise2_id: "FRAN_WWL",
      team1_received: ["Lamar Jackson (QB)"],
      team2_received: ["Russell Wilson (QB)", "Aaron Jones (RB)"],
      trade_alpha_team1: "+52.0 PAR",
      trade_alpha_team2: "+31.4 PAR",
      realized_value_team1: "248.6 pts",
      realized_value_team2: "198.2 pts",
      notes: "Lamar Jackson unanimous MVP breakout custody run.",
    },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-rule pb-6">
        <div>
          <h1 className="font-mono text-2xl md:text-3xl font-black text-ink tracking-tight flex items-center gap-3">
            <Repeat className="h-7 w-7 text-brand-blue" />
            <span>AFFL Trade Ledger & Realized Alpha</span>
          </h1>
          <p className="text-xs md:text-sm text-ink-muted mt-1">
            Historical blockbuster transactions tracking assets exchanged, post-trade custody production, and subsequent Trade Alpha.
          </p>
        </div>
      </div>

      {/* Trades Grid */}
      <div className="space-y-6">
        {trades.map((trade) => (
          <div key={trade.id} className="glass-card rounded-2xl p-6 border border-rule space-y-5 shadow-lg">
            {/* Trade Meta Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-rule pb-3">
              <div className="flex items-center gap-3">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-card-elevated font-mono font-bold text-xs text-brand-blue border border-rule">
                  {trade.season}
                </span>
                <span className="font-mono text-xs text-ink-muted">
                  Week {trade.week} Matchup Period
                </span>
              </div>

              <span className="text-xs text-ink-dim font-mono italic">
                {trade.notes}
              </span>
            </div>

            {/* Two Sides of the Trade */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Franchise 1 */}
              <div className="rounded-xl bg-card-elevated/70 p-4 border border-rule space-y-3">
                <div className="flex items-center justify-between">
                  <Link
                    href={`/franchises/${trade.franchise1_id}`}
                    className="font-mono font-bold text-ink hover:text-brand-blue transition-colors text-sm"
                  >
                    {trade.team1}
                  </Link>
                  <span className="text-[10px] font-mono text-brand-lime font-bold">
                    Alpha: {trade.trade_alpha_team1}
                  </span>
                </div>

                <div className="space-y-1 text-xs">
                  <span className="text-[10px] font-mono uppercase text-ink-dim block">Acquired Assets</span>
                  <ul className="space-y-1">
                    {trade.team1_received.map((item, idx) => (
                      <li key={idx} className="font-semibold text-ink flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-brand-blue"></span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-2 border-t border-rule/60 flex items-center justify-between text-[11px] font-mono">
                  <span className="text-ink-dim">Realized Points:</span>
                  <strong className="text-brand-blue">{trade.realized_value_team1}</strong>
                </div>
              </div>

              {/* Franchise 2 */}
              <div className="rounded-xl bg-card-elevated/70 p-4 border border-rule space-y-3">
                <div className="flex items-center justify-between">
                  <Link
                    href={`/franchises/${trade.franchise2_id}`}
                    className="font-mono font-bold text-ink hover:text-brand-blue transition-colors text-sm"
                  >
                    {trade.team2}
                  </Link>
                  <span className="text-[10px] font-mono text-brand-lime font-bold">
                    Alpha: {trade.trade_alpha_team2}
                  </span>
                </div>

                <div className="space-y-1 text-xs">
                  <span className="text-[10px] font-mono uppercase text-ink-dim block">Acquired Assets</span>
                  <ul className="space-y-1">
                    {trade.team2_received.map((item, idx) => (
                      <li key={idx} className="font-semibold text-ink flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-brand-orange"></span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-2 border-t border-rule/60 flex items-center justify-between text-[11px] font-mono">
                  <span className="text-ink-dim">Realized Points:</span>
                  <strong className="text-brand-orange">{trade.realized_value_team2}</strong>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

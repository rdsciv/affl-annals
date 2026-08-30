"use client";

import { useState } from "react";
import { Calculator, Sparkles, TrendingUp, HelpCircle, Activity } from "lucide-react";

export default function MethodologyCalculators() {
  // Calculator 1: Pythagorean Win Expectancy & Luck
  const [pf, setPf] = useState<number>(1450);
  const [pa, setPa] = useState<number>(1380);
  const [games, setGames] = useState<number>(14);
  const [actualWins, setActualWins] = useState<number>(9);

  const exp = 2.37;
  const pfExp = Math.pow(Math.max(pf, 1), exp);
  const paExp = Math.pow(Math.max(pa, 1), exp);
  const pythagPct = pfExp / (pfExp + paExp);
  const expWins = pythagPct * games;
  const luck = actualWins - expWins;

  // Calculator 2: WOPR & Opportunity Role
  const [targetShare, setTargetShare] = useState<number>(24);
  const [airYardsShare, setAirYardsShare] = useState<number>(32);

  const ts = targetShare / 100;
  const ays = airYardsShare / 100;
  const wopr = 1.5 * ts + 0.7 * ays;

  const getWoprTier = (val: number) => {
    if (val >= 0.6) return { tier: "Elite Alpha WR1", color: "text-brand-lime" };
    if (val >= 0.45) return { tier: "Strong Focal Target (WR2 / High-End TE)", color: "text-brand-blue" };
    if (val >= 0.3) return { tier: "Complementary Weapon", color: "text-brand-orange" };
    return { tier: "Rotational / Low Volume", color: "text-ink-dim" };
  };

  const woprTier = getWoprTier(wopr);

  // Calculator 3: xFP & FPOE
  const [pos, setPos] = useState<string>("WR");
  const [carries, setCarries] = useState<number>(2);
  const [targets, setTargets] = useState<number>(8);
  const [airYds, setAirYds] = useState<number>(95);
  const [actualPts, setActualPts] = useState<number>(14.5);

  const calcXfp = () => {
    if (pos === "QB") {
      return carries * 0.65 + targets * 0.1;
    }
    if (pos === "RB") {
      return carries * 0.65 + targets * 0.95;
    }
    if (pos === "WR") {
      return targets * 1.1 + airYds * 0.035 + carries * 0.6;
    }
    // TE
    return targets * 1.05 + airYds * 0.025;
  };

  const calculatedXfp = calcXfp();
  const fpoe = actualPts - calculatedXfp;

  return (
    <section className="space-y-6">
      <div className="flex items-center gap-2">
        <Calculator className="h-5 w-5 text-brand-blue" />
        <h2 className="font-mono text-base font-bold text-ink uppercase tracking-wider">
          4. Interactive Analytical Model Calculators
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calculator 1: Pythagorean Expectation */}
        <div className="glass-card rounded-xl p-5 border border-rule space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-rule pb-2">
            <h3 className="font-mono text-xs font-bold text-brand-blue flex items-center gap-1.5">
              <TrendingUp className="h-4 w-4" />
              <span>Pythagorean Expectation</span>
            </h3>
            <span className="text-[10px] font-mono text-ink-dim">Exp: 2.37</span>
          </div>

          <div className="space-y-3 text-xs font-mono">
            <div>
              <label className="text-ink-dim block text-[10px] uppercase">Points For (PF):</label>
              <input
                type="number"
                value={pf}
                onChange={(e) => setPf(Number(e.target.value))}
                className="w-full rounded bg-card-elevated px-2.5 py-1 text-ink border border-rule focus:outline-none"
              />
            </div>

            <div>
              <label className="text-ink-dim block text-[10px] uppercase">Points Against (PA):</label>
              <input
                type="number"
                value={pa}
                onChange={(e) => setPa(Number(e.target.value))}
                className="w-full rounded bg-card-elevated px-2.5 py-1 text-ink border border-rule focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-ink-dim block text-[10px] uppercase">Games Played:</label>
                <input
                  type="number"
                  value={games}
                  onChange={(e) => setGames(Number(e.target.value))}
                  className="w-full rounded bg-card-elevated px-2.5 py-1 text-ink border border-rule focus:outline-none"
                />
              </div>
              <div>
                <label className="text-ink-dim block text-[10px] uppercase">Actual Wins:</label>
                <input
                  type="number"
                  value={actualWins}
                  onChange={(e) => setActualWins(Number(e.target.value))}
                  className="w-full rounded bg-card-elevated px-2.5 py-1 text-ink border border-rule focus:outline-none"
                />
              </div>
            </div>

            {/* Results */}
            <div className="mt-4 rounded-lg bg-card-elevated p-3 border border-rule-bright space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-ink-dim">Expected Win Pct:</span>
                <strong className="text-brand-lime">{(pythagPct * 100).toFixed(1)}%</strong>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-ink-dim">Expected Wins:</span>
                <strong className="text-ink">{expWins.toFixed(2)} Wins</strong>
              </div>
              <div className="flex justify-between items-center text-xs border-t border-rule pt-1.5">
                <span className="text-ink-dim">Luck Rating (Δ Wins):</span>
                <strong className={luck >= 0 ? "text-emerald-400 font-bold" : "text-rose-400 font-bold"}>
                  {luck >= 0 ? `+${luck.toFixed(2)} (Lucky)` : `${luck.toFixed(2)} (Unlucky)`}
                </strong>
              </div>
            </div>
          </div>
        </div>

        {/* Calculator 2: WOPR (Weighted Opportunity Rating) */}
        <div className="glass-card rounded-xl p-5 border border-rule space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-rule pb-2">
            <h3 className="font-mono text-xs font-bold text-brand-lime flex items-center gap-1.5">
              <Activity className="h-4 w-4" />
              <span>WOPR Opportunity Math</span>
            </h3>
            <span className="text-[10px] font-mono text-ink-dim">1.5*TS + 0.7*AYS</span>
          </div>

          <div className="space-y-3 text-xs font-mono">
            <div>
              <div className="flex justify-between text-[10px] text-ink-dim uppercase">
                <span>Target Share:</span>
                <span className="text-brand-lime">{targetShare}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="45"
                value={targetShare}
                onChange={(e) => setTargetShare(Number(e.target.value))}
                className="w-full accent-brand-lime cursor-pointer mt-1"
              />
            </div>

            <div>
              <div className="flex justify-between text-[10px] text-ink-dim uppercase">
                <span>Air Yards Share:</span>
                <span className="text-brand-orange">{airYardsShare}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="60"
                value={airYardsShare}
                onChange={(e) => setAirYardsShare(Number(e.target.value))}
                className="w-full accent-brand-orange cursor-pointer mt-1"
              />
            </div>

            {/* Results */}
            <div className="mt-4 rounded-lg bg-card-elevated p-3 border border-rule-bright space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-ink-dim">Computed WOPR:</span>
                <strong className="text-xl text-brand-lime">{wopr.toFixed(3)}</strong>
              </div>
              <div className="border-t border-rule pt-2">
                <span className="text-[10px] text-ink-dim block uppercase">Role Classification:</span>
                <span className={`text-xs font-bold ${woprTier.color}`}>{woprTier.tier}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Calculator 3: xFP & FPOE */}
        <div className="glass-card rounded-xl p-5 border border-rule space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-rule pb-2">
            <h3 className="font-mono text-xs font-bold text-brand-orange flex items-center gap-1.5">
              <Sparkles className="h-4 w-4" />
              <span>xFP & FPOE Efficiency</span>
            </h3>
            <span className="text-[10px] font-mono text-ink-dim">Non-PPR Model</span>
          </div>

          <div className="space-y-3 text-xs font-mono">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-ink-dim block text-[10px] uppercase">Position:</label>
                <select
                  value={pos}
                  onChange={(e) => setPos(e.target.value)}
                  className="w-full rounded bg-card-elevated px-2 py-1 text-ink border border-rule focus:outline-none"
                >
                  <option value="WR">WR</option>
                  <option value="RB">RB</option>
                  <option value="TE">TE</option>
                  <option value="QB">QB</option>
                </select>
              </div>
              <div>
                <label className="text-ink-dim block text-[10px] uppercase">Carries:</label>
                <input
                  type="number"
                  value={carries}
                  onChange={(e) => setCarries(Number(e.target.value))}
                  className="w-full rounded bg-card-elevated px-2 py-1 text-ink border border-rule focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-ink-dim block text-[10px] uppercase">Targets:</label>
                <input
                  type="number"
                  value={targets}
                  onChange={(e) => setTargets(Number(e.target.value))}
                  className="w-full rounded bg-card-elevated px-2 py-1 text-ink border border-rule focus:outline-none"
                />
              </div>
              <div>
                <label className="text-ink-dim block text-[10px] uppercase">Air Yards:</label>
                <input
                  type="number"
                  value={airYds}
                  onChange={(e) => setAirYds(Number(e.target.value))}
                  className="w-full rounded bg-card-elevated px-2 py-1 text-ink border border-rule focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-ink-dim block text-[10px] uppercase">Actual Fantasy Pts Scored:</label>
              <input
                type="number"
                value={actualPts}
                onChange={(e) => setActualPts(Number(e.target.value))}
                className="w-full rounded bg-card-elevated px-2.5 py-1 text-ink border border-rule focus:outline-none"
              />
            </div>

            {/* Results */}
            <div className="mt-4 rounded-lg bg-card-elevated p-3 border border-rule-bright space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-ink-dim">Expected Pts (xFP):</span>
                <strong className="text-brand-blue">{calculatedXfp.toFixed(1)} Pts</strong>
              </div>
              <div className="flex justify-between items-center text-xs border-t border-rule pt-1.5">
                <span className="text-ink-dim">FPOE (Efficiency):</span>
                <strong className={fpoe >= 0 ? "text-emerald-400 font-bold" : "text-rose-400 font-bold"}>
                  {fpoe >= 0 ? `+${fpoe.toFixed(1)} Pts (Over)` : `${fpoe.toFixed(1)} Pts (Under)`}
                </strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

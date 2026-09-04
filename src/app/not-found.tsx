import Link from "next/link";
import { Shield, Home, Sparkles, Activity, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 py-16 text-center">
      <div className="max-w-md w-full glass-card rounded-2xl p-8 border border-rule space-y-6 shadow-2xl">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-card-elevated border border-rule text-brand-orange shadow-lg">
          <Shield className="w-8 h-8 opacity-80" />
        </div>

        <div className="space-y-2">
          <span className="text-[11px] font-mono uppercase tracking-widest text-brand-orange font-bold">
            Archive Ledger Record: 404
          </span>
          <h1 className="font-display text-3xl sm:text-4xl font-black text-ink uppercase tracking-tight">
            Chronicle Not Found
          </h1>
          <p className="text-xs sm:text-sm text-ink-muted leading-relaxed font-sans">
            The archival record, matchup log, or franchise document you requested does not exist in the AFFL custody registry.
          </p>
        </div>

        <div className="pt-2 flex flex-col gap-2.5 font-mono text-xs">
          <Link
            href="/"
            className="flex items-center justify-center gap-2 rounded-xl bg-brand-blue px-4 py-2.5 font-bold text-white shadow-lg hover:bg-brand-blue/90 transition-colors"
          >
            <Home className="w-4 h-4" />
            <span>Return to Archive Citadel</span>
          </Link>

          <div className="grid grid-cols-2 gap-2 pt-2">
            <Link
              href="/franchises"
              className="flex items-center justify-center gap-1.5 rounded-xl border border-rule bg-card-elevated px-3 py-2 text-ink hover:text-brand-blue hover:border-brand-blue transition-colors"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Franchises</span>
            </Link>
            <Link
              href="/stats"
              className="flex items-center justify-center gap-1.5 rounded-xl border border-rule bg-card-elevated px-3 py-2 text-ink hover:text-brand-blue hover:border-brand-blue transition-colors"
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Stat Tracker</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

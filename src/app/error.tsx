"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Runtime client error:", error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 py-16 text-center">
      <div className="max-w-md w-full glass-card rounded-2xl p-8 border border-rule space-y-6 shadow-2xl">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 shadow-lg">
          <AlertTriangle className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="text-[11px] font-mono uppercase tracking-widest text-rose-400 font-bold">
            Application Exception
          </span>
          <h1 className="font-display text-2xl sm:text-3xl font-black text-ink uppercase tracking-tight">
            Data Stream Interrupted
          </h1>
          <p className="text-xs sm:text-sm text-ink-muted leading-relaxed font-sans">
            An unexpected error occurred while processing this analytical view. You can reload the ledger or return to the archive citadel.
          </p>
        </div>

        <div className="pt-2 flex flex-col gap-2.5 font-mono text-xs">
          <button
            onClick={() => reset()}
            className="flex items-center justify-center gap-2 rounded-xl bg-brand-blue px-4 py-2.5 font-bold text-white shadow-lg hover:bg-brand-blue/90 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Retry Ledger Query</span>
          </button>

          <Link
            href="/"
            className="flex items-center justify-center gap-2 rounded-xl border border-rule bg-card-elevated px-4 py-2 text-ink hover:text-brand-blue hover:border-brand-blue transition-colors"
          >
            <Home className="w-4 h-4" />
            <span>Return to Archive Citadel</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

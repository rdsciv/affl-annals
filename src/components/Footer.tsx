import Link from "next/link";
import { Database, Lock, Terminal } from "lucide-react";
import Seal from "@/components/Seal";

export default function Footer() {
  return (
    <footer className="w-full border-t border-rule bg-canvas-subtle py-10 text-xs text-ink-dim">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2.5 text-ink">
              <Seal size={36} />
              <span className="font-display text-lg font-bold tracking-wider uppercase">AFFL Annals</span>
            </div>
            <p className="text-[11px] leading-relaxed text-ink-muted">
              The permanent statistical archive of the AFFL. Uniting 2014–2025 league custody,
              matchups, and rosters with NFL play-by-play and opportunity modeling.
            </p>
          </div>

          <div>
            <h4 className="font-mono text-ink font-semibold uppercase tracking-wider text-[11px] mb-3">
              Surfaces
            </h4>
            <ul className="space-y-2 text-[11px]">
              <li><Link href="/explore" className="hover:text-ink">/explore (Savant Query Builder)</Link></li>
              <li><Link href="/players" className="hover:text-ink">Player Custody Profiles</Link></li>
              <li><Link href="/franchises" className="hover:text-ink">Franchise Histories & Marks</Link></li>
              <li><Link href="/seasons" className="hover:text-ink">Historical Seasons & 2026 Field</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-mono text-ink font-semibold uppercase tracking-wider text-[11px] mb-3">
              Ledgers & Records
            </h4>
            <ul className="space-y-2 text-[11px]">
              <li><Link href="/drafts" className="hover:text-ink">Draft Auction Values & PAR</Link></li>
              <li><Link href="/trades" className="hover:text-ink">Trade Ledger & Realized Alpha</Link></li>
              <li><Link href="/records" className="hover:text-ink">All-Time League Record Book</Link></li>
              <li><Link href="/methodology" className="hover:text-ink">Methodology & Provenance</Link></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="font-mono text-ink font-semibold uppercase tracking-wider text-[11px] mb-3">
              Canonical Metadata
            </h4>
            <div className="flex items-center gap-2 text-[10px]">
              <Database className="h-3.5 w-3.5 text-brand-lime" />
              <span>Dataset: v1.0.0 (affl.db + nfl.duckdb)</span>
            </div>
            <div className="flex items-center gap-2 text-[10px]">
              <Lock className="h-3.5 w-3.5 text-brand-yellow" />
              <span>Scoring: Standard Non-PPR (0 PPR)</span>
            </div>
            <div className="flex items-center gap-2 text-[10px]">
              <Terminal className="h-3.5 w-3.5 text-brand-orange" />
              <span>WASM-Engine: DuckDB In-Browser</span>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-rule flex flex-col md:flex-row items-center justify-between gap-4 text-[10px]">
          <p>© 2014–2026 AFFL Annals. Approved league blueprint. All franchise marks and identities canonical.</p>
          <p>Powered by nflverse, ESPN historical endpoints, and DuckDB analytics.</p>
        </div>
      </div>
    </footer>
  );
}

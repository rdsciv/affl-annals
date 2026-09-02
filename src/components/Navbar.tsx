"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sparkles,
  Search,
  Users,
  Shield,
  Calendar,
  ListOrdered,
  Repeat,
  Trophy,
  BookOpen,
  Award,
  ChevronDown,
  Layers,
  Activity,
  Menu,
  X,
  Flame,
  Bookmark
} from "lucide-react";
import Seal from "@/components/Seal";

export default function Navbar() {
  const pathname = usePathname();
  const [analyticsOpen, setAnalyticsOpen] = useState(false);
  const [annalsOpen, setAnnalsOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const analyticsRef = useRef<HTMLDivElement>(null);
  const annalsRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (analyticsRef.current && !analyticsRef.current.contains(event.target as Node)) {
        setAnalyticsOpen(false);
      }
      if (annalsRef.current && !annalsRef.current.contains(event.target as Node)) {
        setAnnalsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close dropdowns on route change
  useEffect(() => {
    setAnalyticsOpen(false);
    setAnnalsOpen(false);
    setMobileMenuOpen(false);
  }, [pathname]);

  const isAnalyticsActive = pathname.startsWith("/stats") || pathname.startsWith("/luck") || pathname.startsWith("/points") || pathname.startsWith("/records/roto");
  const isAnnalsActive = pathname.startsWith("/seasons") || (pathname.startsWith("/records") && !pathname.startsWith("/records/roto")) || pathname.startsWith("/drafts") || pathname.startsWith("/trades");

  return (
    <header className="sticky top-0 z-50 w-full border-b border-rule bg-canvas/95 backdrop-blur-md">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Brand Logo & Title */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-3.5 group">
            <Seal size={48} className="shrink-0 transition-transform duration-200 group-hover:scale-105" />
            <div className="flex flex-col">
              <span className="font-display text-2xl sm:text-3xl font-black tracking-wider text-ink uppercase leading-none group-hover:text-brand-blue transition-colors">
                AFFL ANNALS
              </span>
              <span className="text-[10px] font-mono font-bold text-ink-dim tracking-wider uppercase mt-1">
                2014–2025 Canonical Archive
              </span>
            </div>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1.5 text-xs font-semibold">
          
          {/* Explore / Query Engine */}
          <Link
            href="/explore"
            className={`flex items-center gap-1.5 rounded-lg px-3.5 py-2 transition-all ${
              pathname.startsWith("/explore")
                ? "bg-card-elevated text-brand-blue border border-rule-bright font-bold"
                : "text-ink-muted hover:bg-card-hover hover:text-ink"
            }`}
          >
            <Sparkles className="h-4 w-4 text-brand-blue" />
            <span>Explore</span>
          </Link>

          {/* Analytics Hub Dropdown */}
          <div className="relative" ref={analyticsRef}>
            <button
              onClick={() => {
                setAnalyticsOpen(!analyticsOpen);
                setAnnalsOpen(false);
              }}
              className={`flex items-center gap-1.5 rounded-lg px-3.5 py-2 transition-all ${
                isAnalyticsActive
                  ? "bg-card-elevated text-brand-blue border border-rule-bright font-bold"
                  : "text-ink-muted hover:bg-card-hover hover:text-ink"
              }`}
            >
              <Activity className="h-4 w-4 text-brand-lime" />
              <span>Analytics</span>
              <ChevronDown className={`h-3.5 w-3.5 transition-transform ${analyticsOpen ? "rotate-180 text-brand-blue" : "opacity-60"}`} />
            </button>

            {analyticsOpen && (
              <div className="absolute left-0 mt-2 w-64 rounded-xl border border-rule-bright bg-card/95 p-2 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 space-y-1">
                <Link
                  href="/stats"
                  className="flex items-start gap-2.5 rounded-lg p-2.5 hover:bg-card-elevated transition-colors group"
                >
                  <Flame className="h-4 w-4 text-brand-orange mt-0.5 shrink-0" />
                  <div>
                    <div className="font-semibold text-ink group-hover:text-brand-orange text-xs">Franchise Stat Tracker</div>
                    <p className="text-[10px] text-ink-dim leading-tight">Annual passing, rushing & receiving advanced metrics</p>
                  </div>
                </Link>

                <Link
                  href="/luck"
                  className="flex items-start gap-2.5 rounded-lg p-2.5 hover:bg-card-elevated transition-colors group"
                >
                  <Sparkles className="h-4 w-4 text-brand-blue mt-0.5 shrink-0" />
                  <div>
                    <div className="font-semibold text-ink group-hover:text-brand-blue text-xs">Luck & Skill Engine</div>
                    <p className="text-[10px] text-ink-dim leading-tight">Schedule luck simulations & All-Play matrix</p>
                  </div>
                </Link>

                <Link
                  href="/points"
                  className="flex items-start gap-2.5 rounded-lg p-2.5 hover:bg-card-elevated transition-colors group"
                >
                  <Layers className="h-4 w-4 text-brand-lime mt-0.5 shrink-0" />
                  <div>
                    <div className="font-semibold text-ink group-hover:text-brand-lime text-xs">Where Points Came From</div>
                    <p className="text-[10px] text-ink-dim leading-tight">Drafted, Waiver Wire & Free Agency points</p>
                  </div>
                </Link>

                <Link
                  href="/records/roto"
                  className="flex items-start gap-2.5 rounded-lg p-2.5 hover:bg-card-elevated transition-colors group"
                >
                  <Award className="h-4 w-4 text-brand-yellow mt-0.5 shrink-0" />
                  <div>
                    <div className="font-semibold text-ink group-hover:text-brand-yellow text-xs">10-Category Roto Radar</div>
                    <p className="text-[10px] text-ink-dim leading-tight">Fantasy Genius Passing, Rushing & Receiving radar</p>
                  </div>
                </Link>
              </div>
            )}
          </div>

          {/* Annals Hub Dropdown */}
          <div className="relative" ref={annalsRef}>
            <button
              onClick={() => {
                setAnnalsOpen(!annalsOpen);
                setAnalyticsOpen(false);
              }}
              className={`flex items-center gap-1.5 rounded-lg px-3.5 py-2 transition-all ${
                isAnnalsActive
                  ? "bg-card-elevated text-brand-blue border border-rule-bright font-bold"
                  : "text-ink-muted hover:bg-card-hover hover:text-ink"
              }`}
            >
              <Bookmark className="h-4 w-4 text-brand-yellow" />
              <span>Annals</span>
              <ChevronDown className={`h-3.5 w-3.5 transition-transform ${annalsOpen ? "rotate-180 text-brand-blue" : "opacity-60"}`} />
            </button>

            {annalsOpen && (
              <div className="absolute left-0 mt-2 w-64 rounded-xl border border-rule-bright bg-card/95 p-2 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 space-y-1">
                <Link
                  href="/seasons"
                  className="flex items-start gap-2.5 rounded-lg p-2.5 hover:bg-card-elevated transition-colors group"
                >
                  <Calendar className="h-4 w-4 text-brand-blue mt-0.5 shrink-0" />
                  <div>
                    <div className="font-semibold text-ink group-hover:text-brand-blue text-xs">Seasons Chronicle</div>
                    <p className="text-[10px] text-ink-dim leading-tight">12 competition eras (2014–2025)</p>
                  </div>
                </Link>

                <Link
                  href="/records"
                  className="flex items-start gap-2.5 rounded-lg p-2.5 hover:bg-card-elevated transition-colors group"
                >
                  <Trophy className="h-4 w-4 text-brand-yellow mt-0.5 shrink-0" />
                  <div>
                    <div className="font-semibold text-ink group-hover:text-brand-yellow text-xs">All-Time Record Book</div>
                    <p className="text-[10px] text-ink-dim leading-tight">Titles, scoring outbursts & milestones</p>
                  </div>
                </Link>

                <Link
                  href="/drafts"
                  className="flex items-start gap-2.5 rounded-lg p-2.5 hover:bg-card-elevated transition-colors group"
                >
                  <ListOrdered className="h-4 w-4 text-brand-lime mt-0.5 shrink-0" />
                  <div>
                    <div className="font-semibold text-ink group-hover:text-brand-lime text-xs">Auction & Draft Economics</div>
                    <p className="text-[10px] text-ink-dim leading-tight">$200 spend allocation, steals & busts</p>
                  </div>
                </Link>

                <Link
                  href="/trades"
                  className="flex items-start gap-2.5 rounded-lg p-2.5 hover:bg-card-elevated transition-colors group"
                >
                  <Repeat className="h-4 w-4 text-brand-orange mt-0.5 shrink-0" />
                  <div>
                    <div className="font-semibold text-ink group-hover:text-brand-orange text-xs">Trades Register</div>
                    <p className="text-[10px] text-ink-dim leading-tight">221 verified bilateral player swaps</p>
                  </div>
                </Link>
              </div>
            )}
          </div>

          {/* Franchises */}
          <Link
            href="/franchises"
            className={`flex items-center gap-1.5 rounded-lg px-3.5 py-2 transition-all ${
              pathname.startsWith("/franchises")
                ? "bg-card-elevated text-brand-blue border border-rule-bright font-bold"
                : "text-ink-muted hover:bg-card-hover hover:text-ink"
            }`}
          >
            <Shield className="h-4 w-4" />
            <span>Franchises</span>
          </Link>

          {/* Players */}
          <Link
            href="/players"
            className={`flex items-center gap-1.5 rounded-lg px-3.5 py-2 transition-all ${
              pathname.startsWith("/players")
                ? "bg-card-elevated text-brand-blue border border-rule-bright font-bold"
                : "text-ink-muted hover:bg-card-hover hover:text-ink"
            }`}
          >
            <Users className="h-4 w-4" />
            <span>Players</span>
          </Link>

          {/* Methodology */}
          <Link
            href="/methodology"
            className={`flex items-center gap-1.5 rounded-lg px-3.5 py-2 transition-all ${
              pathname.startsWith("/methodology")
                ? "bg-card-elevated text-brand-blue border border-rule-bright font-bold"
                : "text-ink-muted hover:bg-card-hover hover:text-ink"
            }`}
          >
            <BookOpen className="h-4 w-4" />
            <span>Methodology</span>
          </Link>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {/* Omnibox Trigger */}
          <button
            onClick={() => window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", metaKey: true }))}
            className="flex items-center gap-2 rounded-lg bg-card-elevated px-3.5 py-2 text-xs text-ink-muted border border-rule hover:border-brand-blue hover:text-ink transition-all shadow-md"
          >
            <Search className="h-3.5 w-3.5 text-brand-blue" />
            <span className="hidden sm:inline">Search annals...</span>
            <kbd className="hidden sm:inline-block font-mono text-[9px] bg-card px-1.5 py-0.5 rounded text-ink-dim border border-rule">
              ⌘K
            </kbd>
          </button>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden rounded-lg bg-card-elevated p-2.5 text-ink-muted hover:text-ink border border-rule"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-rule bg-card px-4 py-4 space-y-4">
          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            <Link href="/stats" className="p-3 rounded-lg bg-card-elevated border border-rule text-ink flex items-center gap-2">
              <Flame className="h-4 w-4 text-brand-orange" />
              <span>Stat Tracker</span>
            </Link>
            <Link href="/explore" className="p-3 rounded-lg bg-card-elevated border border-rule text-ink flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-brand-blue" />
              <span>Explore</span>
            </Link>
            <Link href="/luck" className="p-3 rounded-lg bg-card-elevated border border-rule text-ink flex items-center gap-2">
              <Activity className="h-4 w-4 text-brand-lime" />
              <span>Luck & Skill</span>
            </Link>
            <Link href="/points" className="p-3 rounded-lg bg-card-elevated border border-rule text-ink flex items-center gap-2">
              <Layers className="h-4 w-4 text-brand-lime" />
              <span>Points</span>
            </Link>
            <Link href="/records/roto" className="p-3 rounded-lg bg-card-elevated border border-rule text-ink flex items-center gap-2">
              <Award className="h-4 w-4 text-brand-yellow" />
              <span>Roto Radar</span>
            </Link>
            <Link href="/seasons" className="p-3 rounded-lg bg-card-elevated border border-rule text-ink flex items-center gap-2">
              <Calendar className="h-4 w-4 text-brand-blue" />
              <span>Seasons</span>
            </Link>
            <Link href="/records" className="p-3 rounded-lg bg-card-elevated border border-rule text-ink flex items-center gap-2">
              <Trophy className="h-4 w-4 text-brand-yellow" />
              <span>Records</span>
            </Link>
            <Link href="/drafts" className="p-3 rounded-lg bg-card-elevated border border-rule text-ink flex items-center gap-2">
              <ListOrdered className="h-4 w-4 text-brand-lime" />
              <span>Drafts</span>
            </Link>
            <Link href="/trades" className="p-3 rounded-lg bg-card-elevated border border-rule text-ink flex items-center gap-2">
              <Repeat className="h-4 w-4 text-brand-orange" />
              <span>Trades</span>
            </Link>
            <Link href="/franchises" className="p-3 rounded-lg bg-card-elevated border border-rule text-ink flex items-center gap-2">
              <Shield className="h-4 w-4 text-ink-muted" />
              <span>Franchises</span>
            </Link>
            <Link href="/players" className="p-3 rounded-lg bg-card-elevated border border-rule text-ink flex items-center gap-2">
              <Users className="h-4 w-4 text-ink-muted" />
              <span>Players</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

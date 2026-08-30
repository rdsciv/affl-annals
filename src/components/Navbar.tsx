"use client";

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
  BookOpen 
} from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();

  const links = [
    { href: "/explore", label: "Explore", icon: Search, badge: "Savant Engine" },
    { href: "/players", label: "Players", icon: Users },
    { href: "/franchises", label: "Franchises", icon: Shield },
    { href: "/seasons", label: "Seasons", icon: Calendar },
    { href: "/drafts", label: "Drafts", icon: ListOrdered },
    { href: "/trades", label: "Trades", icon: Repeat },
    { href: "/records", label: "Records", icon: Trophy },
    { href: "/methodology", label: "Methodology", icon: BookOpen },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-rule bg-canvas/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-brand-blue to-brand-lime font-mono text-base font-black text-black shadow-lg shadow-brand-blue/20 group-hover:scale-105 transition-transform">
              AS
            </div>
            <div className="flex flex-col">
              <span className="font-mono text-sm font-bold tracking-wider text-ink group-hover:text-brand-blue transition-colors">
                AFFL SAVANT
              </span>
              <span className="text-[10px] font-medium text-ink-dim tracking-tight">
                2014–2025 CANONICAL ARCHIVE
              </span>
            </div>
          </Link>
        </div>

        <nav className="hidden md:flex items-center gap-1">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
                  isActive
                    ? "bg-card-elevated text-brand-blue border border-rule-bright"
                    : "text-ink-muted hover:bg-card-hover hover:text-ink"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{link.label}</span>
                {link.badge && (
                  <span className="rounded bg-brand-blue/15 px-1.5 py-0.5 text-[9px] font-bold text-brand-blue uppercase tracking-wider">
                    {link.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/explore"
            className="flex items-center gap-2 rounded-md bg-brand-blue px-3.5 py-1.5 text-xs font-semibold text-canvas hover:bg-brand-blue/90 shadow-sm transition-all"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Query Savant</span>
          </Link>
        </div>
      </div>
    </header>
  );
}

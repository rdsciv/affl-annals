"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { 
  Search, 
  Shield, 
  Users, 
  Calendar, 
  Trophy, 
  Sparkles, 
  Repeat, 
  ListOrdered, 
  BookOpen, 
  ArrowRight,
  X
} from "lucide-react";
import { CANONICAL_FRANCHISES } from "@/lib/constants";
import { fetchMartJson } from "@/lib/api";

interface SearchItem {
  id: string;
  title: string;
  subtitle: string;
  category: "Franchise" | "Season" | "Player" | "Page" | "Record";
  url: string;
  color?: string;
}

export default function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [players, setPlayers] = useState<SearchItem[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Listen for keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery("");
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Load player search index lazily
  useEffect(() => {
    async function loadSearchIndex() {
      try {
        const custodyData = await fetchMartJson("mart_affl_player_season_custody.json");
        const playerMap = new Map<string, SearchItem>();
        for (const r of custodyData || []) {
          const key = r.gsis_id || r.player_name;
          if (!playerMap.has(key)) {
            playerMap.set(key, {
              id: key,
              title: r.player_name,
              subtitle: `${r.position} · ${r.franchise_name}`,
              category: "Player",
              url: `/players/${encodeURIComponent(r.gsis_id || r.player_name)}`,
            });
          }
        }
        setPlayers(Array.from(playerMap.values()).slice(0, 300));
      } catch (err) {
        console.error("Error loading search index:", err);
      }
    }
    if (isOpen && players.length === 0) {
      loadSearchIndex();
    }
  }, [isOpen, players.length]);

  // Static Items
  const staticItems: SearchItem[] = [
    { id: "p-explore", title: "/explore Savant Query Builder", subtitle: "Query NFL & AFFL custody dimensions", category: "Page", url: "/explore" },
    { id: "p-luck", title: "Luck & Skill Analytics", subtitle: "Schedule luck simulations, All-Play ledger, lineup efficiency", category: "Page", url: "/luck" },
    { id: "p-records", title: "Canonical Record Book", subtitle: "Championships, Win Pct, All-Time Leaders", category: "Record", url: "/records" },
    { id: "p-drafts", title: "Draft & Auction Value", subtitle: "2014–2025 Auction spend, Draft PAR, steals & busts", category: "Page", url: "/drafts" },
    { id: "p-trades", title: "Trade Ledger", subtitle: "221 verified bilateral player swaps", category: "Page", url: "/trades" },
    { id: "p-seasons", title: "All Seasons Archive", subtitle: "12 competition eras (2014–2025)", category: "Page", url: "/seasons" },
    { id: "p-franchises", title: "All Franchises & Head-to-Head", subtitle: "12 active clubs and rivalry records", category: "Page", url: "/franchises" },
    { id: "p-methodology", title: "Methodology & Scoring System", subtitle: "Non-PPR rules, FHMM recovery, evidence tiers", category: "Page", url: "/methodology" },
    
    // Franchises
    ...CANONICAL_FRANCHISES.map((f) => ({
      id: f.franchise_id,
      title: f.display_name,
      subtitle: `Owner: ${f.owner_display_name} (${f.first_season}–2026)`,
      category: "Franchise" as const,
      url: `/franchises/${f.franchise_id}`,
      color: f.primary_color,
    })),

    // Seasons
    ...Array.from({ length: 12 }, (_, i) => 2025 - i).map((yr) => ({
      id: `season-${yr}`,
      title: `${yr} AFFL Season`,
      subtitle: `Standings, matchups, playoffs & evidence`,
      category: "Season" as const,
      url: `/seasons/${yr}`,
    })),
  ];

  const allItems = [...staticItems, ...players];

  const filteredItems = query
    ? allItems.filter(
        (item) =>
          item.title.toLowerCase().includes(query.toLowerCase()) ||
          item.subtitle.toLowerCase().includes(query.toLowerCase()) ||
          item.category.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 10)
    : staticItems.slice(0, 8);

  const handleSelect = (item: SearchItem) => {
    setIsOpen(false);
    router.push(item.url);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % filteredItems.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % filteredItems.length);
    } else if (e.key === "Enter" && filteredItems[selectedIndex]) {
      e.preventDefault();
      handleSelect(filteredItems[selectedIndex]);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="w-full max-w-xl rounded-2xl bg-card border border-rule-bright shadow-2xl overflow-hidden flex flex-col max-h-[75vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Header */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-rule bg-card-elevated">
          <Search className="h-4 w-4 text-brand-blue shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Search players, franchises, seasons, records, or pages... (Esc to close)"
            className="flex-1 bg-transparent text-sm text-ink placeholder-ink-dim focus:outline-none"
          />
          <button
            onClick={() => setIsOpen(false)}
            className="rounded p-1 text-ink-dim hover:text-ink hover:bg-card-hover"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-2 divide-y divide-rule/30">
          {filteredItems.length === 0 ? (
            <div className="py-12 text-center text-xs font-mono text-ink-dim">
              No matching records found for &ldquo;{query}&rdquo;.
            </div>
          ) : (
            filteredItems.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer transition-all ${
                    isSelected ? "bg-brand-blue/15 text-brand-blue" : "hover:bg-card-hover text-ink"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="shrink-0">
                      {item.category === "Franchise" && (
                        <div
                          className="h-3.5 w-3.5 rounded-full"
                          style={{ backgroundColor: item.color || "#5b87ac" }}
                        />
                      )}
                      {item.category === "Player" && <Users className="h-4 w-4 text-brand-lime" />}
                      {item.category === "Season" && <Calendar className="h-4 w-4 text-brand-orange" />}
                      {item.category === "Record" && <Trophy className="h-4 w-4 text-brand-yellow" />}
                      {item.category === "Page" && <Sparkles className="h-4 w-4 text-brand-blue" />}
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-xs truncate">{item.title}</div>
                      <div className="text-[11px] text-ink-muted truncate">{item.subtitle}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-mono text-[9px] uppercase px-1.5 py-0.5 rounded bg-card-elevated text-ink-dim border border-rule">
                      {item.category}
                    </span>
                    <ArrowRight className={`h-3 w-3 ${isSelected ? "text-brand-blue" : "text-transparent"}`} />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="flex items-center justify-between px-4 py-2 bg-card-elevated/70 border-t border-rule text-[10px] font-mono text-ink-dim">
          <div className="flex items-center gap-3">
            <span><kbd className="bg-card px-1.5 py-0.5 rounded border border-rule">↑↓</kbd> Navigate</span>
            <span><kbd className="bg-card px-1.5 py-0.5 rounded border border-rule">↵</kbd> Select</span>
            <span><kbd className="bg-card px-1.5 py-0.5 rounded border border-rule">Esc</kbd> Close</span>
          </div>
          <span>AFFL Omnibox</span>
        </div>
      </div>
    </div>
  );
}

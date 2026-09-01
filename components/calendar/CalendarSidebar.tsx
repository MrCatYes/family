"use client";

import { useState } from "react";
import { ChevronDown, SlidersHorizontal } from "lucide-react";
import { EVENT_CATEGORIES } from "@/lib/categories";
import type { EventCategory, Profile } from "@/types/database";

export function CalendarSidebar({
  profiles,
  showCustody,
  onToggleCustody,
  activeCategories,
  onToggleCategory,
}: {
  profiles: Profile[];
  showCustody: boolean;
  onToggleCustody: (v: boolean) => void;
  activeCategories: Set<EventCategory>;
  onToggleCategory: (cat: EventCategory) => void;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const content = (
    <>
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Garde</p>
        <label className="flex items-center gap-2 text-sm text-slate-300">
          <input
            type="checkbox"
            checked={showCustody}
            onChange={(e) => onToggleCustody(e.target.checked)}
            className="rounded border-white/20 bg-transparent"
          />
          Afficher la garde
        </label>
        <div className="mt-2 space-y-1">
          {profiles.map((p) => (
            <div key={p.id} className="flex items-center gap-2 text-xs text-slate-400">
              <span className="h-3 w-3 rounded-sm" style={{ backgroundColor: p.color }} />
              {p.display_name}
            </div>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
          Types d&apos;événements
        </p>
        <div className="space-y-1">
          {(Object.keys(EVENT_CATEGORIES) as EventCategory[]).map((cat) => (
            <label key={cat} className="flex items-center gap-2 text-sm text-slate-300">
              <input
                type="checkbox"
                checked={activeCategories.has(cat)}
                onChange={() => onToggleCategory(cat)}
                className="rounded border-white/20 bg-transparent"
              />
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: EVENT_CATEGORIES[cat].color }}
              />
              {EVENT_CATEGORIES[cat].label}
            </label>
          ))}
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile: collapsible filters bar above the calendar */}
      <div className="border-b border-white/5 md:hidden">
        <button
          onClick={() => setMobileOpen((v) => !v)}
          className="flex w-full items-center justify-between px-4 py-3 text-sm text-slate-300"
        >
          <span className="flex items-center gap-2">
            <SlidersHorizontal size={14} /> Filtres
          </span>
          <ChevronDown size={16} className={`transition-transform ${mobileOpen ? "rotate-180" : ""}`} />
        </button>
        {mobileOpen && <div className="space-y-6 px-4 pb-4">{content}</div>}
      </div>

      {/* Desktop: permanent sidebar */}
      <aside className="hidden w-56 shrink-0 space-y-6 border-r border-white/5 p-4 md:block">{content}</aside>
    </>
  );
}

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
  return (
    <aside className="w-56 shrink-0 space-y-6 border-r border-white/5 p-4">
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
    </aside>
  );
}

import { getMonthGrid, toISODate, WEEKDAY_LABELS } from "@/lib/dates";
import { getCustodyParentId } from "@/lib/custody";
import type { CustodyOverride, CustodyPattern, FamilyEvent, Profile } from "@/types/database";
import { DayCell } from "./DayCell";

export function MonthGrid({
  monthDate,
  events,
  profiles,
  custodyPattern,
  custodyOverrides,
  showCustody,
  onSelectDay,
  onSelectEvent,
}: {
  monthDate: Date;
  events: FamilyEvent[];
  profiles: Profile[];
  custodyPattern: CustodyPattern | null;
  custodyOverrides: CustodyOverride[];
  showCustody: boolean;
  onSelectDay: (date: Date) => void;
  onSelectEvent: (event: FamilyEvent) => void;
}) {
  const days = getMonthGrid(monthDate);
  const profileMap = new Map(profiles.map((p) => [p.id, p]));

  const custodyByDay = days.map((day) =>
    showCustody ? getCustodyParentId(day, custodyPattern, custodyOverrides) : null
  );

  return (
    <div className="flex flex-1 flex-col overflow-hidden rounded-xl border border-white/5">
      <div className="grid grid-cols-7 border-b border-white/5 bg-white/5">
        {WEEKDAY_LABELS.map((label) => (
          <div key={label} className="px-2 py-2 text-center text-xs font-medium text-slate-400">
            {label}
          </div>
        ))}
      </div>
      <div className="grid flex-1 grid-cols-7 grid-rows-6 overflow-y-auto">
        {days.map((day, idx) => {
          const dayISO = toISODate(day);
          const dayEvents = events.filter((e) => {
            const startISO = e.start_at.slice(0, 10);
            const endISO = e.end_at.slice(0, 10);
            return startISO <= dayISO && endISO >= dayISO;
          });
          const custodyParentId = custodyByDay[idx];
          const prevCustodyParentId = idx > 0 ? custodyByDay[idx - 1] : null;
          return (
            <DayCell
              key={dayISO}
              date={day}
              monthDate={monthDate}
              custodyParent={custodyParentId ? profileMap.get(custodyParentId) ?? null : null}
              showCustodyLabel={custodyParentId !== prevCustodyParentId}
              events={dayEvents}
              onSelectDay={onSelectDay}
              onSelectEvent={onSelectEvent}
            />
          );
        })}
      </div>
    </div>
  );
}

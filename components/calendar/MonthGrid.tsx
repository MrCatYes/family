import { getMonthGrid, toISODate, WEEKDAY_LABELS } from "@/lib/dates";
import { getCustodyForDay } from "@/lib/custody";
import type { CustodyOverride, CustodyPattern, FamilyEvent, Profile } from "@/types/database";
import { DayCell } from "./DayCell";

export function MonthGrid({
  monthDate,
  events,
  profiles,
  custodyPattern,
  custodyOverrides,
  showCustody,
  dragRange,
  onSelectDay,
  onSelectEvent,
  onCellMouseDown,
  onCellMouseEnter,
}: {
  monthDate: Date;
  events: FamilyEvent[];
  profiles: Profile[];
  custodyPattern: CustodyPattern | null;
  custodyOverrides: CustodyOverride[];
  showCustody: boolean;
  /** Normalized (start <= end) ISO date range currently being drag-selected, if any. */
  dragRange: { start: string; end: string } | null;
  onSelectDay: (date: Date) => void;
  onSelectEvent: (event: FamilyEvent) => void;
  onCellMouseDown: (date: Date, clientX: number, clientY: number, fromBand: boolean) => void;
  onCellMouseEnter: (date: Date) => void;
}) {
  const days = getMonthGrid(monthDate);
  const profileMap = new Map(profiles.map((p) => [p.id, p]));

  const custodyByDay = days.map((day) =>
    showCustody ? getCustodyForDay(day, custodyPattern, custodyOverrides) : { am: null, pm: null }
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
          const custody = custodyByDay[idx];
          const prev = idx > 0 ? custodyByDay[idx - 1] : null;
          const sameAsPrev = prev !== null && custody.am === prev.am && custody.pm === prev.pm;
          const isInDragRange = dragRange !== null && dayISO >= dragRange.start && dayISO <= dragRange.end;
          return (
            <DayCell
              key={dayISO}
              date={day}
              monthDate={monthDate}
              custodyAm={custody.am ? profileMap.get(custody.am) ?? null : null}
              custodyPm={custody.pm ? profileMap.get(custody.pm) ?? null : null}
              showCustodyLabel={!sameAsPrev}
              events={dayEvents}
              isInDragRange={isInDragRange}
              onSelectDay={onSelectDay}
              onSelectEvent={onSelectEvent}
              onCellMouseDown={onCellMouseDown}
              onCellMouseEnter={onCellMouseEnter}
            />
          );
        })}
      </div>
    </div>
  );
}

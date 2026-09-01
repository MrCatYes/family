import { isSameDay, isInMonth } from "@/lib/dates";
import type { FamilyEvent, Profile } from "@/types/database";
import { EventPill } from "./EventPill";

export function DayCell({
  date,
  monthDate,
  custodyAm,
  custodyPm,
  showCustodyLabel,
  events,
  isInDragRange,
  onSelectDay,
  onSelectEvent,
  onCellMouseDown,
  onCellMouseEnter,
}: {
  date: Date;
  monthDate: Date;
  custodyAm: Profile | null;
  custodyPm: Profile | null;
  showCustodyLabel: boolean;
  events: FamilyEvent[];
  isInDragRange: boolean;
  onSelectDay: (date: Date) => void;
  onSelectEvent: (event: FamilyEvent) => void;
  /** fromBand: true when the gesture started on the custody band (a plain click there toggles custody instead of opening the day panel). */
  onCellMouseDown: (date: Date, clientX: number, clientY: number, fromBand: boolean) => void;
  onCellMouseEnter: (date: Date) => void;
}) {
  const inMonth = isInMonth(date, monthDate);
  const today = isSameDay(date, new Date());
  const isSplit = custodyAm && custodyPm && custodyAm.id !== custodyPm.id;

  return (
    <div
      onMouseDown={(e) => onCellMouseDown(date, e.clientX, e.clientY, false)}
      onMouseEnter={() => onCellMouseEnter(date)}
      className={`flex min-h-28 select-none flex-col border-b border-r border-white/5 ${
        inMonth ? "bg-transparent" : "bg-black/20"
      } ${isInDragRange ? "bg-indigo-500/20 ring-1 ring-inset ring-indigo-400" : ""}`}
    >
      {(custodyAm || custodyPm) && (
        <div
          title="Cliquer pour changer la garde ce jour-là, ou glisser pour créer un événement"
          onMouseDown={(e) => {
            e.stopPropagation();
            onCellMouseDown(date, e.clientX, e.clientY, true);
          }}
          className="flex w-full text-[11px] font-semibold text-white"
        >
          {isSplit ? (
            <>
              <span className="flex-1 truncate px-1.5 py-1 text-left" style={{ backgroundColor: custodyAm!.color }}>
                {showCustodyLabel ? custodyAm!.display_name.slice(0, 1) : " "}
              </span>
              <span className="flex-1 truncate px-1.5 py-1 text-right" style={{ backgroundColor: custodyPm!.color }}>
                {showCustodyLabel ? custodyPm!.display_name.slice(0, 1) : " "}
              </span>
            </>
          ) : (
            <span
              className="flex-1 truncate px-2 py-1 text-left"
              style={{ backgroundColor: (custodyAm ?? custodyPm)!.color }}
            >
              {showCustodyLabel ? (custodyAm ?? custodyPm)!.display_name : " "}
            </span>
          )}
        </div>
      )}
      <button
        onClick={() => onSelectDay(date)}
        className={`flex items-center justify-between px-2 pt-1 text-left ${
          inMonth ? "text-slate-300" : "text-slate-600"
        }`}
      >
        <span
          className={`text-xs ${
            today ? "flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-white" : ""
          }`}
        >
          {date.getDate()}
        </span>
      </button>
      <div className="flex flex-1 flex-col gap-0.5 px-1.5 py-1">
        {events.slice(0, 3).map((event) => (
          <EventPill key={event.id} event={event} onClick={() => onSelectEvent(event)} />
        ))}
        {events.length > 3 && (
          <button
            onMouseDown={(e) => e.stopPropagation()}
            onClick={() => onSelectDay(date)}
            className="px-1 text-left text-[11px] text-slate-500 hover:text-slate-300"
          >
            +{events.length - 3} de plus
          </button>
        )}
      </div>
    </div>
  );
}

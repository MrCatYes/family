import { isSameDay, isInMonth } from "@/lib/dates";
import type { FamilyEvent, Profile } from "@/types/database";
import { EventPill } from "./EventPill";

export function DayCell({
  date,
  monthDate,
  custodyParent,
  showCustodyLabel,
  events,
  onSelectDay,
  onSelectEvent,
}: {
  date: Date;
  monthDate: Date;
  custodyParent: Profile | null;
  showCustodyLabel: boolean;
  events: FamilyEvent[];
  onSelectDay: (date: Date) => void;
  onSelectEvent: (event: FamilyEvent) => void;
}) {
  const inMonth = isInMonth(date, monthDate);
  const today = isSameDay(date, new Date());

  return (
    <div
      className={`flex min-h-28 flex-col border-b border-r border-white/5 ${
        inMonth ? "bg-transparent" : "bg-black/20"
      }`}
    >
      {custodyParent && (
        <div
          className="px-2 py-1 text-[11px] font-semibold text-white"
          style={{ backgroundColor: custodyParent.color }}
        >
          {showCustodyLabel ? custodyParent.display_name : " "}
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

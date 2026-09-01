import { EVENT_CATEGORIES } from "@/lib/categories";
import type { FamilyEvent } from "@/types/database";

export function EventPill({
  event,
  onClick,
}: {
  event: FamilyEvent;
  onClick?: () => void;
}) {
  const color = event.color || EVENT_CATEGORIES[event.category].color;
  return (
    <button
      onClick={onClick}
      title={event.title}
      className="block w-full truncate rounded px-1.5 py-0.5 text-left text-[11px] font-medium leading-tight hover:opacity-80"
      style={{ backgroundColor: color, color: "#fff" }}
    >
      {event.title}
    </button>
  );
}

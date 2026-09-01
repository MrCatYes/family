import { differenceInCalendarDays, parseISO, startOfWeek } from "date-fns";
import type { CustodyOverride, CustodyPattern } from "@/types/database";
import { toISODate } from "@/lib/dates";

function floorMod(n: number, m: number): number {
  return ((n % m) + m) % m;
}

export type CustodyDayResult = {
  /** Parent with custody in the morning (or all day, for a non-split day). */
  am: string | null;
  /** Parent with custody in the afternoon/evening (or all day, for a non-split day). */
  pm: string | null;
};

/**
 * Determines which parent(s) have custody on a given day, combining the recurring
 * pattern (simple day-count alternation, or a multi-week day-of-week template — which
 * can mark a day as a half-day transfer, e.g. "Papa AM / Maman PM") with any one-off
 * overrides (e.g. a swapped day). Both am and pm are null if no pattern is configured.
 */
export function getCustodyForDay(
  date: Date,
  pattern: CustodyPattern | null,
  overrides: CustodyOverride[]
): CustodyDayResult {
  const iso = toISODate(date);
  const override = overrides.find((o) => o.date === iso);
  if (override) return { am: override.parent_id, pm: override.parent_id };

  if (!pattern) return { am: null, pm: null };

  if (pattern.pattern_type === "weekly_template") {
    const weeks = pattern.weekly_template?.weeks;
    if (!weeks || weeks.length === 0) return { am: null, pm: null };
    const start = parseISO(pattern.start_date);
    // Align to real (Sunday-based) calendar weeks so each grid row is one actual week,
    // rather than a raw 7-day block starting on whatever weekday start_date happens to be.
    const weekDiff = differenceInCalendarDays(startOfWeek(date, { weekStartsOn: 0 }), startOfWeek(start, { weekStartsOn: 0 })) / 7;
    const weekIndex = floorMod(weekDiff, weeks.length);
    const dayOfWeek = date.getDay();
    const who = weeks[weekIndex]?.[dayOfWeek];
    if (!who) return { am: null, pm: null };
    switch (who) {
      case "a":
        return { am: pattern.parent_a_id, pm: pattern.parent_a_id };
      case "b":
        return { am: pattern.parent_b_id, pm: pattern.parent_b_id };
      case "a-b":
        return { am: pattern.parent_a_id, pm: pattern.parent_b_id };
      case "b-a":
        return { am: pattern.parent_b_id, pm: pattern.parent_a_id };
    }
  }

  const start = parseISO(pattern.start_date);
  const diff = differenceInCalendarDays(date, start);
  const cycleIndex = floorMod(Math.floor(diff / pattern.cycle_days), 2);
  const who = cycleIndex === 0 ? pattern.parent_a_id : pattern.parent_b_id;
  return { am: who, pm: who };
}

/** Convenience wrapper returning the morning (primary) parent for a day. */
export function getCustodyParentId(
  date: Date,
  pattern: CustodyPattern | null,
  overrides: CustodyOverride[]
): string | null {
  return getCustodyForDay(date, pattern, overrides).am;
}

export function isOverrideDay(date: Date, overrides: CustodyOverride[]): boolean {
  const iso = toISODate(date);
  return overrides.some((o) => o.date === iso);
}

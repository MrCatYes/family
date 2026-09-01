import { differenceInCalendarDays, parseISO, startOfWeek } from "date-fns";
import type { CustodyOverride, CustodyPattern } from "@/types/database";
import { toISODate } from "@/lib/dates";

function floorMod(n: number, m: number): number {
  return ((n % m) + m) % m;
}

/**
 * Determines which parent has custody on a given day, combining the recurring
 * pattern (simple day-count alternation, or a multi-week day-of-week template)
 * with any one-off overrides (e.g. a swapped day).
 * Returns null if no pattern has been configured yet.
 */
export function getCustodyParentId(
  date: Date,
  pattern: CustodyPattern | null,
  overrides: CustodyOverride[]
): string | null {
  const iso = toISODate(date);
  const override = overrides.find((o) => o.date === iso);
  if (override) return override.parent_id;

  if (!pattern) return null;

  if (pattern.pattern_type === "weekly_template") {
    const weeks = pattern.weekly_template?.weeks;
    if (!weeks || weeks.length === 0) return null;
    const start = parseISO(pattern.start_date);
    // Align to real (Sunday-based) calendar weeks so each grid row is one actual week,
    // rather than a raw 7-day block starting on whatever weekday start_date happens to be.
    const weekDiff = differenceInCalendarDays(startOfWeek(date, { weekStartsOn: 0 }), startOfWeek(start, { weekStartsOn: 0 })) / 7;
    const weekIndex = floorMod(weekDiff, weeks.length);
    const dayOfWeek = date.getDay();
    const who = weeks[weekIndex]?.[dayOfWeek];
    if (!who) return null;
    return who === "a" ? pattern.parent_a_id : pattern.parent_b_id;
  }

  const start = parseISO(pattern.start_date);
  const diff = differenceInCalendarDays(date, start);
  const cycleIndex = floorMod(Math.floor(diff / pattern.cycle_days), 2);
  return cycleIndex === 0 ? pattern.parent_a_id : pattern.parent_b_id;
}

export function isOverrideDay(date: Date, overrides: CustodyOverride[]): boolean {
  const iso = toISODate(date);
  return overrides.some((o) => o.date === iso);
}

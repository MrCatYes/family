import { differenceInCalendarDays, parseISO } from "date-fns";
import type { CustodyOverride, CustodyPattern } from "@/types/database";
import { toISODate } from "@/lib/dates";

/**
 * Determines which parent has custody on a given day, combining the recurring
 * alternating pattern with any one-off overrides (e.g. a swapped day).
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

  const start = parseISO(pattern.start_date);
  const diff = differenceInCalendarDays(date, start);
  if (diff < 0) {
    // Before the pattern started: extrapolate backwards using the same cycle.
    const cyclesBack = Math.ceil(Math.abs(diff) / pattern.cycle_days);
    const shifted = diff + cyclesBack * pattern.cycle_days * 2;
    const cycleIndex = Math.floor(shifted / pattern.cycle_days) % 2;
    return cycleIndex === 0 ? pattern.parent_a_id : pattern.parent_b_id;
  }

  const cycleIndex = Math.floor(diff / pattern.cycle_days) % 2;
  return cycleIndex === 0 ? pattern.parent_a_id : pattern.parent_b_id;
}

export function isOverrideDay(date: Date, overrides: CustodyOverride[]): boolean {
  const iso = toISODate(date);
  return overrides.some((o) => o.date === iso);
}

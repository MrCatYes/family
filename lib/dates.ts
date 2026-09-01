import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  format,
} from "date-fns";
import { fr } from "date-fns/locale";

export function toISODate(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

export function getMonthGrid(monthDate: Date): Date[] {
  const start = startOfWeek(startOfMonth(monthDate), { weekStartsOn: 0 });
  const end = endOfWeek(endOfMonth(monthDate), { weekStartsOn: 0 });
  return eachDayOfInterval({ start, end });
}

export function isInMonth(day: Date, monthDate: Date): boolean {
  return isSameMonth(day, monthDate);
}

export { isSameDay };

export function formatMonthTitle(date: Date): string {
  const label = format(date, "LLLL yyyy", { locale: fr });
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export function formatDayNumber(date: Date): string {
  return format(date, "d");
}

/**
 * Formats a stored all-day event timestamp (e.g. "2026-08-30T00:00:00.000Z") as a calendar
 * date, ignoring the local timezone offset — parsing the full ISO string with `new Date()`
 * and formatting in local time would shift midnight-UTC timestamps back a day in timezones
 * behind UTC.
 */
export function formatEventDate(isoTimestamp: string, pattern: string): string {
  const datePart = isoTimestamp.slice(0, 10);
  return format(new Date(`${datePart}T00:00:00`), pattern, { locale: fr });
}

export const WEEKDAY_LABELS = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];

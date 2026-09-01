/** A short seed list of common Canadian public holidays, used to pre-fill the calendar. Editable/removable once imported. */
export function getCanadianHolidays(year: number): { title: string; date: string }[] {
  return [
    { title: "Jour de l'An", date: `${year}-01-01` },
    { title: "Fête de la famille", date: nthWeekdayOfMonth(year, 2, 1, 3) },
    { title: "Vendredi saint", date: goodFriday(year) },
    { title: "Fête de la Reine / Journée nationale des patriotes", date: victoriaDay(year) },
    { title: "Fête du Canada", date: `${year}-07-01` },
    { title: "Fête du Travail", date: nthWeekdayOfMonth(year, 9, 1, 1) },
    { title: "Journée nationale de la vérité et de la réconciliation", date: `${year}-09-30` },
    { title: "Action de grâce", date: nthWeekdayOfMonth(year, 10, 1, 2) },
    { title: "Jour du Souvenir", date: `${year}-11-11` },
    { title: "Noël", date: `${year}-12-25` },
    { title: "Lendemain de Noël", date: `${year}-12-26` },
  ];
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

/** nth (1-based) occurrence of weekday (0=Sun..6=Sat) in a given month */
function nthWeekdayOfMonth(year: number, month: number, weekday: number, nth: number): string {
  const first = new Date(year, month - 1, 1);
  const firstWeekday = first.getDay();
  const offset = (weekday - firstWeekday + 7) % 7;
  const day = 1 + offset + (nth - 1) * 7;
  return `${year}-${pad(month)}-${pad(day)}`;
}

/** Last Monday on/before May 24 */
function victoriaDay(year: number): string {
  const target = new Date(year, 4, 24);
  const day = target.getDate() - ((target.getDay() + 6) % 7);
  return `${year}-05-${pad(day)}`;
}

function goodFriday(year: number): string {
  // Meeus/Jones/Butcher algorithm for Easter Sunday, then -2 days.
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  const easter = new Date(year, month - 1, day);
  easter.setDate(easter.getDate() - 2);
  return `${easter.getFullYear()}-${pad(easter.getMonth() + 1)}-${pad(easter.getDate())}`;
}

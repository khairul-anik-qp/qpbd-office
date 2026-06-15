/** Staff shift window — show requests created between 8 AM and 10 PM office-local. */
export const STAFF_SHIFT_START_HOUR = 8;
export const STAFF_SHIFT_END_HOUR = 22;

/** Default IANA zone when the runtime has no client locale (API / tests). */
export const OFFICE_TIMEZONE = "Asia/Dhaka";

type ZonedParts = {
  year: number;
  month: number;
  day: number;
  hour: number;
};

function partsInZone(instant: Date, timeZone: string): ZonedParts {
  const [datePart, timePart] = instant.toLocaleString("sv-SE", { timeZone }).split(" ");
  const [year, month, day] = datePart.split("-").map(Number);
  const [hour] = timePart.split(":").map(Number);
  return { year, month: month - 1, day, hour };
}

/** Map a wall-clock time in `timeZone` to a UTC instant. */
function zonedInstant(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute = 0,
  second = 0,
  ms = 0,
  timeZone: string,
): Date {
  const utcGuess = Date.UTC(year, month, day, hour, minute, second, ms);
  const guess = new Date(utcGuess);
  const actual = partsInZone(guess, timeZone);
  const actualMs = Date.UTC(
    actual.year,
    actual.month,
    actual.day,
    actual.hour,
    minute,
    second,
    ms,
  );
  const wantedMs = Date.UTC(year, month, day, hour, minute, second, ms);
  return new Date(utcGuess + (wantedMs - actualMs));
}

function addDays(year: number, month: number, day: number, delta: number) {
  const d = new Date(Date.UTC(year, month, day + delta));
  return { year: d.getUTCFullYear(), month: d.getUTCMonth(), day: d.getUTCDate() };
}

/** Inclusive [start, end] window for the current staff operating day. */
export function getStaffOperatingWindow(
  now: Date = new Date(),
  timeZone: string = OFFICE_TIMEZONE,
): { start: Date; end: Date } {
  const { year, month, day, hour } = partsInZone(now, timeZone);
  const base =
    hour < STAFF_SHIFT_START_HOUR ? addDays(year, month, day, -1) : { year, month, day };

  const start = zonedInstant(
    base.year,
    base.month,
    base.day,
    STAFF_SHIFT_START_HOUR,
    0,
    0,
    0,
    timeZone,
  );
  const end = zonedInstant(
    base.year,
    base.month,
    base.day,
    STAFF_SHIFT_END_HOUR,
    0,
    0,
    0,
    timeZone,
  );
  return { start, end };
}

export function isInStaffOperatingWindow(
  createdAt: string | number | Date,
  now: Date = new Date(),
  timeZone: string = OFFICE_TIMEZONE,
): boolean {
  const ts = new Date(createdAt).getTime();
  const { start, end } = getStaffOperatingWindow(now, timeZone);
  return ts >= start.getTime() && ts <= end.getTime();
}

/** Inclusive calendar-day bounds [start, end) in office-local time. */
export function getOfficeCalendarDayBounds(
  now: Date = new Date(),
  timeZone: string = OFFICE_TIMEZONE,
): { start: Date; end: Date } {
  const { year, month, day } = partsInZone(now, timeZone);
  const start = zonedInstant(year, month, day, 0, 0, 0, 0, timeZone);
  const next = addDays(year, month, day, 1);
  const end = zonedInstant(next.year, next.month, next.day, 0, 0, 0, 0, timeZone);
  return { start, end };
}

/** True when `createdAt` falls on the same office-local calendar day as `now`. */
export function isInOfficeCalendarDay(
  createdAt: string | number | Date,
  now: Date = new Date(),
  timeZone: string = OFFICE_TIMEZONE,
): boolean {
  const ts = new Date(createdAt).getTime();
  const { start, end } = getOfficeCalendarDayBounds(now, timeZone);
  return ts >= start.getTime() && ts < end.getTime();
}

/** True once the current staff operating day has passed (after 10 PM office-local). */
export function hasStaffOperatingWindowEnded(
  now: Date = new Date(),
  timeZone: string = OFFICE_TIMEZONE,
): boolean {
  const { end } = getStaffOperatingWindow(now, timeZone);
  return now.getTime() > end.getTime();
}

/** Browser/device IANA zone for staff UI filtering. */
export function getClientTimeZone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

import type { Request } from "./types.js";
import { isInOfficeCalendarDay } from "./operating-window.js";
import { isVisibleToStaff } from "./requests.js";

/** Count items in a staff member's New tab (plan §8). */
export function countNewForStaff(
  requests: Request[],
  staffId: string,
  now: Date = new Date(),
  timeZone?: string,
): number {
  return requests.filter(
    (r) =>
      r.status === "new" &&
      isVisibleToStaff(r, staffId) &&
      isInOfficeCalendarDay(r.createdAt, now, timeZone),
  ).length;
}

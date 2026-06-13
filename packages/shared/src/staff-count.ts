import type { Request } from "./types.js";
import { isVisibleToStaff } from "./requests.js";

/** Count items in a staff member's New tab (plan §8). */
export function countNewForStaff(requests: Request[], staffId: string): number {
  return requests.filter(
    (r) => r.status === "new" && isVisibleToStaff(r, staffId),
  ).length;
}

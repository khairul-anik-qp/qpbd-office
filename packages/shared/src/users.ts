import { STAFF_BRAND_PALETTE } from "./constants.js";

/** Pick a staff brand color, preferring colors not yet assigned. */
export function pickStaffBrandColor(usedColors: readonly string[]): string {
  const used = new Set(usedColors);
  const available = STAFF_BRAND_PALETTE.filter((c) => !used.has(c));
  const pool = available.length > 0 ? available : STAFF_BRAND_PALETTE;
  return pool[Math.floor(Math.random() * pool.length)]!;
}

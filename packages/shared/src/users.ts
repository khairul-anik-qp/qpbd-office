import { STAFF_BRAND_PALETTE } from "./constants.js";
import type { UserRole } from "./types.js";

/** Admin is always an employee — can create and view own requests. */
export function isEmployeeRole(role: UserRole): boolean {
  return role === "employee" || role === "admin";
}

/** Role guard — admin may access employee-only routes. */
export function hasAnyRole(
  userRole: UserRole,
  allowed: readonly UserRole[],
): boolean {
  if (allowed.includes(userRole)) return true;
  if (userRole === "admin" && allowed.includes("employee")) return true;
  return false;
}

/** First token of English display name — used for staff labels across the app. */
export function staffFirstName(nameEn: string): string {
  const trimmed = nameEn.trim();
  if (!trimmed) return "—";
  return trimmed.split(/\s+/)[0]!;
}

/** Pick a staff brand color, preferring colors not yet assigned. */
export function pickStaffBrandColor(usedColors: readonly string[]): string {
  const used = new Set(usedColors);
  const available = STAFF_BRAND_PALETTE.filter((c) => !used.has(c));
  const pool = available.length > 0 ? available : STAFF_BRAND_PALETTE;
  return pool[Math.floor(Math.random() * pool.length)]!;
}

import { hasAnyRole, type User, type UserRole } from "@office/shared";

export function homeForUser(user: User | null): string {
  if (!user) return "/login";
  if (user.status === "pending") return "/pending";
  if (user.status === "rejected") return "/register";
  if (user.role === "admin") return "/admin";
  if (user.role === "staff") return "/staff";
  return "/dashboard";
}

export function userCanAccess(
  user: User | null,
  roles?: UserRole[],
  requireActive = true,
): boolean {
  if (!user) return false;
  if (requireActive && user.status !== "active") return false;
  if (roles?.length && !hasAnyRole(user.role, roles)) return false;
  return true;
}

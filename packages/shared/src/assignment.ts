import type { User } from "./types.js";

export interface AssignmentResult {
  assignee: string | null;
  /** Staff ids to notify (FCM in Phase 5; computed per plan §6). */
  pushTargets: string[];
  busyNotice?: { staffName: string };
}

/**
 * Plan §6 — routing when assignee is null ("Anyone available") or a specific helper.
 * Pure function shared by API assignment router and web preview.
 */
export function resolveAssignment(
  chosenAssignee: string | null,
  staff: User[],
): AssignmentResult {
  if (chosenAssignee) {
    return { assignee: chosenAssignee, pushTargets: [chosenAssignee] };
  }
  if (staff.length === 0) {
    return { assignee: null, pushTargets: [] };
  }

  const available = staff.filter((s) => s.availability === "available");
  if (available.length > 0) {
    if (available.length === staff.length) {
      const picked = [...available].sort((a, b) => {
        const aTs = a.lastAcceptedAt ? new Date(a.lastAcceptedAt).getTime() : 0;
        const bTs = b.lastAcceptedAt ? new Date(b.lastAcceptedAt).getTime() : 0;
        return aTs - bTs;
      })[0]!;
      return { assignee: picked.id, pushTargets: [picked.id] };
    }
    return {
      assignee: null,
      pushTargets: available.map((s) => s.id),
    };
  }

  const picked = staff[Math.floor(Math.random() * staff.length)]!;
  return {
    assignee: picked.id,
    pushTargets: [picked.id],
    busyNotice: { staffName: picked.nameEn },
  };
}

import type { Availability, User } from "@office/shared";

const LEGACY_KEY = "office_staff_availability";

type Listener = () => void;
const listeners = new Set<Listener>();

/** Live session cache — updated from API fetches and SSE. Not persisted. */
let cache: Record<string, Availability> = {};

// Drop stale persisted overrides from before server became source of truth on fetch.
try {
  localStorage.removeItem(LEGACY_KEY);
} catch {
  // ignore
}

export function subscribeAvailability(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function notify() {
  listeners.forEach((fn) => fn());
}

export function loadAvailabilityOverrides(): Record<string, Availability> {
  return cache;
}

/** SSE + optimistic staff self-updates. */
export function notifyAvailability(staffId: string, status: Availability) {
  if (cache[staffId] === status) return;
  cache = { ...cache, [staffId]: status };
  notify();
}

/** API list is source of truth — reconcile cache so auto-reset is visible after refresh. */
export function applyStaffAvailabilityFromApi(list: User[]): User[] {
  const next = { ...cache };
  for (const member of list) {
    if (member.availability) {
      next[member.id] = member.availability;
    }
  }
  cache = next;
  return list.map((member) =>
    cache[member.id] ? { ...member, availability: cache[member.id] } : member,
  );
}

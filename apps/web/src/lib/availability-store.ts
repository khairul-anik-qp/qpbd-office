import type { Availability } from "@office/shared";

const KEY = "office_staff_availability";

type Listener = () => void;
const listeners = new Set<Listener>();

/** In-memory cache mirrored from API + SSE. */
let cache: Record<string, Availability> = {};

export function subscribeAvailability(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function notify() {
  listeners.forEach((fn) => fn());
}

export function loadAvailabilityOverrides(): Record<string, Availability> {
  if (Object.keys(cache).length > 0) return cache;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, Availability>;
    cache = parsed && typeof parsed === "object" ? parsed : {};
    return cache;
  } catch {
    return {};
  }
}

export function notifyAvailability(staffId: string, status: Availability) {
  cache = { ...loadAvailabilityOverrides(), [staffId]: status };
  localStorage.setItem(KEY, JSON.stringify(cache));
  notify();
}

export function saveAvailabilityOverride(staffId: string, status: Availability) {
  notifyAvailability(staffId, status);
}

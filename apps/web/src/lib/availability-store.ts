import type { Availability } from "@office/shared";

const KEY = "office_staff_availability";

type Listener = () => void;
const listeners = new Set<Listener>();

export function subscribeAvailability(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function notify() {
  listeners.forEach((fn) => fn());
}

export function loadAvailabilityOverrides(): Record<string, Availability> {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, Availability>;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

export function saveAvailabilityOverride(staffId: string, status: Availability) {
  const next = { ...loadAvailabilityOverrides(), [staffId]: status };
  localStorage.setItem(KEY, JSON.stringify(next));
  notify();
}

import type { Request } from "@office/shared";

const GLOBAL_KEY = "office_requests";
const LEGACY_PREFIX = "office_requests_";

type Listener = () => void;
const listeners = new Set<Listener>();

export function subscribeRequests(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function notify() {
  listeners.forEach((fn) => fn());
}

function parseRequests(raw: string | null): Request[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as Request[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/** Migrate legacy per-user keys into the global store (Phase 2 → 3). */
function migrateLegacyRequests(): Request[] {
  const merged = new Map<string, Request>();
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key?.startsWith(LEGACY_PREFIX) || key === GLOBAL_KEY) continue;
    for (const req of parseRequests(localStorage.getItem(key))) {
      merged.set(req.id, req);
    }
  }
  const list = [...merged.values()].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
  if (list.length > 0) {
    localStorage.setItem(GLOBAL_KEY, JSON.stringify(list));
  }
  return list;
}

export function loadGlobalRequests(): Request[] {
  const stored = parseRequests(localStorage.getItem(GLOBAL_KEY));
  if (stored.length > 0) return stored;
  return migrateLegacyRequests();
}

export function saveGlobalRequests(requests: Request[]) {
  localStorage.setItem(GLOBAL_KEY, JSON.stringify(requests));
  notify();
}

export function nextRequestId(requests: Request[]): string {
  const nums = requests.map((r) => parseInt(r.id, 10)).filter((n) => !Number.isNaN(n));
  const max = nums.length > 0 ? Math.max(...nums) : 0;
  return String(max + 1);
}

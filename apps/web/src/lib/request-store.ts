import type { Request } from "@office/shared";

const GLOBAL_KEY = "office_requests";
const LEGACY_PREFIX = "office_requests_";

export type RequestStoreEvent = { type: "bootstrap" | "patch" };

type Listener = (event: RequestStoreEvent) => void;
const listeners = new Set<Listener>();

/** Live session cache — hydrated from API, patched via SSE. Not persisted. */
let cache: Request[] = [];

// Drop stale persisted rows from before server became source of truth on fetch.
try {
  localStorage.removeItem(GLOBAL_KEY);
  for (let i = localStorage.length - 1; i >= 0; i--) {
    const key = localStorage.key(i);
    if (key?.startsWith(LEGACY_PREFIX)) localStorage.removeItem(key);
  }
} catch {
  // ignore
}

function sortRequests(requests: Request[]): Request[] {
  return [...requests].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

export function subscribeRequests(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function notify(type: RequestStoreEvent["type"]) {
  const event: RequestStoreEvent = { type };
  listeners.forEach((fn) => fn(event));
}

export function loadGlobalRequests(): Request[] {
  return cache;
}

export function saveGlobalRequests(requests: Request[], type: RequestStoreEvent["type"] = "patch") {
  cache = sortRequests(requests);
  notify(type);
}

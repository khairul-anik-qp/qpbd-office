export type SseConnectionStatus = "connected" | "reconnecting";

let status: SseConnectionStatus = "connected";
const listeners = new Set<() => void>();

export function getSseConnectionStatus(): SseConnectionStatus {
  return status;
}

export function setSseConnectionStatus(next: SseConnectionStatus) {
  if (status === next) return;
  status = next;
  for (const listener of listeners) listener();
}

export function subscribeSseConnection(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

import type { User } from "@office/shared";

export interface PendingQueueListener {
  onRegistered: (user: User) => void;
  onRemoved: (userId: string) => void;
}

const listeners = new Set<PendingQueueListener>();

export function subscribePendingQueue(listener: PendingQueueListener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function mergePendingUser(user: User) {
  for (const listener of listeners) listener.onRegistered(user);
}

export function removePendingUser(userId: string) {
  for (const listener of listeners) listener.onRemoved(userId);
}

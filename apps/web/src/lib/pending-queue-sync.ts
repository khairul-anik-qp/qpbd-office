import type { User } from "@office/shared";

export interface PendingQueueListener {
  onRegistered: (user: User) => void;
  onRemoved: (userId: string) => void;
}

let pendingUsers: User[] = [];
let bootstrapped = false;

const listeners = new Set<PendingQueueListener>();
const countListeners = new Set<(count: number) => void>();
const listListeners = new Set<(users: User[]) => void>();
const readyListeners = new Set<(ready: boolean) => void>();

function sortPending(users: User[]): User[] {
  return [...users].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );
}

function upsertPending(users: User[], user: User): User[] {
  const idx = users.findIndex((entry) => entry.id === user.id);
  const next =
    idx >= 0 ? users.map((entry) => (entry.id === user.id ? user : entry)) : [...users, user];
  return sortPending(next);
}

function notifyCount() {
  const count = pendingUsers.length;
  for (const listener of countListeners) listener(count);
}

function notifyList() {
  const snapshot = [...pendingUsers];
  for (const listener of listListeners) listener(snapshot);
}

function notifyReady() {
  for (const listener of readyListeners) listener(bootstrapped);
}

export function getPendingCount() {
  return pendingUsers.length;
}

export function getPendingUsers() {
  return pendingUsers;
}

export function isPendingQueueReady() {
  return bootstrapped;
}

export function setPendingUsers(users: User[]) {
  pendingUsers = sortPending(users);
  bootstrapped = true;
  notifyCount();
  notifyList();
  notifyReady();
}

export function subscribePendingCount(listener: (count: number) => void) {
  listener(pendingUsers.length);
  countListeners.add(listener);
  return () => {
    countListeners.delete(listener);
  };
}

export function subscribePendingList(listener: (users: User[]) => void) {
  listener([...pendingUsers]);
  listListeners.add(listener);
  return () => {
    listListeners.delete(listener);
  };
}

export function subscribePendingReady(listener: (ready: boolean) => void) {
  listener(bootstrapped);
  readyListeners.add(listener);
  return () => {
    readyListeners.delete(listener);
  };
}

export function subscribePendingQueue(listener: PendingQueueListener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function mergePendingUser(user: User) {
  pendingUsers = upsertPending(pendingUsers, user);
  notifyCount();
  notifyList();
  for (const listener of listeners) listener.onRegistered(user);
}

export function removePendingUser(userId: string) {
  pendingUsers = pendingUsers.filter((user) => user.id !== userId);
  notifyCount();
  notifyList();
  for (const listener of listeners) listener.onRemoved(userId);
}

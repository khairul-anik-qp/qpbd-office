import type { Availability, Request } from "@office/shared";
import {
  loadGlobalRequests,
  saveGlobalRequests,
  subscribeRequests,
} from "./request-store";
import { notifyAvailability } from "./availability-store";

export { subscribeRequests };

export function replaceAllRequests(requests: Request[]) {
  saveGlobalRequests(requests);
}

export function mergeRequest(request: Request) {
  const current = loadGlobalRequests();
  const idx = current.findIndex((r) => r.id === request.id);
  const next =
    idx >= 0
      ? current.map((r) => (r.id === request.id ? request : r))
      : [request, ...current];
  saveGlobalRequests(next);
}

export function removeRequest(id: string) {
  const next = loadGlobalRequests().filter((r) => r.id !== id);
  saveGlobalRequests(next);
}

export function setAvailabilityFromSse(staffId: string, status: Availability) {
  notifyAvailability(staffId, status);
}

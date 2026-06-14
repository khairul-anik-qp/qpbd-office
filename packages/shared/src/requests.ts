import type { Availability, Request, RequestStatus, RequestType, Urgency } from "./types.js";

/** Default page size for GET /requests?limit=… */
export const REQUESTS_PAGE_SIZE = 20;

/** Query params when requesting a paginated list. */
export interface ListRequestsParams {
  limit?: number;
  cursor?: string;
  status?: RequestStatus;
  /** ISO datetime string — only return requests created at or after this timestamp. */
  dateFrom?: string;
}

/** Paginated GET /requests response (when `limit` is provided). */
export interface ListRequestsPage {
  items: Request[];
  nextCursor: string | null;
  total: number;
}

/** POST /requests */
export interface CreateRequestDto {
  type: RequestType;
  note?: string;
  urg?: Urgency;
  loc: string;
  /** staff id, or null / omitted = anyone available */
  assignee?: string | null;
}

/** POST /requests/:id/forward */
export interface ForwardRequestDto {
  targetStaffId: string;
}

/** PATCH /staff/availability */
export interface UpdateAvailabilityDto {
  status: Availability;
}

/** Create response — includes busy-staff notice for employee toast (plan §6). */
export interface CreateRequestResponse {
  request: Request;
  busyNotice?: string;
}

/** Plan §13 SSE event names. */
export type SseEventType =
  | "request.created"
  | "request.updated"
  | "availability.changed"
  | "user.registered"
  | "user.approved"
  | "user.rejected";

export interface SseEvent<T = unknown> {
  type: SseEventType;
  data: T;
}

export interface AvailabilityChangedPayload {
  staffId: string;
  status: Availability;
  /** Server auto-reset busy → available after timeout. */
  auto?: boolean;
}

/** Plan §6 staff visibility — server-side filter. */
export function isVisibleToStaff(request: Request, staffId: string): boolean {
  if (request.status === "discarded") return false;
  if (request.status === "new") {
    if (request.forwardedBy === staffId) return false;
    return request.assignee === staffId || request.assignee === null;
  }
  if (request.status === "progress") {
    return request.acceptedBy === staffId;
  }
  return request.doneBy === staffId;
}

/** Plan §6 tab sorting. */
export function sortRequestsForTab(requests: Request[], tab: RequestStatus): Request[] {
  const list = [...requests];
  if (tab === "new") {
    list.sort(
      (a, b) =>
        Number(b.urg === "urgent") - Number(a.urg === "urgent") ||
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  } else if (tab === "done") {
    list.sort(
      (a, b) =>
        new Date(b.doneAt ?? 0).getTime() - new Date(a.doneAt ?? 0).getTime(),
    );
  } else {
    list.sort(
      (a, b) =>
        new Date(b.acceptedAt ?? 0).getTime() - new Date(a.acceptedAt ?? 0).getTime(),
    );
  }
  return list;
}

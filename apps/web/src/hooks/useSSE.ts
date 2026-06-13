import { useEffect, useRef } from "react";
import type {
  AvailabilityChangedPayload,
  Request,
  SseEventType,
  User,
} from "@office/shared";
import { isEmployeeRole, isVisibleToStaff } from "@office/shared";
import { getStoredToken } from "@/lib/api";
import { mergePendingUser, removePendingUser } from "@/lib/pending-queue-sync";
import { mergeRequest, setAvailabilityFromSse } from "@/lib/request-sync";

const SSE_TYPES: SseEventType[] = [
  "request.created",
  "request.updated",
  "availability.changed",
  "user.registered",
  "user.approved",
  "user.rejected",
];

const MAX_BACKOFF_MS = 30_000;

function shouldTrackRequest(user: User, request: Request): boolean {
  if (isEmployeeRole(user.role)) return request.requesterId === user.id;
  if (user.role === "staff") return isVisibleToStaff(request, user.id);
  return false;
}

function handleSseEvent(user: User, type: SseEventType, raw: string) {
  switch (type) {
    case "request.created":
    case "request.updated": {
      const request = JSON.parse(raw) as Request;
      if (shouldTrackRequest(user, request)) mergeRequest(request);
      break;
    }
    case "availability.changed": {
      const { staffId, status } = JSON.parse(raw) as AvailabilityChangedPayload;
      setAvailabilityFromSse(staffId, status);
      break;
    }
    case "user.registered": {
      if (user.role !== "admin") break;
      mergePendingUser(JSON.parse(raw) as User);
      break;
    }
    case "user.approved":
    case "user.rejected": {
      if (user.role !== "admin") break;
      removePendingUser((JSON.parse(raw) as User).id);
      break;
    }
    default:
      break;
  }
}

/**
 * Live sync via GET /sse/events?token=… (plan §13).
 * Reconnects with exponential backoff.
 */
export function useSSE(enabled: boolean, user: User | null) {
  const backoffRef = useRef(1000);
  const sourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (!enabled || !user) return;

    let cancelled = false;
    let retryTimer: ReturnType<typeof setTimeout> | null = null;

    const connect = () => {
      if (cancelled) return;
      const token = getStoredToken();
      if (!token) return;

      sourceRef.current?.close();
      const url = `/sse/events?token=${encodeURIComponent(token)}`;
      const es = new EventSource(url);
      sourceRef.current = es;

      es.onopen = () => {
        backoffRef.current = 1000;
      };

      for (const type of SSE_TYPES) {
        es.addEventListener(type, (ev) => {
          handleSseEvent(user, type, (ev as MessageEvent).data);
        });
      }

      es.onerror = () => {
        es.close();
        if (cancelled) return;
        const delay = backoffRef.current;
        backoffRef.current = Math.min(delay * 2, MAX_BACKOFF_MS);
        retryTimer = setTimeout(connect, delay);
      };
    };

    connect();

    return () => {
      cancelled = true;
      if (retryTimer) clearTimeout(retryTimer);
      sourceRef.current?.close();
      sourceRef.current = null;
    };
  }, [enabled, user]);
}

/** Bootstrap requests from API on mount. */
export function useRequestBootstrap(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    void import("@/lib/api").then(({ api }) =>
      api.listRequests().then((list) => {
        if (!cancelled) {
          void import("@/lib/request-sync").then(({ replaceAllRequests }) => {
            replaceAllRequests(list);
          });
        }
      }),
    );
    return () => {
      cancelled = true;
    };
  }, [enabled]);
}

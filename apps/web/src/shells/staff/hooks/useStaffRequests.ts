import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import type { Availability, Request, User } from "@office/shared";
import { getClientTimeZone, staffFirstName } from "@office/shared";
import {
  applyStaffAvailabilityFromApi,
  notifyAvailability,
  subscribeAvailability,
} from "@/lib/availability-store";
import { loadGlobalRequests, subscribeRequests } from "@/lib/request-store";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useNow } from "@/shells/employee/hooks/useNow";
import { playNewRequestChime } from "../lib/chime";
import {
  type ForwardToast,
  type PhoneTab,
  shouldNotifyStaff,
  sortForTab,
  tabCount,
  isVisibleToStaff,
  isInStaffShift,
} from "../lib/staff-format";

const NOTIF_MS = 7000;
const FORWARD_TOAST_MS = 3800;

function mergeAvailability(list: User[]): User[] {
  return applyStaffAvailabilityFromApi(list);
}

export function useStaffRequests() {
  const { user } = useAuth();
  const staffId = user?.id ?? "";
  const now = useNow(60_000);
  const timeZone = useMemo(() => getClientTimeZone(), []);
  const [searchParams] = useSearchParams();

  const [staff, setStaff] = useState<User[]>([]);
  const [requests, setRequests] = useState<Request[]>(() => loadGlobalRequests());
  const [phoneTab, setPhoneTab] = useState<PhoneTab>(() => {
    const tab = searchParams.get("tab");
    return tab === "new" || tab === "progress" || tab === "done" ? tab : "new";
  });
  const [forwardingId, setForwardingId] = useState<string | null>(null);
  const [forwardToast, setForwardToast] = useState<ForwardToast | null>(null);
  const [activeNotif, setActiveNotif] = useState<Request | null>(null);
  const [shake, setShake] = useState(false);

  const seenIdsRef = useRef<Set<string>>(new Set(loadGlobalRequests().map((r) => r.id)));
  const notifTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const forwardTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const shakeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const staffById = useMemo(() => new Map(staff.map((s) => [s.id, s])), [staff]);

  const myAvailability = useMemo((): Availability => {
    const me = staff.find((s) => s.id === staffId);
    return (me?.availability ?? "available") as Availability;
  }, [staff, staffId]);

  const showNotification = useCallback((req: Request) => {
    setActiveNotif(req);
    setShake(true);
    playNewRequestChime();
    if (notifTimerRef.current) clearTimeout(notifTimerRef.current);
    notifTimerRef.current = setTimeout(() => {
      setActiveNotif((cur) => (cur?.id === req.id ? null : cur));
    }, NOTIF_MS);
    if (shakeTimerRef.current) clearTimeout(shakeTimerRef.current);
    shakeTimerRef.current = setTimeout(() => setShake(false), 650);
  }, []);

  const detectNewRequests = useCallback(
    (list: Request[]) => {
      if (!staffId) return;
      for (const req of list) {
        if (seenIdsRef.current.has(req.id)) continue;
        seenIdsRef.current.add(req.id);
        if (shouldNotifyStaff(req, staffId, now, timeZone)) {
          showNotification(req);
          setPhoneTab("new");
        }
      }
    },
    [staffId, showNotification, now, timeZone],
  );

  useEffect(() => {
    setRequests(loadGlobalRequests());
    const unsub = subscribeRequests(({ type }) => {
      const updated = loadGlobalRequests();
      if (type === "bootstrap") {
        for (const req of updated) seenIdsRef.current.add(req.id);
      } else {
        detectNewRequests(updated);
      }
      setRequests(updated);
    });
    return unsub;
  }, [detectNewRequests]);

  useEffect(() => {
    let cancelled = false;
    void api
      .listStaff()
      .then((list) => {
        if (!cancelled) setStaff(mergeAvailability(list));
      })
      .catch(() => {
        if (!cancelled) setStaff([]);
      });
    const unsubAvail = subscribeAvailability(() => {
      void api.listStaff().then((list) => {
        if (!cancelled) setStaff(mergeAvailability(list));
      });
    });
    return () => {
      cancelled = true;
      unsubAvail();
    };
  }, []);

  useEffect(
    () => () => {
      if (notifTimerRef.current) clearTimeout(notifTimerRef.current);
      if (forwardTimerRef.current) clearTimeout(forwardTimerRef.current);
      if (shakeTimerRef.current) clearTimeout(shakeTimerRef.current);
    },
    [],
  );

  const setAvailability = useCallback(
    (status: Availability) => {
      if (!staffId) return;
      void api
        .setAvailability(status)
        .then((updated) => {
          if (updated.availability) {
            notifyAvailability(updated.id, updated.availability);
          }
        })
        .catch(() => {
          toast.error("Could not update availability");
        });
    },
    [staffId],
  );

  const accept = useCallback(
    (id: string) => {
      if (!staffId) return;
      void api
        .acceptRequest(id)
        .then(() => {
          setActiveNotif((n) => (n?.id === id ? null : n));
          setForwardingId(null);
        })
        .catch((err) => {
          if (err instanceof ApiError) {
            toast.error(err.message);
            return;
          }
          toast.error("Could not accept request");
        });
    },
    [staffId],
  );

  const startForward = useCallback((id: string) => {
    setForwardingId(id);
    setForwardToast(null);
  }, []);

  const cancelForward = useCallback(() => setForwardingId(null), []);

  const forward = useCallback(
    (id: string, targetId: string) => {
      if (!staffId) return;
      const target = staffById.get(targetId);
      void api
        .forwardRequest(id, { targetStaffId: targetId })
        .then(() => {
          setForwardingId(null);
          setActiveNotif((n) => (n?.id === id ? null : n));
          if (target) {
            const toastMsg: ForwardToast = {
              bn: `${staffFirstName(target.nameEn)}-কে পাঠানো হয়েছে`,
              en: `Forwarded to ${staffFirstName(target.nameEn)}`,
            };
            setForwardToast(toastMsg);
            if (forwardTimerRef.current) clearTimeout(forwardTimerRef.current);
            forwardTimerRef.current = setTimeout(
              () => setForwardToast(null),
              FORWARD_TOAST_MS,
            );
          }
        })
        .catch(() => toast.error("Could not forward request"));
    },
    [staffId, staffById],
  );

  const complete = useCallback(
    (id: string) => {
      if (!staffId) return;
      void api.completeRequest(id).catch((err) => {
        if (err instanceof ApiError && err.status === 403) {
          toast.error("Only the staff who accepted this request can mark it done.");
          return;
        }
        toast.error("Could not complete request");
      });
    },
    [staffId],
  );

  const dismissNotif = useCallback(() => setActiveNotif(null), []);

  const viewNotif = useCallback(() => {
    setActiveNotif(null);
    setPhoneTab("new");
  }, []);

  const shiftRequests = useMemo(
    () => requests.filter((r) => isInStaffShift(r, now, timeZone)),
    [requests, now, timeZone],
  );

  const visibleRequests = useMemo(() => {
    const filtered = shiftRequests.filter(
      (r) => r.status === phoneTab && isVisibleToStaff(r, staffId),
    );
    return sortForTab(filtered, phoneTab);
  }, [shiftRequests, phoneTab, staffId]);

  const counts = useMemo(
    () => ({
      new: tabCount(shiftRequests, staffId, "new", now, timeZone),
      progress: tabCount(shiftRequests, staffId, "progress", now, timeZone),
      done: tabCount(shiftRequests, staffId, "done", now, timeZone),
    }),
    [shiftRequests, staffId, now, timeZone],
  );

  const changeTab = useCallback((tab: PhoneTab) => {
    setPhoneTab(tab);
    setForwardingId(null);
  }, []);

  const otherStaff = useMemo(
    () => staff.filter((s) => s.id !== staffId),
    [staff, staffId],
  );

  return {
    user,
    staff,
    staffById,
    otherStaff,
    requests: visibleRequests,
    phoneTab,
    counts,
    forwardingId,
    forwardToast,
    activeNotif,
    shake,
    myAvailability,
    setAvailability,
    changeTab,
    accept,
    startForward,
    cancelForward,
    forward,
    complete,
    dismissNotif,
    viewNotif,
  };
}

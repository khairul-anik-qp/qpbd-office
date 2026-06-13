import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Availability, Request, User } from "@office/shared";
import {
  loadAvailabilityOverrides,
  saveAvailabilityOverride,
  subscribeAvailability,
} from "@/lib/availability-store";
import {
  loadGlobalRequests,
  saveGlobalRequests,
  subscribeRequests,
} from "@/lib/request-store";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { playNewRequestChime } from "../lib/chime";
import {
  type ForwardToast,
  type PhoneTab,
  shouldNotifyStaff,
  sortForTab,
  tabCount,
  isVisibleToStaff,
} from "../lib/staff-format";

const NOTIF_MS = 7000;
const FORWARD_TOAST_MS = 3800;

function mergeAvailability(list: User[]): User[] {
  const overrides = loadAvailabilityOverrides();
  return list.map((s) =>
    overrides[s.id] ? { ...s, availability: overrides[s.id] } : s,
  );
}

export function useStaffRequests() {
  const { user } = useAuth();
  const staffId = user?.id ?? "";

  const [staff, setStaff] = useState<User[]>([]);
  const [requests, setRequests] = useState<Request[]>(() => loadGlobalRequests());
  const [phoneTab, setPhoneTab] = useState<PhoneTab>("new");
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
    const override = loadAvailabilityOverrides()[staffId];
    return (override ?? me?.availability ?? "available") as Availability;
  }, [staff, staffId]);

  const reloadRequests = useCallback(() => {
    setRequests(loadGlobalRequests());
  }, []);

  const persistRequests = useCallback((updater: (prev: Request[]) => Request[]) => {
    const next = updater(loadGlobalRequests());
    saveGlobalRequests(next);
    setRequests(next);
  }, []);

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
        if (shouldNotifyStaff(req, staffId)) {
          showNotification(req);
          setPhoneTab("new");
        }
      }
    },
    [staffId, showNotification],
  );

  useEffect(() => {
    reloadRequests();
    const unsub = subscribeRequests(() => {
      const next = loadGlobalRequests();
      detectNewRequests(next);
      setRequests(next);
    });
    return unsub;
  }, [reloadRequests, detectNewRequests]);

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
      saveAvailabilityOverride(staffId, status);
      setStaff((prev) =>
        prev.map((s) => (s.id === staffId ? { ...s, availability: status } : s)),
      );
    },
    [staffId],
  );

  const accept = useCallback(
    (id: string) => {
      if (!staffId) return;
      persistRequests((prev) =>
        prev.map((r) =>
          r.id === id
            ? {
                ...r,
                status: "progress" as const,
                acceptedBy: staffId,
                acceptedAt: new Date().toISOString(),
              }
            : r,
        ),
      );
      setActiveNotif((n) => (n?.id === id ? null : n));
      setForwardingId(null);
    },
    [staffId, persistRequests],
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
      persistRequests((prev) =>
        prev.map((r) =>
          r.id === id
            ? { ...r, assignee: targetId, forwardedBy: staffId, urg: r.urg }
            : r,
        ),
      );
      setForwardingId(null);
      setActiveNotif((n) => (n?.id === id ? null : n));
      if (target) {
        const toast: ForwardToast = {
          bn: `${target.nameBn ?? target.nameEn}-কে পাঠানো হয়েছে`,
          en: `Forwarded to ${target.nameEn}`,
        };
        setForwardToast(toast);
        if (forwardTimerRef.current) clearTimeout(forwardTimerRef.current);
        forwardTimerRef.current = setTimeout(() => setForwardToast(null), FORWARD_TOAST_MS);
      }
    },
    [staffId, staffById, persistRequests],
  );

  const complete = useCallback(
    (id: string) => {
      if (!staffId) return;
      persistRequests((prev) =>
        prev.map((r) =>
          r.id === id
            ? {
                ...r,
                status: "done" as const,
                doneBy: staffId,
                doneAt: new Date().toISOString(),
              }
            : r,
        ),
      );
    },
    [staffId, persistRequests],
  );

  const dismissNotif = useCallback(() => setActiveNotif(null), []);

  const viewNotif = useCallback(() => {
    setActiveNotif(null);
    setPhoneTab("new");
  }, []);

  const visibleRequests = useMemo(() => {
    const filtered = requests.filter(
      (r) => r.status === phoneTab && isVisibleToStaff(r, staffId),
    );
    return sortForTab(filtered, phoneTab);
  }, [requests, phoneTab, staffId]);

  const counts = useMemo(
    () => ({
      new: tabCount(requests, staffId, "new"),
      progress: tabCount(requests, staffId, "progress"),
      done: tabCount(requests, staffId, "done"),
    }),
    [requests, staffId],
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

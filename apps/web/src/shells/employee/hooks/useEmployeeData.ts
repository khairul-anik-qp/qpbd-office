import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import type { Request, User } from "@office/shared";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import {
  loadAvailabilityOverrides,
  subscribeAvailability,
} from "@/lib/availability-store";
import { loadGlobalRequests, subscribeRequests } from "@/lib/request-store";
import { replaceAllRequests } from "@/lib/request-sync";

export function useEmployeeData() {
  const { user } = useAuth();
  const [staff, setStaff] = useState<User[]>([]);
  const [staffLoading, setStaffLoading] = useState(true);
  const [staffLoadError, setStaffLoadError] = useState(false);
  const [requests, setRequests] = useState<Request[]>([]);

  const staffById = useMemo(() => new Map(staff.map((s) => [s.id, s])), [staff]);

  const myRequests = useMemo(() => {
    if (!user) return requests;
    return requests.filter((r) => r.requesterId === user.id);
  }, [requests, user]);

  useEffect(() => {
    const syncFromStore = () => setRequests(loadGlobalRequests());
    syncFromStore();
    const unsub = subscribeRequests(syncFromStore);

    let cancelled = false;
    void api
      .listRequests()
      .then((list) => {
        if (!cancelled) replaceAllRequests(list);
      })
      .catch(() => {
        // Keep cached rows; RealtimeSync bootstrap may also hydrate on remount.
      });

    return () => {
      cancelled = true;
      unsub();
    };
  }, []);

  const mergeAvailability = useCallback((list: User[]) => {
    const overrides = loadAvailabilityOverrides();
    return list.map((s) =>
      overrides[s.id] ? { ...s, availability: overrides[s.id] } : s,
    );
  }, []);

  const loadStaff = useCallback(
    async (opts?: { quiet?: boolean }) => {
      setStaffLoading(true);
      setStaffLoadError(false);
      try {
        const list = await api.listStaff();
        setStaff(mergeAvailability(list));
      } catch {
        setStaffLoadError(true);
        if (!opts?.quiet) toast.error("Could not load office team.");
      } finally {
        setStaffLoading(false);
      }
    },
    [mergeAvailability],
  );

  const retryStaff = useCallback(() => {
    void loadStaff();
  }, [loadStaff]);

  const refreshStaff = useCallback(() => {
    void loadStaff({ quiet: true });
  }, [loadStaff]);

  useEffect(() => {
    void loadStaff();
    const unsubAvail = subscribeAvailability(() => {
      void loadStaff({ quiet: true });
    });
    return unsubAvail;
  }, [loadStaff]);

  return {
    staff,
    staffLoading,
    staffLoadError,
    retryStaff,
    refreshStaff,
    staffById,
    requests: myRequests,
  };
}

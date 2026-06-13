import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import type { Request, User } from "@office/shared";
import { api } from "@/lib/api";
import {
  loadAvailabilityOverrides,
  subscribeAvailability,
} from "@/lib/availability-store";
import { loadGlobalRequests, subscribeRequests } from "@/lib/request-store";

export function useEmployeeData() {
  const [staff, setStaff] = useState<User[]>([]);
  const [staffLoading, setStaffLoading] = useState(true);
  const [requests, setRequests] = useState<Request[]>([]);

  const staffById = useMemo(() => new Map(staff.map((s) => [s.id, s])), [staff]);

  useEffect(() => {
    setRequests(loadGlobalRequests());
    return subscribeRequests(() => setRequests(loadGlobalRequests()));
  }, []);

  const mergeAvailability = useCallback((list: User[]) => {
    const overrides = loadAvailabilityOverrides();
    return list.map((s) =>
      overrides[s.id] ? { ...s, availability: overrides[s.id] } : s,
    );
  }, []);

  useEffect(() => {
    let cancelled = false;
    setStaffLoading(true);
    void api
      .listStaff()
      .then((list) => {
        if (!cancelled) setStaff(mergeAvailability(list));
      })
      .catch(() => {
        if (!cancelled) toast.error("Could not load office team.");
      })
      .finally(() => {
        if (!cancelled) setStaffLoading(false);
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
  }, [mergeAvailability]);

  return { staff, staffLoading, staffById, requests };
}

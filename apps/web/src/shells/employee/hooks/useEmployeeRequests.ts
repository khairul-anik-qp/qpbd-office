import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import type { Request, RequestType, User } from "@office/shared";
import { LOCATIONS } from "@office/shared";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import {
  loadAvailabilityOverrides,
  subscribeAvailability,
} from "@/lib/availability-store";
import { loadGlobalRequests, subscribeRequests } from "@/lib/request-store";
import {
  type AllFilter,
  type CreateFormState,
  defaultCreateForm,
  type WebView,
} from "../lib/employee-request";

const TOAST_MS = 4200;

export function useEmployeeRequests() {
  const { user } = useAuth();
  const [staff, setStaff] = useState<User[]>([]);
  const [staffLoading, setStaffLoading] = useState(true);
  const [requests, setRequests] = useState<Request[]>([]);
  const [webView, setWebView] = useState<WebView>("dashboard");
  const [allFilter, setAllFilter] = useState<AllFilter>("all");
  const [createForm, setCreateForm] = useState<CreateFormState>(defaultCreateForm);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

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

  const openCreate = useCallback((type: RequestType) => {
    setCreateForm({
      ...defaultCreateForm(),
      type,
      loc: LOCATIONS[0]?.id ?? "",
    });
  }, []);

  const closeCreate = useCallback(() => {
    setCreateForm(defaultCreateForm());
  }, []);

  const sendRequest = useCallback(async () => {
    if (!user || !createForm.type || sending) return;

    setSending(true);
    try {
      const { request, busyNotice } = await api.createRequest({
        type: createForm.type,
        note: createForm.note.trim(),
        urg: createForm.urg,
        loc: createForm.loc,
        assignee: createForm.assignee,
      });

      closeCreate();

      const assigneeName = request.assignee
        ? staffById.get(request.assignee)?.nameEn
        : null;
      const message = assigneeName
        ? `Request sent — ${assigneeName} has been notified`
        : "Request sent — the office team has been notified";

      setSuccessToast(message);
      setTimeout(() => setSuccessToast(null), TOAST_MS);

      if (busyNotice) {
        toast.warning(busyNotice, { duration: TOAST_MS });
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Could not send request";
      toast.error(msg);
    } finally {
      setSending(false);
    }
  }, [user, createForm, staffById, closeCreate, sending]);

  return {
    staff,
    staffLoading,
    staffById,
    requests,
    webView,
    setWebView,
    allFilter,
    setAllFilter,
    createForm,
    setCreateForm,
    successToast,
    sending,
    openCreate,
    closeCreate,
    sendRequest,
    openAll: () => {
      setWebView("all");
      setAllFilter("all");
    },
    backToDashboard: () => setWebView("dashboard"),
  };
}

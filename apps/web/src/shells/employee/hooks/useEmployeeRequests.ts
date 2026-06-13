import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import type { Request, RequestType, User } from "@office/shared";
import { LOCATIONS } from "@office/shared";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import {
  type AllFilter,
  type CreateFormState,
  defaultCreateForm,
  loadStoredRequests,
  nextRequestId,
  resolveAssignment,
  saveStoredRequests,
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

  const staffById = useMemo(() => new Map(staff.map((s) => [s.id, s])), [staff]);

  useEffect(() => {
    if (!user?.id) return;
    setRequests(loadStoredRequests(user.id));
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id) return;
    saveStoredRequests(user.id, requests);
  }, [user?.id, requests]);

  useEffect(() => {
    let cancelled = false;
    setStaffLoading(true);
    void api
      .listStaff()
      .then((list) => {
        if (!cancelled) setStaff(list);
      })
      .catch(() => {
        if (!cancelled) toast.error("Could not load office team.");
      })
      .finally(() => {
        if (!cancelled) setStaffLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

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

  const sendRequest = useCallback(() => {
    if (!user || !createForm.type) return;

    const { assignee, busyToast } = resolveAssignment(createForm.assignee, staff);
    const id = nextRequestId(requests);
    const t = new Date().toISOString();

    const req: Request = {
      id,
      type: createForm.type,
      requester: user.nameEn,
      requesterId: user.id,
      note: createForm.note.trim(),
      urg: createForm.urg,
      loc: createForm.loc,
      assignee,
      status: "new",
      createdAt: t,
    };

    setRequests((prev) => [req, ...prev]);
    closeCreate();

    const assigneeName = assignee ? staffById.get(assignee)?.nameEn : null;
    const message = assigneeName
      ? `Request sent — ${assigneeName} has been notified`
      : "Request sent — the office team has been notified";

    setSuccessToast(message);
    setTimeout(() => setSuccessToast(null), TOAST_MS);

    if (busyToast) {
      toast.warning(busyToast, { duration: TOAST_MS });
    }
  }, [user, createForm, staff, staffById, requests, closeCreate]);

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

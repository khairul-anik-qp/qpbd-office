import { useCallback, useState } from "react";
import { toast } from "sonner";
import type { RequestType } from "@office/shared";
import { LOCATIONS, staffFirstName } from "@office/shared";
import { api } from "@/lib/api";
import { mergeRequest } from "@/lib/request-sync";
import { useAuth } from "@/context/AuthContext";
import {
  type CreateFormState,
  defaultCreateForm,
} from "../lib/employee-request";
import { useEmployeeData } from "./useEmployeeData";

const TOAST_MS = 4200;

export function useEmployeeRequests() {
  const { user } = useAuth();
  const { staff, staffLoading, staffLoadError, retryStaff, refreshStaff, staffById, requests } =
    useEmployeeData();
  const [createForm, setCreateForm] = useState<CreateFormState>(defaultCreateForm);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

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

      mergeRequest(request);
      closeCreate();

      const assigneeName =
        request.assigneeName ??
        (request.assignee
          ? staffFirstName(staffById.get(request.assignee)?.nameEn ?? "")
          : null);
      const message =
        assigneeName && assigneeName !== "—"
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
    staffLoadError,
    retryStaff,
    refreshStaff,
    staffById,
    requests,
    createForm,
    setCreateForm,
    successToast,
    sending,
    openCreate,
    closeCreate,
    sendRequest,
  };
}

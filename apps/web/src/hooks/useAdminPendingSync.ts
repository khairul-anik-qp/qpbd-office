import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { api } from "@/lib/api";
import {
  setPendingUsers,
  subscribePendingQueue,
} from "@/lib/pending-queue-sync";

/** Bootstrap pending signups for admin + in-app toast on new registrations. */
export function useAdminPendingSync(enabled: boolean) {
  const navigate = useNavigate();
  const bootstrappedRef = useRef(false);

  useEffect(() => {
    if (!enabled) return;

    void api.listPending().then((users) => {
      setPendingUsers(users);
      bootstrappedRef.current = true;
    });

    return subscribePendingQueue({
      onRegistered: (user) => {
        if (!bootstrappedRef.current) return;
        const roleLabel = user.role === "staff" ? "Staff" : "Employee";
        toast.info(`New sign-up: ${user.nameEn}`, {
          description: `${roleLabel} registration awaiting approval`,
          action: {
            label: "Review",
            onClick: () => navigate("/admin"),
          },
        });
      },
      onRemoved: () => {},
    });
  }, [enabled, navigate]);
}

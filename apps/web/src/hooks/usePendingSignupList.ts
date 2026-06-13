import { useEffect, useState } from "react";
import type { User } from "@office/shared";
import {
  getPendingUsers,
  isPendingQueueReady,
  subscribePendingList,
  subscribePendingReady,
} from "@/lib/pending-queue-sync";

export function usePendingSignupList() {
  const [pending, setPending] = useState<User[]>(getPendingUsers);
  const [loading, setLoading] = useState(!isPendingQueueReady());

  useEffect(() => subscribePendingList(setPending), []);
  useEffect(
    () =>
      subscribePendingReady((ready) => {
        setLoading(!ready);
      }),
    [],
  );

  return { pending, loading };
}

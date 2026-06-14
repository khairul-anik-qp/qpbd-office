import { SyncStatusBar } from "@/components/SyncStatusBar";
import { useAdminPendingSync } from "@/hooks/useAdminPendingSync";
import { useAuth } from "@/context/AuthContext";
import { useRequestBootstrap, useSSE } from "@/hooks/useSSE";

/** Mount inside authenticated shells — loads requests + subscribes to SSE. */
export function RealtimeSync() {
  const { user } = useAuth();
  const enabled = user?.status === "active";
  const isAdmin = user?.role === "admin";

  useRequestBootstrap(enabled && !isAdmin);
  useSSE(enabled, user);
  useAdminPendingSync(enabled && isAdmin);

  return <SyncStatusBar />;
}

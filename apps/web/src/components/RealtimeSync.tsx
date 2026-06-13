import { useAuth } from "@/context/AuthContext";
import { SyncStatusBar } from "@/components/SyncStatusBar";
import { useAdminPendingSync } from "@/hooks/useAdminPendingSync";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { useRequestBootstrap, useSSE } from "@/hooks/useSSE";

/** Mount inside authenticated shells — loads requests + subscribes to SSE. */
export function RealtimeSync() {
  const { user } = useAuth();
  const enabled = user?.status === "active";
  const isAdmin = user?.role === "admin";
  const isStaff = user?.role === "staff";

  useRequestBootstrap(enabled && !isAdmin);
  useSSE(enabled, user);
  useAdminPendingSync(enabled && isAdmin);
  usePushNotifications(enabled && (isStaff || isAdmin));

  return <SyncStatusBar />;
}

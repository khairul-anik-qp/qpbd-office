import { useAuth } from "@/context/AuthContext";
import { SyncStatusBar } from "@/components/SyncStatusBar";
import { useRequestBootstrap, useSSE } from "@/hooks/useSSE";

/** Mount inside authenticated shells — loads requests + subscribes to SSE. */
export function RealtimeSync() {
  const { user } = useAuth();
  const enabled = user?.status === "active";
  useRequestBootstrap(enabled);
  useSSE(enabled, user);
  return <SyncStatusBar />;
}

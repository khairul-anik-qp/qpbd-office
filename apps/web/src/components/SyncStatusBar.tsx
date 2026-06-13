import { useEffect, useState } from "react";
import {
  getSseConnectionStatus,
  subscribeSseConnection,
} from "@/lib/sse-connection-store";

/** Shown when SSE is reconnecting after a connection drop. */
export function SyncStatusBar() {
  const [reconnecting, setReconnecting] = useState(
    () => getSseConnectionStatus() === "reconnecting",
  );

  useEffect(() => {
    return subscribeSseConnection(() => {
      setReconnecting(getSseConnectionStatus() === "reconnecting");
    });
  }, []);

  if (!reconnecting) return null;

  return (
    <div
      role="status"
      className="border-b border-warning/30 bg-warning-soft px-4 py-2 text-center text-sm text-warning"
    >
      Live updates paused — reconnecting…
    </div>
  );
}

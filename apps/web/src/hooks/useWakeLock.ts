import { useEffect } from "react";

/** Keep the screen awake while staff are on shift (Screen Wake Lock API). */
export function useWakeLock(enabled: boolean) {
  useEffect(() => {
    if (!enabled || !("wakeLock" in navigator)) return;

    let lock: WakeLockSentinel | null = null;
    let cancelled = false;

    const acquire = async () => {
      if (cancelled || document.hidden) return;
      try {
        lock?.release().catch(() => undefined);
        lock = await navigator.wakeLock.request("screen");
        lock.addEventListener("release", () => {
          lock = null;
        });
      } catch {
        // Unsupported, low battery, or not visible
      }
    };

    void acquire();

    const onVisibility = () => {
      if (!document.hidden) void acquire();
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", onVisibility);
      void lock?.release();
    };
  }, [enabled]);
}

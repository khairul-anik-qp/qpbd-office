import { useCallback, useEffect, useRef } from "react";
import { useRegisterSW } from "virtual:pwa-register/react";
import { api } from "@/lib/api";

const VAPID_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY as string | undefined;

function urlBase64ToUint8Array(base64: string): Uint8Array {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const raw = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(raw);
  const out = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) out[i] = binary.charCodeAt(i);
  return out;
}

/** Subscribe staff to Web Push (FCM via VAPID). Foreground updates use SSE. */
export function usePushNotifications(enabled: boolean) {
  const subscribedRef = useRef(false);

  const subscribePush = useCallback(async (registration: ServiceWorkerRegistration) => {
    if (!enabled || !VAPID_KEY || subscribedRef.current) return;
    if (Notification.permission === "denied") return;

    const permission =
      Notification.permission === "default"
        ? await Notification.requestPermission()
        : Notification.permission;
    if (permission !== "granted") return;

    try {
      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_KEY) as BufferSource,
      });
      const json = sub.toJSON();
      if (!json.endpoint || !json.keys?.p256dh || !json.keys?.auth) return;

      await api.pushSubscribe({
        endpoint: json.endpoint,
        keys: { p256dh: json.keys.p256dh, auth: json.keys.auth },
      });
      subscribedRef.current = true;
    } catch {
      // Push unavailable (no HTTPS, missing VAPID, etc.)
    }
  }, [enabled]);

  const { needRefresh, updateServiceWorker } = useRegisterSW({
    onRegisteredSW(_url, registration) {
      if (registration) void subscribePush(registration);
    },
  });

  useEffect(() => {
    if (needRefresh) void updateServiceWorker(true);
  }, [needRefresh, updateServiceWorker]);
}

import { useCallback, useEffect, useRef, useState } from "react";
import { useRegisterSW } from "virtual:pwa-register/react";
import { api } from "@/lib/api";

const VAPID_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY as string | undefined;

export type PushSetupStatus =
  | "unsupported"
  | "no-vapid"
  | "denied"
  | "prompt"
  | "subscribed";

function urlBase64ToUint8Array(base64: string): Uint8Array {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const raw = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(raw);
  const out = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) out[i] = binary.charCodeAt(i);
  return out;
}

function computeStatus(subscribed: boolean): PushSetupStatus {
  if (!("Notification" in window) || !("PushManager" in window)) return "unsupported";
  if (!VAPID_KEY) return "no-vapid";
  if (Notification.permission === "denied") return "denied";
  if (subscribed && Notification.permission === "granted") return "subscribed";
  return "prompt";
}

/** Subscribe staff to Web Push (FCM via VAPID). Exposes setup state for the staff banner. */
export function usePushSetup(enabled: boolean) {
  const subscribedRef = useRef(false);
  const registrationRef = useRef<ServiceWorkerRegistration | null>(null);
  const [status, setStatus] = useState<PushSetupStatus>(() =>
    computeStatus(false),
  );

  const refreshStatus = useCallback(() => {
    setStatus(computeStatus(subscribedRef.current));
  }, []);

  const subscribePush = useCallback(
    async (registration: ServiceWorkerRegistration, requestPermission = false) => {
      if (!enabled || !VAPID_KEY) {
        refreshStatus();
        return false;
      }
      if (Notification.permission === "denied") {
        refreshStatus();
        return false;
      }

      const current = Notification.permission;
      const permission: NotificationPermission =
        current === "default" && requestPermission
          ? await Notification.requestPermission()
          : current;
      if (permission !== "granted") {
        refreshStatus();
        return false;
      }

      try {
        const sub = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_KEY) as BufferSource,
        });
        const json = sub.toJSON();
        if (!json.endpoint || !json.keys?.p256dh || !json.keys?.auth) {
          refreshStatus();
          return false;
        }

        await api.pushSubscribe({
          endpoint: json.endpoint,
          keys: { p256dh: json.keys.p256dh, auth: json.keys.auth },
        });
        subscribedRef.current = true;
        refreshStatus();
        return true;
      } catch {
        refreshStatus();
        return false;
      }
    },
    [enabled, refreshStatus],
  );

  const enablePush = useCallback(async () => {
    const registration = registrationRef.current;
    if (!registration) return false;
    return subscribePush(registration, true);
  }, [subscribePush]);

  const { needRefresh, updateServiceWorker } = useRegisterSW({
    onRegisteredSW(_url, registration) {
      registrationRef.current = registration ?? null;
      if (registration) void subscribePush(registration, Notification.permission === "default");
    },
  });

  useEffect(() => {
    if (needRefresh) void updateServiceWorker(true);
  }, [needRefresh, updateServiceWorker]);

  useEffect(() => {
    if (!enabled) return;
    refreshStatus();
  }, [enabled, refreshStatus]);

  return { status, enablePush, refreshStatus };
}

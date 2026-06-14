/// <reference lib="webworker" />
import { clientsClaim } from "workbox-core";
import { precacheAndRoute } from "workbox-precaching";
import type { PushBridgeMessage, PushPayload } from "@office/shared";

declare const self: ServiceWorkerGlobalScope;

precacheAndRoute(self.__WB_MANIFEST);
clientsClaim();

const INSTANT_PUSH_TYPES = new Set<PushPayload["type"]>([
  "request.new",
  "request.forwarded",
]);

const NOTIFICATION_ICON = "/icons/icon-192.png";
const NOTIFICATION_BADGE = "/icons/icon-96.png";

function notifyOpenClients(payload: PushPayload) {
  if (!INSTANT_PUSH_TYPES.has(payload.type)) return;

  const message: PushBridgeMessage = {
    type: "office-push",
    pushType: payload.type,
    requestId: payload.requestId,
    urg: payload.urg,
  };

  void self.clients
    .matchAll({ type: "window", includeUncontrolled: true })
    .then((clients) => {
      for (const client of clients) {
        client.postMessage(message);
      }
    });
}

async function hasVisibleClient(): Promise<boolean> {
  const clients = await self.clients.matchAll({
    type: "window",
    includeUncontrolled: true,
  });
  return clients.some((client) => {
    if (client.visibilityState === "visible") return true;
    return "focused" in client && Boolean(client.focused);
  });
}

function notificationTag(payload: PushPayload): string {
  if (payload.type === "request.reminder") return "reminder";
  if (payload.type === "signup.pending") return "signup-pending";
  return payload.requestId ?? payload.type;
}

function buildNotificationOptions(
  payload: PushPayload,
  body: string | undefined,
) {
  const isUrgent = payload.urg === "urgent";
  const isInstant = INSTANT_PUSH_TYPES.has(payload.type);

  return {
    body,
    icon: NOTIFICATION_ICON,
    badge: NOTIFICATION_BADGE,
    silent: false,
    vibrate: isInstant
      ? isUrgent
        ? [300, 100, 300, 100, 300]
        : [200, 100, 200, 100, 200]
      : [200, 100, 200],
    requireInteraction: isUrgent,
    tag: notificationTag(payload),
    renotify: true,
    data: payload,
  } as NotificationOptions;
}

self.addEventListener("push", (event) => {
  if (!event.data) return;

  let payload: PushPayload & { title?: string; body?: string };
  try {
    payload = event.data.json();
  } catch {
    return;
  }

  const title =
    payload.title ?? `${payload.titleBn} · ${payload.titleEn}`;
  const body =
    payload.body ??
    (payload.bodyBn
      ? `${payload.bodyBn} · ${payload.bodyEn ?? ""}`
      : undefined);

  event.waitUntil(
    (async () => {
      const visible = await hasVisibleClient();
      notifyOpenClients(payload);

      // Foreground: in-app heads-up + chime. Background/minimized: OS notification.
      if (!visible) {
        await self.registration.showNotification(
          title,
          buildNotificationOptions(payload, body),
        );
      }
    })(),
  );
});

function notificationUrl(payload: PushPayload | undefined): string {
  if (!payload) return "/";
  if (payload.type === "signup.pending") return "/admin";
  if (payload.type === "request.reminder") return "/staff?tab=new";
  return "/staff?tab=new";
}

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const payload = event.notification.data as PushPayload | undefined;
  const url = notificationUrl(payload);

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clients) => {
        for (const client of clients) {
          if ("focus" in client) {
            void client.focus();
            void client.navigate(url);
            return;
          }
        }
        return self.clients.openWindow(url);
      }),
  );
});

/// <reference lib="webworker" />
import { clientsClaim } from "workbox-core";
import { precacheAndRoute } from "workbox-precaching";
import type { PushPayload } from "@office/shared";

declare const self: ServiceWorkerGlobalScope;

precacheAndRoute(self.__WB_MANIFEST);
clientsClaim();

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
    self.registration.showNotification(title, {
      body,
      icon: "/icons/icon.svg",
      badge: "/icons/icon.svg",
      tag:
        payload.type === "request.reminder"
          ? "reminder"
          : payload.type === "signup.pending"
            ? "signup-pending"
            : payload.requestId,
      data: payload,
    }),
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

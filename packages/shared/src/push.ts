import type { Urgency } from "./types.js";

/** Plan §13 — FCM / web-push notification types. */
export type PushType =
  | "request.new"
  | "request.forwarded"
  | "request.reminder"
  | "signup.pending";

export interface PushPayload {
  type: PushType;
  /** Deep-link to a specific request (instant pushes). */
  requestId?: string;
  /** Queue count for reminder pushes. */
  count?: number;
  /** Request urgency — used by SW for requireInteraction + client chime. */
  urg?: Urgency;
  titleBn: string;
  titleEn: string;
  bodyBn?: string;
  bodyEn?: string;
}

/** Service worker → client message when a push is received. */
export interface PushBridgeMessage {
  type: "office-push";
  pushType: PushType;
  requestId?: string;
  urg?: Urgency;
}

/** POST /push/subscribe — Web Push subscription from the browser. */
export interface PushSubscribeDto {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

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
  titleBn: string;
  titleEn: string;
  bodyBn?: string;
  bodyEn?: string;
}

/** POST /push/subscribe — Web Push subscription from the browser. */
export interface PushSubscribeDto {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

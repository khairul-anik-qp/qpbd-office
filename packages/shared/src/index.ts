// @office/shared — domain types & constants shared by web + api.

export const SHARED_VERSION = "0.1.0";

/** API health-check shape (used by GET /health). */
export interface Health {
  ok: boolean;
  service: string;
}

export * from "./types.js";
export * from "./constants.js";
export * from "./icons.js";
export * from "./auth.js";
export * from "./users.js";
export * from "./assignment.js";
export * from "./requests.js";
export * from "./push.js";
export * from "./staff-count.js";

// @office/shared — domain types & constants shared by web + api.
// Full types/constants (User, Request, LOCATIONS, TYPES, icon maps) land in issue #2.
// This placeholder exists so both apps can verify the workspace import wiring.

export const SHARED_VERSION = "0.1.0";

export interface Health {
  ok: boolean;
  service: string;
}

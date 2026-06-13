// Central Material Symbols mapping (shadcn.io/icons). Source: plan.md §7.
// Keeps a future swap to Wick `wm-*`/`wc-*` icons localized to this file.
import type { RequestType } from "./types.js";

export const REQUEST_TYPE_ICONS: Record<RequestType, string> = {
  tea: "local_cafe",
  snack: "tapas",
  supply: "inventory_2",
  printer: "print",
  help: "handyman",
  other: "add_circle",
};

export const UI_ICONS = {
  accept: "check_circle",
  forward: "forward",
  forwardInbox: "forward_to_inbox",
  done: "task_alt",
  schedule: "schedule",
  urgent: "priority_high",
  location: "location_on",
  note: "sticky_note_2",
  notify: "notifications",
  person: "person",
  groups: "groups",
  send: "send",
  back: "arrow_back",
  close: "close",
  inbox: "inbox",
  install: "install_desktop",
  more: "more_horiz",
  add: "add",
  check: "check",
} as const;

export type UiIcon = keyof typeof UI_ICONS;

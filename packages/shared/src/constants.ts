// Hardcoded v1 constants. Source: plan.md §5/§6, prototype `TYPES`/`STAFF`/locations.
import type { Availability, RequestType } from "./types.js";

export interface Location {
  id: string;
  en: string;
  bn: string;
}

/** Hardcoded office locations (v1). */
export const LOCATIONS: readonly Location[] = [
  { id: "l1", en: "Dev desk 1", bn: "ডেভ ডেস্ক ১" },
  { id: "l2", en: "Dev desk 2", bn: "ডেভ ডেস্ক ২" },
  { id: "l3", en: "Dev desk 3", bn: "ডেভ ডেস্ক ৩" },
  { id: "l4", en: "Dev desk 4", bn: "ডেভ ডেস্ক ৪" },
  { id: "l5", en: "Marketing desk", bn: "মার্কেটিং ডেস্ক" },
  { id: "l6", en: "Meeting room", bn: "মিটিং রুম" },
  { id: "l7", en: "Admin room", bn: "অ্যাডমিন রুম" },
  { id: "l8", en: "Dining room", bn: "ডাইনিং রুম" },
] as const;

export interface RequestTypeDef {
  /** Material Symbols icon name (see REQUEST_TYPE_ICONS) */
  icon: string;
  bn: string;
  en: string;
  /** tile background */
  bg: string;
  /** tile foreground */
  fg: string;
  /** quick-option chips (Bangla tokens), toggled into the note */
  options: string[];
}

/** Request types: labels, tile colors, quick-option chips. Source: prototype `TYPES`. */
export const TYPES: Record<RequestType, RequestTypeDef> = {
  tea: {
    icon: "local_cafe",
    bn: "চা / কফি",
    en: "Tea / coffee",
    bg: "#FEEFB3",
    fg: "#9F6000",
    options: [
      "ব্ল্যাক কফি",
      "দুধ কফি",
      "দুধ চা",
      "গ্রিন টি",
      "আদা চা",
      "কম চিনি",
      "চিনি ছাড়া",
    ],
  },
  snack: {
    icon: "tapas",
    bn: "চানাচুর মাখা",
    en: "Chanachur makha",
    bg: "#FFE2C2",
    fg: "#B5651D",
    options: [
      "ঝাল বেশি",
      "কম ঝাল",
      "পেঁয়াজ বেশি",
      "লেবু",
      "সরিষার তেল",
    ],
  },
  supply: {
    icon: "inventory_2",
    bn: "অফিস সামগ্রী",
    en: "Office supplies",
    bg: "#CCF0FF",
    fg: "#215694",
    options: [
      "A4 পেপার",
      "কলম",
      "মার্কার",
      "স্ট্যাপলার",
      "ফাইল",
      "স্টিকি নোট",
    ],
  },
  printer: {
    icon: "print",
    bn: "প্রিন্টার / আইটি",
    en: "Printer / IT help",
    bg: "#E1F0FB",
    fg: "#1B87E6",
    options: [
      "কাগজ আটকে গেছে",
      "টোনার শেষ",
      "প্রিন্ট হচ্ছে না",
      "স্ক্যান দরকার",
      "কানেক্ট হচ্ছে না",
    ],
  },
  help: {
    icon: "handyman",
    bn: "সহায়তা",
    en: "Assistance",
    bg: "#DFF2BF",
    fg: "#227700",
    options: [
      "এসি",
      "লাইট / ফ্যান",
      "ফার্নিচার সরানো",
      "পরিষ্কার",
      "দরজা / তালা",
    ],
  },
  other: {
    icon: "add_circle",
    bn: "অন্যান্য",
    en: "Something else",
    bg: "#F5F5F5",
    fg: "#545E6B",
    options: [],
  },
};

/** Helper availability chip colors. Source: plan.md §5. */
export const AVAILABILITY_COLORS: Record<Availability, string> = {
  available: "#227700",
  busy: "#9F6000",
  away: "#9B9B9B",
};

/**
 * Brand colors assigned to staff at random on approval (issue #7).
 * Seeded with the prototype's two staff colors, extended for more staff.
 */
export const STAFF_BRAND_PALETTE: readonly string[] = [
  "#1B87E6", // electric blue (Karim)
  "#227700", // green (Jamal)
  "#9F6000", // amber
  "#7A3FB5", // purple
  "#C0392B", // red
  "#0E8A8A", // teal
  "#B5651D", // brown
  "#215694", // navy
] as const;

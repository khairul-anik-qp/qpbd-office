// Hardcoded v1 constants. Source: plan.md §5/§6, prototype `TYPES`/`STAFF`/locations.
import type { Availability, RequestType } from "./types.js";

export interface Location {
  id: string;
  en: string;
  bn: string;
}

/** Hardcoded office locations (v1). */
export const LOCATIONS: readonly Location[] = [
  { id: "l1", en: "3F · Dev desk", bn: "৩য় তলা · ডেভ ডেস্ক" },
  { id: "l2", en: "4F · Meeting room", bn: "৪র্থ তলা · মিটিং রুম" },
  { id: "l3", en: "Reception", bn: "রিসেপশন" },
  { id: "l4", en: "2F · Pantry", bn: "২য় তলা · প্যান্ট্রি" },
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
  /** quick-option chips ("bn · en" tokens), toggled into the note */
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
      "র কফি · Black coffee",
      "দুধ কফি · White coffee",
      "দুধ চা · Milk tea",
      "গ্রিন টি · Green tea",
      "আদা চা · Ginger tea",
      "কম চিনি · Low sugar",
      "চিনি ছাড়া · No sugar",
    ],
  },
  snack: {
    icon: "tapas",
    bn: "চানাচুর মাখা",
    en: "Chanachur makha",
    bg: "#FFE2C2",
    fg: "#B5651D",
    options: [
      "ঝাল বেশি · Extra spicy",
      "কম ঝাল · Mild",
      "পেঁয়াজ বেশি · Extra onion",
      "লেবু · With lemon",
      "সরিষার তেল · Mustard oil",
    ],
  },
  supply: {
    icon: "inventory_2",
    bn: "অফিস সামগ্রী",
    en: "Office supplies",
    bg: "#CCF0FF",
    fg: "#215694",
    options: [
      "A4 পেপার · A4 paper",
      "কলম · Pens",
      "মার্কার · Whiteboard marker",
      "স্ট্যাপলার · Stapler",
      "ফাইল · File folder",
      "স্টিকি নোট · Sticky notes",
    ],
  },
  printer: {
    icon: "print",
    bn: "প্রিন্টার / আইটি",
    en: "Printer / IT help",
    bg: "#E1F0FB",
    fg: "#1B87E6",
    options: [
      "কাগজ আটকে গেছে · Paper jam",
      "টোনার শেষ · Out of toner",
      "প্রিন্ট হচ্ছে না · Not printing",
      "স্ক্যান দরকার · Need to scan",
      "কানেক্ট হচ্ছে না · Won’t connect",
    ],
  },
  help: {
    icon: "handyman",
    bn: "সহায়তা",
    en: "Assistance",
    bg: "#DFF2BF",
    fg: "#227700",
    options: [
      "এসি · AC",
      "লাইট / ফ্যান · Light / Fan",
      "ফার্নিচার সরানো · Move furniture",
      "পরিষ্কার · Cleaning",
      "দরজা / তালা · Door / Lock",
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

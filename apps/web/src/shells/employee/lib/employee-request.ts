import type { Availability, Request, RequestStatus, RequestType, User, Urgency } from "@office/shared";
import { LOCATIONS, TYPES, staffFirstName } from "@office/shared";

export type AllFilter = "all" | RequestStatus;

export const ALL_FILTERS: { key: AllFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "new", label: "Waiting" },
  { key: "progress", label: "In progress" },
  { key: "done", label: "Completed" },
];

export const AVAILABILITY_LABELS: Record<
  Availability,
  { en: string; soft: string; color: string }
> = {
  available: { en: "Available", soft: "#DFF2BF", color: "#227700" },
  busy: { en: "Busy", soft: "#FEEFB3", color: "#9F6000" },
  away: { en: "Away", soft: "#EEEEEE", color: "#9B9B9B" },
};

export function staffInitial(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return "?";
  const parts = trimmed.split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0]![0]! + parts[1]![0]!).toUpperCase();
  }
  return trimmed.slice(0, 2).toUpperCase();
}

export function userInitials(nameEn: string): string {
  return staffInitial(nameEn);
}

export function locationLabel(locId: string): string {
  return LOCATIONS.find((l) => l.id === locId)?.en ?? locId;
}

export function formatClock(ts: string | number): string {
  const d = new Date(ts);
  let h = d.getHours();
  const mm = String(d.getMinutes()).padStart(2, "0");
  const ap = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${h}:${mm} ${ap}`;
}

export function agoEn(ts: string | number, now: number): string {
  const m = Math.floor((now - new Date(ts).getTime()) / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  return `${Math.floor(m / 60)}h ago`;
}

export function dayDiff(ts: string | number, now: number): number {
  const startOf = (x: number) => {
    const d = new Date(x);
    return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  };
  return Math.round((startOf(now) - startOf(new Date(ts).getTime())) / 86400000);
}

export function dayLabel(ts: string | number, now: number): string {
  const d = dayDiff(ts, now);
  if (d <= 0) return "Today";
  if (d === 1) return "Yesterday";
  return new Date(ts).toLocaleDateString("en-US", { day: "numeric", month: "short" });
}

export function noteTokens(note: string): string[] {
  return note
    .split(/\s*,\s*/)
    .map((x) => x.trim())
    .filter(Boolean);
}

export function toggleNoteToken(note: string, label: string): string {
  const tokens = noteTokens(note);
  const next = tokens.includes(label)
    ? tokens.filter((t) => t !== label)
    : [...tokens, label];
  return next.join(", ");
}

export interface AssignmentResult {
  assignee: string | null;
  busyToast?: string;
}

/** Re-export plan §6 routing from shared (backend is source of truth in Phase 4). */
export { resolveAssignment } from "@office/shared";

export function statusChip(status: RequestStatus): { text: string; bg: string; fg: string } {
  if (status === "new") return { text: "Waiting", bg: "#FEEFB3", fg: "#9F6000" };
  if (status === "progress") return { text: "In progress", bg: "#CCF0FF", fg: "#215694" };
  return { text: "Completed", bg: "#DFF2BF", fg: "#227700" };
}

export interface ProgressStep {
  label: string;
  done: boolean;
  current: boolean;
  time: string;
}

export function buildProgressSteps(request: Request): ProgressStep[] {
  return [
    {
      label: "Sent",
      done: true,
      current: false,
      time: formatClock(request.createdAt),
    },
    {
      label: "Accepted",
      done: request.status !== "new",
      current: request.status === "new",
      time: request.acceptedAt ? formatClock(request.acceptedAt) : "",
    },
    {
      label: "Completed",
      done: request.status === "done",
      current: request.status === "progress",
      time: request.doneAt ? formatClock(request.doneAt) : "",
    },
  ];
}

export function requestStats(requests: Request[], now: number) {
  const open = requests.filter((r) => r.status === "new").length;
  const progress = requests.filter((r) => r.status === "progress").length;
  const doneToday = requests.filter(
    (r) => r.status === "done" && dayDiff(r.createdAt, now) <= 0,
  ).length;

  const thirtyDaysAgo = now - 30 * 86400000;
  const withResponse = requests.filter(
    (r) => r.acceptedAt && new Date(r.createdAt).getTime() >= thirtyDaysAgo,
  );
  let avgResponse = "—";
  if (withResponse.length > 0) {
    const totalMin = withResponse.reduce((sum, r) => {
      const ms = new Date(r.acceptedAt!).getTime() - new Date(r.createdAt).getTime();
      return sum + ms / 60000;
    }, 0);
    const avg = Math.round(totalMin / withResponse.length);
    avgResponse = avg < 60 ? `~${avg}m` : `~${Math.round(avg / 60)}h`;
  }

  return { open, progress, doneToday, avgResponse };
}

export function assigneeLine(
  request: Request,
  staffById: Map<string, User>,
): { icon: "person" | "handyman"; text: string } {
  if (request.status === "new") {
    const name =
      request.assigneeName ??
      (request.assignee
        ? staffFirstName(staffById.get(request.assignee)?.nameEn ?? "")
        : null);
    return { icon: "person", text: name ? `For ${name}` : "For office team" };
  }
  const handler = request.acceptedBy
    ? staffFirstName(staffById.get(request.acceptedBy)?.nameEn ?? "")
    : "—";
  if (request.forwardedBy) {
    const forwarded = staffFirstName(staffById.get(request.forwardedBy)?.nameEn ?? "");
    if (forwarded && forwarded !== handler) {
      return { icon: "handyman", text: `Handled by ${handler} · Forwarded from ${forwarded}` };
    }
  }
  return { icon: "handyman", text: `Handled by ${handler}` };
}

export function requestMeta(request: Request, now: number): string {
  const ty = TYPES[request.type];
  const bits = [locationLabel(request.loc), request.note, agoEn(request.createdAt, now)].filter(
    Boolean,
  );
  return bits.join("  ·  ");
}

export const REQUEST_TYPES = Object.keys(TYPES) as RequestType[];

export interface CreateFormState {
  type: RequestType | null;
  loc: string;
  urg: Urgency;
  note: string;
  assignee: string | null;
}

export function defaultCreateForm(): CreateFormState {
  return {
    type: null,
    loc: LOCATIONS[0]?.id ?? "",
    urg: "normal",
    note: "",
    assignee: null,
  };
}


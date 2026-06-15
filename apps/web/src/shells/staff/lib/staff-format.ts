import type { Availability, Request, User } from "@office/shared";
import {
  LOCATIONS,
  isInOfficeCalendarDay,
  OFFICE_TIMEZONE,
  isVisibleToStaff as sharedIsVisible,
  sortRequestsForTab,
  staffFirstName,
} from "@office/shared";

/** Staff phone tabs — discarded requests are hidden from staff UI. */
export type PhoneTab = "new" | "progress" | "done";

export const AVAILABILITY_LABELS: Record<
  Availability,
  { bn: string; en: string; soft: string; color: string }
> = {
  available: { bn: "উপস্থিত", en: "Available", soft: "#DFF2BF", color: "#227700" },
  busy: { bn: "ব্যস্ত", en: "Busy", soft: "#FEEFB3", color: "#9F6000" },
  away: { bn: "অনুপস্থিত", en: "Away", soft: "#EEEEEE", color: "#9B9B9B" },
};

export const EMPTY_TAB: Record<PhoneTab, { bn: string; en: string }> = {
  new: { bn: "কোনো নতুন অনুরোধ নেই", en: "No new requests" },
  progress: { bn: "চলমান কোনো কাজ নেই", en: "Nothing in progress" },
  done: { bn: "এখনো কিছু সম্পন্ন হয়নি", en: "Nothing completed yet" },
};

const BN_DIGITS = "০১২৩৪৫৬৭৮৯";

/** Bangla digits for counts and time-ago (README §Responsive / i18n). */
export function bnNum(n: number): string {
  return String(n).replace(/[0-9]/g, (d) => BN_DIGITS[+d]!);
}

export function agoBn(ts: string | number, now: number): string {
  const m = Math.floor((now - new Date(ts).getTime()) / 60000);
  if (m < 1) return "এইমাত্র";
  if (m < 60) return `${bnNum(m)} মিনিট আগে`;
  return `${bnNum(Math.floor(m / 60))} ঘণ্টা আগে`;
}

export function locationBn(locId: string): string {
  return LOCATIONS.find((l) => l.id === locId)?.bn ?? locId;
}

export function staffAvatarInitial(user: User): string {
  const first = staffFirstName(user.nameEn);
  if (first === "—") return "?";
  return first[0]!.toUpperCase();
}

export function staffStatusPill(
  status: PhoneTab | "discarded",
  urg: Request["urg"],
): { text: string; bg: string; fg: string } {
  if (status === "done") return { text: "সম্পন্ন", bg: "#DFF2BF", fg: "#227700" };
  if (status === "progress") return { text: "চলছে", bg: "#FEEFB3", fg: "#9F6000" };
  if (urg === "urgent") return { text: "জরুরি", bg: "#FFBABA", fg: "#CC0000" };
  return { text: "নতুন", bg: "#CCF0FF", fg: "#215694" };
}

export function isVisibleToStaff(request: Request, staffId: string): boolean {
  return sharedIsVisible(request, staffId);
}

export function isInStaffShift(
  request: Request,
  now: number,
  timeZone: string = OFFICE_TIMEZONE,
): boolean {
  return isInOfficeCalendarDay(request.createdAt, new Date(now), timeZone);
}

export function tabCount(
  requests: Request[],
  staffId: string,
  tab: PhoneTab,
  now: number,
  timeZone?: string,
): number {
  return requests.filter(
    (r) =>
      r.status === tab &&
      isVisibleToStaff(r, staffId) &&
      isInStaffShift(r, now, timeZone),
  ).length;
}

export function sortForTab(requests: Request[], tab: PhoneTab): Request[] {
  return sortRequestsForTab(requests, tab);
}

export function shouldNotifyStaff(
  request: Request,
  staffId: string,
  now: number,
  timeZone?: string,
): boolean {
  if (request.status !== "new") return false;
  if (request.forwardedBy === staffId) return false;
  if (!isInStaffShift(request, now, timeZone)) return false;
  return request.assignee === staffId || request.assignee === null;
}

export interface ForwardToast {
  bn: string;
  en: string;
}

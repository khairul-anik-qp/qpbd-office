import type { Availability, Request, RequestStatus, User } from "@office/shared";
import { LOCATIONS } from "@office/shared";

export type PhoneTab = RequestStatus;

export const AVAILABILITY_LABELS: Record<
  Availability,
  { bn: string; en: string; soft: string; color: string }
> = {
  available: { bn: "উপলব্ধ", en: "Available", soft: "#DFF2BF", color: "#227700" },
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

export function staffBanglaInitial(user: User): string {
  const bn = user.nameBn?.trim();
  if (bn) return bn[0]!;
  const en = user.nameEn.trim();
  if (!en) return "?";
  return en[0]!.toUpperCase();
}

export function staffStatusPill(
  status: RequestStatus,
  urg: Request["urg"],
): { text: string; bg: string; fg: string } {
  if (status === "done") return { text: "সম্পন্ন", bg: "#DFF2BF", fg: "#227700" };
  if (status === "progress") return { text: "চলছে", bg: "#FEEFB3", fg: "#9F6000" };
  if (urg === "urgent") return { text: "জরুরি", bg: "#FFBABA", fg: "#CC0000" };
  return { text: "নতুন", bg: "#CCF0FF", fg: "#215694" };
}

export function isVisibleToStaff(request: Request, staffId: string): boolean {
  if (request.status === "new") {
    return request.assignee === staffId || request.assignee === null;
  }
  if (request.status === "progress") {
    return request.acceptedBy === staffId;
  }
  return request.doneBy === staffId;
}

export function tabCount(requests: Request[], staffId: string, tab: PhoneTab): number {
  return requests.filter((r) => r.status === tab && isVisibleToStaff(r, staffId)).length;
}

export function sortForTab(requests: Request[], tab: PhoneTab): Request[] {
  const list = [...requests];
  if (tab === "new") {
    list.sort(
      (a, b) =>
        Number(b.urg === "urgent") - Number(a.urg === "urgent") ||
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );
  } else if (tab === "done") {
    list.sort(
      (a, b) =>
        new Date(b.doneAt ?? 0).getTime() - new Date(a.doneAt ?? 0).getTime(),
    );
  } else {
    list.sort(
      (a, b) =>
        new Date(a.acceptedAt ?? 0).getTime() - new Date(b.acceptedAt ?? 0).getTime(),
    );
  }
  return list;
}

export function shouldNotifyStaff(request: Request, staffId: string): boolean {
  if (request.status !== "new") return false;
  return request.assignee === staffId || request.assignee === null;
}

export interface ForwardToast {
  bn: string;
  en: string;
}

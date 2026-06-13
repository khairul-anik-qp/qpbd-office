import type { Request, User } from "@office/shared";
import { TYPES } from "@office/shared";
import { Icon, TypeIcon } from "@/components/Icon";
import {
  agoBn,
  locationBn,
  staffStatusPill,
} from "../lib/staff-format";
import { ForwardPicker } from "./ForwardPicker";

interface TwoLineButtonProps {
  icon: "check_circle" | "forward" | "task_alt";
  labelBn: string;
  labelEn: string;
  variant: "primary" | "outline" | "success";
  onClick: () => void;
  className?: string;
}

function TwoLineButton({
  icon,
  labelBn,
  labelEn,
  variant,
  onClick,
  className = "",
}: TwoLineButtonProps) {
  const styles =
    variant === "primary"
      ? "border-none bg-electric text-white shadow-sm"
      : variant === "success"
        ? "border-none bg-success text-white shadow-sm"
        : "border border-border bg-card text-electric hover:border-electric hover:bg-[#F5F9FE]";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex min-h-[54px] flex-1 items-center justify-center gap-2 rounded-action px-2.5 py-2 ${styles} ${className}`}
    >
      <Icon name={icon} className="size-[22px] shrink-0" aria-hidden />
      <span className="flex flex-col items-center gap-px">
        <span className="text-base font-medium leading-[19px]">{labelBn}</span>
        <span className="text-[11px] leading-[13px] opacity-85">{labelEn}</span>
      </span>
    </button>
  );
}

interface StaffRequestCardProps {
  request: Request;
  currentStaffId: string;
  staffById: Map<string, User>;
  otherStaff: User[];
  availabilityFor: (id: string) => User["availability"];
  isForwarding: boolean;
  now: number;
  onAccept: () => void;
  onStartForward: () => void;
  onCancelForward: () => void;
  onForward: (targetId: string) => void;
  onComplete: () => void;
}

export function StaffRequestCard({
  request,
  currentStaffId,
  staffById,
  otherStaff,
  availabilityFor,
  isForwarding,
  now,
  onAccept,
  onStartForward,
  onCancelForward,
  onForward,
  onComplete,
}: StaffRequestCardProps) {
  const ty = TYPES[request.type];
  const pill = staffStatusPill(request.status, request.urg);
  const assignee = request.assignee ? staffById.get(request.assignee) : null;
  const forwardedBy = request.forwardedBy ? staffById.get(request.forwardedBy) : null;
  const isClaim = request.assignee === null;
  const canActOnProgress = request.acceptedBy === currentStaffId;

  return (
    <article className="relative overflow-hidden rounded-helper border border-border bg-card shadow-pop">
      <div
        className="absolute bottom-0 left-0 top-0 w-[5px]"
        style={{ backgroundColor: request.urg === "urgent" ? "#CC0000" : "transparent" }}
        aria-hidden
      />

      <div className="px-3.5 pb-3.5 pt-3.5 pl-[19px]">
        <div className="flex items-start gap-3">
          <span
            className="flex size-[54px] shrink-0 items-center justify-center rounded-[13px]"
            style={{ backgroundColor: ty.bg, color: ty.fg }}
          >
            <TypeIcon type={request.type} className="size-[31px]" aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <h3 className="text-xl font-medium leading-6 text-ink">{ty.bn}</h3>
              <span
                className="inline-flex shrink-0 items-center rounded-full px-[11px] py-0.5 text-xs font-medium leading-[18px]"
                style={{ backgroundColor: pill.bg, color: pill.fg }}
              >
                {pill.text}
              </span>
            </div>
            <p className="mt-0.5 text-sm leading-[18px] text-lead">{ty.en}</p>
            <span
              className="mt-1.5 inline-flex items-center rounded px-2.5 py-[3px] text-xs font-medium leading-4"
              style={
                assignee
                  ? { backgroundColor: "#E1F0FB", color: "#1B87E6" }
                  : { backgroundColor: "#F5F5F5", color: "#545E6B" }
              }
            >
              {assignee
                ? `→ ${assignee.nameBn ?? assignee.nameEn}`
                : "যে কেউ · Anyone"}
            </span>
          </div>
        </div>

        <ul className="mt-3 flex flex-col gap-1.5 text-[13px] leading-[18px] text-lead">
          <li className="flex items-start gap-2">
            <Icon name="location_on" className="mt-0.5 size-4 shrink-0 opacity-70" aria-hidden />
            {locationBn(request.loc)}
          </li>
          {request.note ? (
            <li className="flex items-start gap-2">
              <Icon name="sticky_note_2" className="mt-0.5 size-4 shrink-0 opacity-70" aria-hidden />
              {request.note}
            </li>
          ) : null}
          {forwardedBy ? (
            <li className="flex items-start gap-2 text-electric">
              <Icon name="forward" className="mt-0.5 size-4 shrink-0" aria-hidden />
              {forwardedBy.nameBn ?? forwardedBy.nameEn} থেকে · Forwarded by{" "}
              {forwardedBy.nameEn}
            </li>
          ) : null}
          <li className="flex items-start gap-2">
            <Icon name="schedule" className="mt-0.5 size-4 shrink-0 opacity-70" aria-hidden />
            {agoBn(request.createdAt, now)} · {request.requester}
          </li>
        </ul>

        {request.status === "new" && !isForwarding ? (
          <div className="mt-3.5 flex gap-2">
            <TwoLineButton
              icon="check_circle"
              labelBn={isClaim ? "গ্রহণ" : "গ্রহণ করুন"}
              labelEn={isClaim ? "Claim & accept" : "Accept"}
              variant="primary"
              onClick={onAccept}
            />
            <TwoLineButton
              icon="forward"
              labelBn="ফরওয়ার্ড"
              labelEn="Forward"
              variant="outline"
              onClick={onStartForward}
            />
          </div>
        ) : null}

        {request.status === "new" && isForwarding ? (
          <ForwardPicker
            targets={otherStaff}
            availabilityFor={(id) => availabilityFor(id) ?? "away"}
            onSelect={onForward}
            onCancel={onCancelForward}
          />
        ) : null}

        {request.status === "progress" && canActOnProgress ? (
          <div className="mt-3.5">
            <TwoLineButton
              icon="task_alt"
              labelBn="সম্পন্ন করুন"
              labelEn="Mark as done"
              variant="success"
              onClick={onComplete}
              className="w-full"
            />
          </div>
        ) : null}

        {request.status === "done" ? (
          <div className="mt-3.5 flex items-center justify-center gap-2 rounded-action bg-success-soft py-3 text-success">
            <Icon name="task_alt" className="size-[22px]" aria-hidden />
            <span className="text-base font-medium leading-[19px]">
              সম্পন্ন · Completed
            </span>
          </div>
        ) : null}
      </div>
    </article>
  );
}

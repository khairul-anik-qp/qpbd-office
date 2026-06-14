import type { Request } from "@office/shared";
import { TYPES } from "@office/shared";
import { Icon, TypeIcon } from "@/components/Icon";
import { locationBn } from "../lib/staff-format";

interface PushHeadsUpProps {
  request: Request;
  onView: () => void;
  onAccept: () => void;
  onDismiss: () => void;
}

export function PushHeadsUp({ request, onView, onAccept, onDismiss }: PushHeadsUpProps) {
  const ty = TYPES[request.type];
  const isUrgent = request.urg === "urgent";

  return (
    <div
      role="alertdialog"
      aria-labelledby="push-notif-title"
      className="animate-notif-in absolute left-[11px] right-[11px] top-[50px] z-50 rounded-[18px] border border-divider bg-card p-[13px_15px] shadow-notif"
    >
      <div className="flex items-center gap-[9px]">
        <span className="relative inline-flex size-[26px] shrink-0 items-center justify-center rounded-lg bg-dark-blue">
          <span className="absolute inset-0 animate-notif-ring rounded-lg bg-electric" aria-hidden />
          <Icon
            name="install_desktop"
            className="relative size-4 text-white"
            aria-hidden
          />
        </span>
        <span className="text-[13px] font-medium leading-4 text-lead">QuestionPro Office</span>
        {isUrgent ? (
          <span className="rounded-md bg-danger-soft px-1.5 py-0.5 text-[11px] font-medium leading-4 text-danger">
            জরুরি · Urgent
          </span>
        ) : null}
        <button
          type="button"
          onClick={onDismiss}
          className="ml-auto rounded p-0.5 text-muted-gray hover:text-lead"
          aria-label="Dismiss notification"
        >
          <Icon name="close" className="size-4" aria-hidden />
        </button>
      </div>

      <div className="mt-2.5 flex items-start gap-[11px]">
        <span
          className="flex size-10 shrink-0 items-center justify-center rounded-[10px]"
          style={{ backgroundColor: ty.bg, color: ty.fg }}
        >
          <TypeIcon type={request.type} className="size-6" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <p id="push-notif-title" className="text-[15px] font-medium leading-5 text-ink">
            নতুন অনুরোধ · New request
          </p>
          <p className="text-sm leading-[19px] text-lead">
            {ty.bn} — {locationBn(request.loc)}
          </p>
        </div>
      </div>

      <div className="mt-3 flex gap-[9px]">
        <button
          type="button"
          onClick={onView}
          className="flex-1 rounded-[9px] border border-border bg-card px-2.5 py-2.5 text-sm leading-4 text-lead"
        >
          দেখুন · View
        </button>
        <button
          type="button"
          onClick={onAccept}
          className="flex-1 rounded-[9px] border-none bg-electric px-2.5 py-2.5 text-sm font-medium leading-4 text-white"
        >
          গ্রহণ · Accept
        </button>
      </div>
    </div>
  );
}

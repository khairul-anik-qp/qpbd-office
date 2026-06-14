import type { Request, User } from "@office/shared";
import { TYPES } from "@office/shared";
import { Icon, TypeIcon } from "@/components/Icon";
import {
  assigneeLine,
  buildProgressSteps,
  doneInText,
  requestMeta,
  statusChip,
} from "../lib/employee-request";
import { ProgressTracker } from "./ProgressTracker";

interface RequestRowProps {
  request: Request;
  staffById: Map<string, User>;
  now: number;
  onCancel?: () => void;
  onToggleFavorite?: () => void;
}

export function RequestRow({ request, staffById, now, onCancel, onToggleFavorite }: RequestRowProps) {
  const def = TYPES[request.type];
  const chip = statusChip(request.status);
  const assign = assigneeLine(request, staffById);
  const steps = buildProgressSteps(request);
  const meta = requestMeta(request, now);
  const doneIn = doneInText(request);

  return (
    <article className="flex gap-3.5 rounded-[10px] border border-border bg-card p-4">
      <span
        className="flex size-[42px] shrink-0 items-center justify-center rounded-[9px]"
        style={{ backgroundColor: def.bg, color: def.fg }}
      >
        <TypeIcon type={request.type} className="size-[23px]" />
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex flex-col gap-1">
            <h3 className="text-base font-medium leading-6 text-ink">{def.en}</h3>
            <p className="text-[13px] leading-4 text-muted-gray">{meta}</p>
            <p className="flex items-center gap-1.5 text-xs leading-4 text-muted-gray">
              <Icon name={assign.icon} className="size-[15px] text-electric" aria-hidden />
              {assign.text}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            {onToggleFavorite && (
              <button
                type="button"
                onClick={onToggleFavorite}
                aria-label={request.isFavorite ? "Remove from favorites" : "Mark as favorite"}
                title={request.isFavorite ? "Remove from favorites" : "Mark as favorite"}
                className={`flex items-center justify-center rounded p-0.5 transition-colors ${request.isFavorite ? "text-red-400 hover:text-muted-gray" : "text-muted-gray hover:text-red-400"}`}
              >
                <Icon name={request.isFavorite ? "favorite-fill" : "favorite"} className="size-[18px]" />
              </button>
            )}
            <span
              className="inline-flex items-center rounded px-2.5 py-0.5 text-xs font-medium leading-4"
              style={{ backgroundColor: chip.bg, color: chip.fg }}
            >
              {chip.text}
            </span>
          </div>
        </div>
        <ProgressTracker steps={steps} />
        {doneIn && (
          <p className="text-xs font-medium text-green-700">{doneIn}</p>
        )}
        {onCancel && (
          <div className="flex justify-end">
            <button
              type="button"
              onClick={onCancel}
              className="text-xs text-muted-gray hover:text-red-500 transition-colors"
            >
              Cancel request
            </button>
          </div>
        )}
      </div>
    </article>
  );
}

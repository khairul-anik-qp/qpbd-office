import type { Request, User } from "@office/shared";
import { TYPES } from "@office/shared";
import { Icon, TypeIcon } from "@/components/Icon";
import {
  assigneeLine,
  buildProgressSteps,
  requestMeta,
  statusChip,
} from "../lib/employee-request";
import { ProgressTracker } from "./ProgressTracker";

interface RequestRowProps {
  request: Request;
  staffById: Map<string, User>;
  now: number;
}

export function RequestRow({ request, staffById, now }: RequestRowProps) {
  const def = TYPES[request.type];
  const chip = statusChip(request.status);
  const assign = assigneeLine(request, staffById);
  const steps = buildProgressSteps(request);
  const meta = requestMeta(request, now);

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
          <span
            className="inline-flex shrink-0 items-center rounded px-2.5 py-0.5 text-xs font-medium leading-4"
            style={{ backgroundColor: chip.bg, color: chip.fg }}
          >
            {chip.text}
          </span>
        </div>
        <ProgressTracker steps={steps} />
      </div>
    </article>
  );
}

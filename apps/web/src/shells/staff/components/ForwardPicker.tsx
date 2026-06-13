import type { Availability, User } from "@office/shared";
import { Icon } from "@/components/Icon";
import { AVAILABILITY_LABELS, staffBanglaInitial } from "../lib/staff-format";

interface ForwardPickerProps {
  targets: User[];
  availabilityFor: (id: string) => Availability;
  onSelect: (targetId: string) => void;
  onCancel: () => void;
}

export function ForwardPicker({ targets, availabilityFor, onSelect, onCancel }: ForwardPickerProps) {
  return (
    <div className="border-t border-[#EEEEEE] pt-[13px]">
      <div className="mb-2.5 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-sm font-medium leading-[18px] text-ink">
          <Icon name="forward" className="size-[18px] text-electric" aria-hidden />
          কাকে দেবেন? · Forward to
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="flex size-7 items-center justify-center rounded-md text-lead hover:bg-surface"
          aria-label="Cancel forward"
        >
          <Icon name="close" className="size-[18px]" aria-hidden />
        </button>
      </div>

      {targets.length === 0 ? (
        <p className="py-2 text-sm leading-[18px] text-muted-gray">
          কোনো অন্য সহায়ক নেই · No other helpers
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {targets.map((member) => {
            const av = AVAILABILITY_LABELS[availabilityFor(member.id)];
            const color = member.brandColor ?? "#1B87E6";
            return (
              <button
                key={member.id}
                type="button"
                onClick={() => onSelect(member.id)}
                className="flex w-full items-center gap-[11px] rounded-target border border-border bg-card px-[11px] py-[9px] text-left transition-colors hover:border-electric hover:bg-[#F7FBFE]"
              >
                <span
                  className="flex size-9 shrink-0 items-center justify-center rounded-full text-[15px] font-medium leading-none text-white"
                  style={{ backgroundColor: color }}
                  aria-hidden
                >
                  {staffBanglaInitial(member)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-base font-medium leading-[19px] text-ink">
                    {member.nameBn ?? member.nameEn}
                  </p>
                  <p className="text-xs leading-4 text-muted-gray">Office helper</p>
                </div>
                <span
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-full px-[9px] py-[3px] text-[11px] font-medium leading-[15px]"
                  style={{ backgroundColor: av.soft, color: av.color }}
                >
                  <span
                    className="size-[7px] shrink-0 rounded-full"
                    style={{ backgroundColor: av.color }}
                    aria-hidden
                  />
                  {av.en}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

import type { User } from "@office/shared";
import { Icon } from "@/components/Icon";
import { bnNum, staffBanglaInitial } from "../lib/staff-format";

interface StaffHeaderProps {
  user: User;
  newCount: number;
}

export function StaffHeader({ user, newCount }: StaffHeaderProps) {
  const color = user.brandColor ?? "#1B87E6";
  const greeting = user.nameBn ?? user.nameEn;

  return (
    <header className="shrink-0 bg-dark-blue px-3.5 pb-[15px] pt-[13px] text-white">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-[11px]">
          <span
            className="flex size-[42px] shrink-0 items-center justify-center rounded-full text-lg font-medium leading-none text-white"
            style={{ backgroundColor: color }}
            aria-hidden
          >
            {staffBanglaInitial(user)}
          </span>
          <div className="flex flex-col gap-0.5">
            <span className="text-[13px] leading-[15px] text-white/70">
              শুভেচ্ছা, {greeting}
            </span>
            <span className="text-[19px] font-medium leading-6">আজকের অনুরোধ</span>
          </div>
        </div>
        <span className="relative inline-flex size-[42px] items-center justify-center rounded-full bg-white/12">
          <Icon name="notifications" className="size-6 text-white" aria-hidden />
          {newCount > 0 ? (
            <span
              className="absolute -right-0.5 -top-0.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-dark-blue bg-danger px-[5px] text-[11px] font-medium leading-none text-white"
              aria-label={`${newCount} new requests`}
            >
              {bnNum(newCount)}
            </span>
          ) : null}
        </span>
      </div>
    </header>
  );
}

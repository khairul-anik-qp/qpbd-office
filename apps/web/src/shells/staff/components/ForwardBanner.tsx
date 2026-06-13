import { Icon } from "@/components/Icon";
import type { ForwardToast } from "../lib/staff-format";

interface ForwardBannerProps {
  toast: ForwardToast;
}

export function ForwardBanner({ toast }: ForwardBannerProps) {
  return (
    <div
      role="status"
      className="flex items-center gap-[11px] rounded-xl border border-[#BBD9F2] bg-info-soft px-[13px] py-[11px]"
    >
      <Icon name="forward_to_inbox" className="size-[22px] shrink-0 text-electric" aria-hidden />
      <div className="flex min-w-0 flex-col gap-px">
        <span className="text-sm font-medium leading-[18px] text-info">{toast.bn}</span>
        <span className="text-xs leading-[15px] text-[#4F7CA8]">{toast.en}</span>
      </div>
    </div>
  );
}

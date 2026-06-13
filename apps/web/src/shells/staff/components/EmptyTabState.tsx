import type { StaffTab } from "./StaffTabs";
import { EMPTY_TAB } from "../lib/staff-format";
import { Icon } from "@/components/Icon";

interface EmptyTabStateProps {
  tab: StaffTab;
}

export function EmptyTabState({ tab }: EmptyTabStateProps) {
  const copy = EMPTY_TAB[tab];
  return (
    <div className="flex flex-col items-center gap-3.5 py-10 text-center">
      <span className="flex size-[66px] items-center justify-center rounded-full bg-divider text-muted-gray">
        <Icon name="inbox" className="size-[34px]" aria-hidden />
      </span>
      <p className="text-[15px] leading-[22px] text-muted-gray">
        {copy.bn} · {copy.en}
      </p>
    </div>
  );
}

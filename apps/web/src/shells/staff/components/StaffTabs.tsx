import type { RequestStatus } from "@office/shared";
import { bnNum } from "../lib/staff-format";

export type StaffTab = RequestStatus;

interface StaffTabsProps {
  active: StaffTab;
  counts: Record<StaffTab, number>;
  onChange: (tab: StaffTab) => void;
}

const TABS: { key: StaffTab; label: string }[] = [
  { key: "new", label: "নতুন" },
  { key: "progress", label: "চলছে" },
  { key: "done", label: "সম্পন্ন" },
];

export function StaffTabs({ active, counts, onChange }: StaffTabsProps) {
  return (
    <div className="flex shrink-0 gap-[7px] border-b border-divider bg-card px-3 py-[11px]">
      {TABS.map(({ key, label }) => {
        const selected = active === key;
        return (
          <button
            key={key}
            type="button"
            onClick={() => onChange(key)}
            className="flex flex-1 items-center justify-center gap-[7px] rounded-[9px] border-none px-1.5 py-[9px] text-sm font-medium leading-4 transition-colors"
            style={{
              backgroundColor: selected ? "var(--color-electric)" : "var(--color-surface)",
              color: selected ? "#fff" : "var(--color-lead)",
            }}
          >
            {label}
            <span
              className="inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[11px] font-medium leading-none"
              style={{
                backgroundColor: selected ? "rgba(255,255,255,.25)" : "var(--color-divider)",
                color: selected ? "#fff" : "var(--color-lead)",
              }}
            >
              {bnNum(counts[key])}
            </span>
          </button>
        );
      })}
    </div>
  );
}

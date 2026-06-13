import type { Availability } from "@office/shared";
import { AVAILABILITY_LABELS } from "../lib/staff-format";

interface AvailabilityControlProps {
  value: Availability;
  onChange: (status: Availability) => void;
}

const ORDER: Availability[] = ["available", "busy", "away"];

export function AvailabilityControl({ value, onChange }: AvailabilityControlProps) {
  return (
    <div className="shrink-0 border-b border-divider bg-card px-3 py-[11px]">
      <p className="text-xs leading-[14px] text-muted-gray">আমার স্ট্যাটাস · My availability</p>
      <div className="mt-2 flex gap-[7px]">
        {ORDER.map((key) => {
          const av = AVAILABILITY_LABELS[key];
          const active = value === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => onChange(key)}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border px-2 py-2.5 text-[13px] font-medium leading-4 transition-colors"
              style={{
                backgroundColor: active ? av.soft : "#fff",
                borderColor: active ? av.color : "var(--color-border-default)",
                color: active ? av.color : "var(--color-lead)",
              }}
            >
              <span
                className="size-[7px] shrink-0 rounded-full"
                style={{ backgroundColor: av.color }}
                aria-hidden
              />
              {av.bn}
            </button>
          );
        })}
      </div>
    </div>
  );
}

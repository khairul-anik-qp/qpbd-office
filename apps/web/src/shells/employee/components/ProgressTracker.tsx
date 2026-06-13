import { Icon } from "@/components/Icon";
import type { ProgressStep } from "../lib/employee-request";

interface ProgressTrackerProps {
  steps: ProgressStep[];
}

export function ProgressTracker({ steps }: ProgressTrackerProps) {
  const last = steps.length - 1;

  return (
    <div className="flex items-start px-1">
      {steps.map((step, i) => {
        const lineLeft =
          i === 0 ? "transparent" : steps[i - 1]!.done ? "#227700" : "#E8E8E8";
        const lineRight = i === last ? "transparent" : step.done ? "#227700" : "#E8E8E8";

        let dotClass =
          "flex size-[22px] shrink-0 items-center justify-center rounded-full ";
        let labelClass = "mt-1.5 text-xs leading-4 ";
        let icon: "check" | "more_horiz" | null = null;

        if (step.done) {
          dotClass += "bg-success text-white";
          labelClass += "text-lead";
          icon = "check";
        } else if (step.current) {
          dotClass += "border-2 border-electric bg-card text-electric";
          labelClass += "font-medium text-electric";
          icon = "more_horiz";
        } else {
          dotClass += "bg-divider text-muted-gray";
          labelClass += "text-muted-gray";
        }

        return (
          <div key={step.label} className="flex flex-1 flex-col items-center">
            <div className="flex w-full items-center">
              <div className="h-0.5 flex-1" style={{ backgroundColor: lineLeft }} />
              <div className={dotClass}>
                {icon && <Icon name={icon} className="size-3.5" aria-hidden />}
              </div>
              <div className="h-0.5 flex-1" style={{ backgroundColor: lineRight }} />
            </div>
            <span className={labelClass}>{step.label}</span>
            {step.time && (
              <span className="text-[11px] leading-[15px] text-muted-gray">{step.time}</span>
            )}
          </div>
        );
      })}
    </div>
  );
}

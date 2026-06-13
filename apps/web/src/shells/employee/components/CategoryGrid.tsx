import { TYPES, type RequestType } from "@office/shared";
import { TypeIcon } from "@/components/Icon";
import { REQUEST_TYPES } from "../lib/employee-request";

interface CategoryGridProps {
  onPick: (type: RequestType) => void;
}

export function CategoryGrid({ onPick }: CategoryGridProps) {
  return (
    <div>
      <h2 className="text-base font-medium leading-6 text-ink">Make a request</h2>
      <p className="mt-0.5 text-sm text-muted-gray">
        Pick what you need — the office team is notified the instant you send it.
      </p>
      <div className="mt-3.5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {REQUEST_TYPES.map((key) => {
          const def = TYPES[key];
          return (
            <button
              key={key}
              type="button"
              onClick={() => onPick(key)}
              className="flex items-center gap-3.5 rounded-[10px] border border-border bg-card p-3.5 text-left transition-[border-color,box-shadow] hover:border-electric hover:shadow-pop"
            >
              <span
                className="flex size-[46px] shrink-0 items-center justify-center rounded-tile"
                style={{ backgroundColor: def.bg, color: def.fg }}
              >
                <TypeIcon type={key} className="size-[26px]" />
              </span>
              <span className="flex min-w-0 flex-col gap-0.5">
                <span className="text-base font-medium leading-6 text-ink">{def.en}</span>
                <span className="text-[13px] leading-4 text-muted-gray">{def.bn}</span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

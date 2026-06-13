import type { User } from "@office/shared";
import { staffFirstName } from "@office/shared";
import { Button } from "@/components/ui/button";
import { AVAILABILITY_LABELS, staffInitial } from "../lib/employee-request";

interface OfficeTeamCardProps {
  staff: User[];
  loading?: boolean;
  error?: boolean;
  onRetry?: () => void;
}

export function OfficeTeamCard({ staff, loading, error, onRetry }: OfficeTeamCardProps) {
  const available = staff.filter((s) => s.availability === "available").length;

  return (
    <div className="rounded-[10px] border border-border bg-card px-5 py-[18px]">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="text-base font-medium leading-6 text-ink">Office team</h2>
        <span className="inline-flex items-center gap-1.5 text-[13px] leading-4 text-muted-gray">
          <span className="size-2 shrink-0 rounded-full bg-success" aria-hidden />
          {loading ? "…" : `${available} of ${staff.length} available now`}
        </span>
      </div>

      {loading ? (
        <p className="mt-3.5 text-sm text-lead">Loading team…</p>
      ) : error ? (
        <div className="mt-3.5 flex flex-col items-start gap-3">
          <p className="text-sm text-lead">
            Could not load the office team. You can still send to anyone available, or try again.
          </p>
          <Button size="sm" variant="outline" onClick={onRetry} disabled={loading}>
            Retry
          </Button>
        </div>
      ) : staff.length === 0 ? (
        <p className="mt-3.5 text-sm text-lead">No office helpers are set up yet.</p>
      ) : (
        <div className="mt-3.5 grid gap-3 sm:grid-cols-2">
          {staff.map((member) => {
            const avail = member.availability ?? "away";
            const av = AVAILABILITY_LABELS[avail];
            const color = member.brandColor ?? "#1B87E6";
            return (
              <div
                key={member.id}
                className="flex items-center gap-3 rounded-[9px] border border-divider px-3.5 py-3"
              >
                <span
                  className="flex size-[38px] shrink-0 items-center justify-center rounded-full text-[15px] font-medium leading-none text-white"
                  style={{ backgroundColor: color }}
                  aria-hidden
                >
                  {staffInitial(member.nameEn)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[15px] font-medium leading-[18px] text-ink">
                    {staffFirstName(member.nameEn)}
                  </p>
                  <p className="text-xs leading-4 text-muted-gray">Office helper</p>
                </div>
                <span
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium leading-4"
                  style={{ backgroundColor: av.soft, color: av.color }}
                >
                  <span
                    className="size-[7px] shrink-0 rounded-full"
                    style={{ backgroundColor: av.color }}
                    aria-hidden
                  />
                  {av.en}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

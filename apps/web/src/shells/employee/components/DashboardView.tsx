import { Link } from "react-router-dom";
import type { Request, User } from "@office/shared";
import { TYPES } from "@office/shared";
import { Icon, TypeIcon } from "@/components/Icon";
import { RequestRow } from "./RequestRow";
import { requestStats, locationLabel } from "../lib/employee-request";
import { CategoryGrid } from "./CategoryGrid";
import { OfficeTeamCard } from "./OfficeTeamCard";
import { StatGrid } from "./StatGrid";
import { SuccessToast } from "./SuccessToast";
import type { RequestType } from "@office/shared";
import { dayDiff } from "../lib/employee-request";

interface DashboardViewProps {
  requests: Request[];
  staff: User[];
  staffLoading: boolean;
  staffLoadError: boolean;
  onRetryStaff: () => void;
  staffById: Map<string, User>;
  now: number;
  successToast: string | null;
  onPickCategory: (type: RequestType) => void;
  onCancelRequest: (id: string) => void;
  onToggleFavorite: (id: string, value: boolean) => void;
  onRepeat: (request: Request) => void;
}

export function DashboardView({
  requests,
  staff,
  staffLoading,
  staffLoadError,
  onRetryStaff,
  staffById,
  now,
  successToast,
  onPickCategory,
  onCancelRequest,
  onToggleFavorite,
  onRepeat,
}: DashboardViewProps) {
  const stats = requestStats(requests, now);
  const todays = [...requests]
    .filter((r) => dayDiff(r.createdAt, now) <= 0)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const favorites = requests.filter((r) => r.isFavorite);

  return (
    <div className="flex-1 overflow-auto px-6 py-6 pb-10 md:px-7">
      <h1 className="text-[32px] font-normal leading-10 text-ink">Office requests</h1>
      <p className="mt-0.5 text-base leading-6 text-lead">
        Manage and track everything you&apos;ve asked the office team for.
      </p>

      {successToast && (
        <div className="mt-[18px]">
          <SuccessToast message={successToast} />
        </div>
      )}

      <div className="mt-5">
        <StatGrid
          open={stats.open}
          progress={stats.progress}
          doneToday={stats.doneToday}
          avgResponse={stats.avgResponse}
        />
      </div>

      <div className="mt-5">
        <OfficeTeamCard
          staff={staff}
          loading={staffLoading}
          error={staffLoadError}
          onRetry={onRetryStaff}
        />
      </div>

      <div className="mt-8">
        <CategoryGrid onPick={onPickCategory} />
      </div>

      {favorites.length > 0 && (
        <div className="mt-6">
          <h2 className="text-base font-medium leading-6 text-ink">Favorites</h2>
          <div className="mt-3 flex flex-col gap-2">
            {favorites.map((r) => {
              const def = TYPES[r.type];
              const loc = locationLabel(r.loc);
              return (
                <div
                  key={r.id}
                  className="flex items-center gap-3 rounded-[10px] border border-border bg-card px-4 py-3"
                >
                  <span
                    className="flex size-8 shrink-0 items-center justify-center rounded-lg"
                    style={{ backgroundColor: def.bg, color: def.fg }}
                  >
                    <TypeIcon type={r.type} className="size-[18px]" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium leading-5 text-ink">{def.en}</p>
                    {(loc || r.note) && (
                      <p className="truncate text-xs leading-4 text-muted-gray">
                        {[loc, r.note].filter(Boolean).join("  ·  ")}
                      </p>
                    )}
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <button
                      type="button"
                      onClick={() => onRepeat(r)}
                      className="text-sm font-medium text-electric hover:underline transition-colors"
                    >
                      Repeat
                    </button>
                    <button
                      type="button"
                      onClick={() => onToggleFavorite(r.id, false)}
                      aria-label="Remove from favorites"
                      title="Remove from favorites"
                      className="text-red-400 transition-colors hover:text-muted-gray"
                    >
                      <Icon name="favorite-fill" className="size-[18px]" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="mt-8 flex items-center justify-between gap-3">
        <h2 className="text-base font-medium leading-6 text-ink">Today&apos;s requests</h2>
        <Link
          to="/requests"
          className="inline-flex items-center gap-1.5 border-none bg-transparent p-0 text-sm leading-4 text-electric hover:underline"
        >
          See all
          <span aria-hidden>→</span>
        </Link>
      </div>

      {todays.length === 0 ? (
        <p className="mt-3.5 text-sm text-lead">No requests yet today.</p>
      ) : (
        <div className="mt-3.5 flex flex-col gap-3">
          {todays.map((r) => (
            <RequestRow
              key={r.id}
              request={r}
              staffById={staffById}
              now={now}
              onCancel={r.status === "new" ? () => onCancelRequest(r.id) : undefined}
              onToggleFavorite={() => onToggleFavorite(r.id, !r.isFavorite)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

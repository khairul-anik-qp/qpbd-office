import { Link } from "react-router-dom";
import type { Request, User } from "@office/shared";
import { RequestRow } from "./RequestRow";
import { requestStats } from "../lib/employee-request";
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
  staffById: Map<string, User>;
  now: number;
  successToast: string | null;
  onPickCategory: (type: RequestType) => void;
}

export function DashboardView({
  requests,
  staff,
  staffLoading,
  staffById,
  now,
  successToast,
  onPickCategory,
}: DashboardViewProps) {
  const stats = requestStats(requests, now);
  const todays = [...requests]
    .filter((r) => dayDiff(r.createdAt, now) <= 0)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

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
        <OfficeTeamCard staff={staff} loading={staffLoading} />
      </div>

      <div className="mt-8">
        <CategoryGrid onPick={onPickCategory} />
      </div>

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
            <RequestRow key={r.id} request={r} staffById={staffById} now={now} />
          ))}
        </div>
      )}
    </div>
  );
}

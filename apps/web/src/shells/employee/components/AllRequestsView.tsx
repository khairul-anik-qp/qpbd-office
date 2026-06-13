import { Link } from "react-router-dom";
import type { Request, User } from "@office/shared";
import { Icon } from "@/components/Icon";
import { ALL_FILTERS, dayLabel, type AllFilter } from "../lib/employee-request";
import { RequestRow } from "./RequestRow";

interface AllRequestsViewProps {
  requests: Request[];
  staffById: Map<string, User>;
  now: number;
  filter: AllFilter;
  onFilterChange: (f: AllFilter) => void;
}

export function AllRequestsView({
  requests,
  staffById,
  now,
  filter,
  onFilterChange,
}: AllRequestsViewProps) {
  const sorted = [...requests].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
  const filtered =
    filter === "all" ? sorted : sorted.filter((r) => r.status === filter);

  const groups: { label: string; rows: Request[] }[] = [];
  for (const r of filtered) {
    const label = dayLabel(r.createdAt, now);
    const existing = groups.find((g) => g.label === label);
    if (existing) existing.rows.push(r);
    else groups.push({ label, rows: [r] });
  }

  return (
    <div className="flex flex-1 flex-col overflow-auto bg-background">
      <div className="flex flex-col gap-5 px-6 py-5 pb-10 md:px-7">
        <article className="sticky top-5 z-10 flex flex-col gap-3.5 rounded-[10px] border border-border bg-card p-4">
          <div className="flex gap-3.5">
            <Link
              to="/dashboard"
              className="flex size-[42px] shrink-0 items-center justify-center rounded-[9px] bg-surface text-lead transition-colors hover:bg-divider"
              aria-label="Back to dashboard"
            >
              <Icon name="arrow_back" className="size-[23px]" />
            </Link>
            <div className="min-w-0 flex flex-1 flex-col gap-1">
              <h1 className="text-base font-medium leading-6 text-ink">All requests</h1>
              <p className="text-[13px] leading-4 text-muted-gray">
                Your complete request history · {requests.length} total
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {ALL_FILTERS.map((f) => {
              const active = filter === f.key;
              return (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => onFilterChange(f.key)}
                  className={`inline-flex items-center rounded-full border px-3.5 py-1.5 text-[13px] leading-4 transition-colors ${
                    active
                      ? "border-electric bg-selected-soft text-electric"
                      : "border-border bg-card text-lead"
                  }`}
                >
                  {f.label}
                </button>
              );
            })}
          </div>
        </article>
        {filtered.length === 0 ? (
          <div className="mx-auto my-8 flex flex-col items-center gap-3 text-center">
            <span className="flex size-[66px] items-center justify-center rounded-full bg-surface text-muted-gray">
              <Icon name="inbox" className="size-[34px]" aria-hidden />
            </span>
            <p className="text-[15px] leading-[22px] text-muted-gray">
              No requests match this filter
            </p>
          </div>
        ) : (
          groups.map((g) => (
            <section key={g.label}>
              <h2 className="mb-2.5 text-[13px] font-medium uppercase tracking-wide text-muted-gray">
                {g.label}
              </h2>
              <div className="flex flex-col gap-3">
                {g.rows.map((r) => (
                  <RequestRow key={r.id} request={r} staffById={staffById} now={now} />
                ))}
              </div>
            </section>
          ))
        )}
      </div>
    </div>
  );
}

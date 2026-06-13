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
      <div className="sticky top-0 z-10 border-b border-divider bg-card px-6 py-[18px] md:px-7">
        <div className="flex items-center gap-3.5">
          <Link
            to="/dashboard"
            className="flex size-[38px] shrink-0 items-center justify-center rounded-[9px] border border-border bg-card text-lead transition-colors hover:bg-surface"
            aria-label="Back to dashboard"
          >
            <Icon name="arrow_back" className="size-[21px]" />
          </Link>
          <div>
            <h1 className="text-2xl font-normal leading-8 text-ink">All requests</h1>
            <p className="text-[13px] leading-4 text-muted-gray">
              Your complete request history · {requests.length} total
            </p>
          </div>
        </div>
        <div className="mt-3.5 flex flex-wrap gap-2">
          {ALL_FILTERS.map((f) => {
            const active = filter === f.key;
            return (
              <button
                key={f.key}
                type="button"
                onClick={() => onFilterChange(f.key)}
                className="inline-flex items-center rounded-full px-3.5 py-1.5 text-[13px] leading-4 transition-colors"
                style={{
                  border: active ? "1px solid #1B87E6" : "1px solid #D8D8D8",
                  background: active ? "#EEF6FE" : "#fff",
                  color: active ? "#1B87E6" : "#545E6B",
                }}
              >
                {f.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col gap-5 px-6 py-5 pb-10 md:px-7">
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

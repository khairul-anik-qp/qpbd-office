import { useEffect, useState } from "react";
import { Icon } from "@/components/Icon";
import { Card, CardContent } from "@/components/ui/card";
import { api } from "@/lib/api";

interface Stat {
  staffId: string;
  nameEn: string;
  avgMinutes: number;
  completedCount: number;
}

function formatAvg(minutes: number): string {
  if (minutes < 1) return "< 1 min";
  if (minutes < 60) return `${minutes} min`;
  return `${Math.round(minutes / 60)}h`;
}

export function ResponseTimeStats() {
  const [stats, setStats] = useState<Stat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    api
      .getResponseTimeStats()
      .then((data) => {
        setStats(data.slice().sort((a, b) => a.avgMinutes - b.avgMinutes));
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, []);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-[24px] font-normal leading-8 text-dark-blue">Response times</h1>
        <p className="text-sm text-lead">Average time to complete requests today, per staff member</p>
      </div>
      {loading ? (
        <p className="text-lead">Loading stats…</p>
      ) : error ? (
        <p className="text-lead">Could not load stats</p>
      ) : stats.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-lead">
            No completed requests today yet.
          </CardContent>
        </Card>
      ) : (
        <ul className="grid gap-3">
          {stats.map((s) => (
            <li key={s.staffId}>
              <Card>
                <CardContent className="flex items-center gap-4 p-4">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-surface text-lead">
                    <Icon name="person" className="size-5" aria-hidden />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-base font-medium text-dark-blue">{s.nameEn}</p>
                    <p className="text-sm text-lead">
                      {s.completedCount} request{s.completedCount !== 1 ? "s" : ""} completed
                    </p>
                  </div>
                  <span className="text-base font-semibold text-electric">
                    avg {formatAvg(s.avgMinutes)}
                  </span>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

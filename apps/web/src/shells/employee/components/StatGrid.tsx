interface StatGridProps {
  open: number;
  progress: number;
  doneToday: number;
  avgResponse: string;
}

export function StatGrid({ open, progress, doneToday, avgResponse }: StatGridProps) {
  const stats = [
    { label: "Open", value: open, qualifier: "waiting for staff" },
    { label: "In progress", value: progress, qualifier: "being handled" },
    { label: "Completed", value: doneToday, qualifier: "today" },
    { label: "Avg. response", value: avgResponse, qualifier: "last 30 days" },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {stats.map((s) => (
        <div
          key={s.label}
          className="flex flex-col gap-1 rounded-[10px] border border-border bg-card p-4"
        >
          <span className="text-[13px] leading-4 text-muted-gray">{s.label}</span>
          <span className="text-[36px] font-normal leading-[44px] text-dark-blue">
            {s.value}
          </span>
          <span className="text-xs leading-4 text-muted-gray">{s.qualifier}</span>
        </div>
      ))}
    </div>
  );
}

import { useState } from "react";
import { AppHeader } from "@/components/AppHeader";
import { PendingQueue } from "./PendingQueue";
import { ResponseTimeStats } from "./ResponseTimeStats";

type AdminTab = "signups" | "response-times";

const TABS: { key: AdminTab; label: string }[] = [
  { key: "signups", label: "Signups" },
  { key: "response-times", label: "Response times" },
];

export default function AdminShell() {
  const [tab, setTab] = useState<AdminTab>("signups");

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <AppHeader />
      <div className="mx-auto w-full max-w-3xl px-6 pt-4">
        <div className="flex gap-1 border-b border-border">
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
                tab === t.key
                  ? "border-electric text-electric"
                  : "border-transparent text-lead hover:text-ink"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>
      <main className="mx-auto w-full max-w-3xl min-h-0 flex-1 overflow-auto p-6">
        {tab === "signups" ? <PendingQueue bare /> : <ResponseTimeStats />}
      </main>
    </div>
  );
}

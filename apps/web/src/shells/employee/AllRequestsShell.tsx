import { useState } from "react";
import { AppHeader } from "@/components/AppHeader";
import { AllRequestsView } from "./components/AllRequestsView";
import { useNow } from "./hooks/useNow";
import { useEmployeeData } from "./hooks/useEmployeeData";
import { type AllFilter } from "./lib/employee-request";

export default function AllRequestsShell() {
  const now = useNow();
  const { requests, staffById } = useEmployeeData();
  const [allFilter, setAllFilter] = useState<AllFilter>("all");

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <AppHeader />
      <main className="mx-auto flex w-full max-w-[1440px] flex-1 flex-col">
        <AllRequestsView
          requests={requests}
          staffById={staffById}
          now={now}
          filter={allFilter}
          onFilterChange={setAllFilter}
        />
      </main>
    </div>
  );
}

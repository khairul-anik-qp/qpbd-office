import { useState } from "react";
import { AppHeader } from "@/components/AppHeader";
import { AllRequestsView } from "./components/AllRequestsView";
import { useAllRequestsPage } from "./hooks/useAllRequestsPage";
import { useNow } from "./hooks/useNow";
import { useEmployeeData } from "./hooks/useEmployeeData";
import { type AllFilter } from "./lib/employee-request";

export default function AllRequestsShell() {
  const now = useNow();
  const { staffById } = useEmployeeData();
  const [allFilter, setAllFilter] = useState<AllFilter>("all");
  const {
    items,
    total,
    hasMore,
    loading,
    loadingMore,
    error,
    loadMore,
    retry,
  } = useAllRequestsPage(allFilter);

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <AppHeader />
      <main className="mx-auto flex w-full max-w-5xl min-h-0 flex-1 flex-col">
        <AllRequestsView
          requests={items}
          total={total}
          staffById={staffById}
          now={now}
          filter={allFilter}
          onFilterChange={setAllFilter}
          loading={loading}
          loadingMore={loadingMore}
          error={error}
          hasMore={hasMore}
          onLoadMore={loadMore}
          onRetry={retry}
        />
      </main>
    </div>
  );
}

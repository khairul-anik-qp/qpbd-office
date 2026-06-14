import { useCallback, useState } from "react";
import { toast } from "sonner";
import { AppHeader } from "@/components/AppHeader";
import { AllRequestsView } from "./components/AllRequestsView";
import { useAllRequestsPage } from "./hooks/useAllRequestsPage";
import { useNow } from "./hooks/useNow";
import { useEmployeeData } from "./hooks/useEmployeeData";
import { type AllFilter, type DateFilter, dateFilterFrom } from "./lib/employee-request";
import { api } from "@/lib/api";
import { mergeRequest } from "@/lib/request-sync";

export default function AllRequestsShell() {
  const now = useNow();
  const { staffById } = useEmployeeData();
  const [allFilter, setAllFilter] = useState<AllFilter>("all");
  const [dateFilter, setDateFilter] = useState<DateFilter>("all");
  const {
    items,
    total,
    hasMore,
    loading,
    loadingMore,
    error,
    loadMore,
    retry,
  } = useAllRequestsPage(allFilter, dateFilterFrom(dateFilter));

  const cancelRequest = useCallback(async (id: string) => {
    try {
      const updated = await api.cancelRequest(id);
      mergeRequest(updated);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Could not cancel request";
      toast.error(msg);
    }
  }, []);

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
          dateFilter={dateFilter}
          onDateFilterChange={setDateFilter}
          loading={loading}
          loadingMore={loadingMore}
          error={error}
          hasMore={hasMore}
          onLoadMore={loadMore}
          onRetry={retry}
          onCancelRequest={cancelRequest}
        />
      </main>
    </div>
  );
}

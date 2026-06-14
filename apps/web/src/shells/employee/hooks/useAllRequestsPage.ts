import { useCallback, useEffect, useRef, useState } from "react";
import type { Request } from "@office/shared";
import { REQUESTS_PAGE_SIZE } from "@office/shared";
import { api } from "@/lib/api";
import { loadGlobalRequests, subscribeRequests } from "@/lib/request-store";
import { type AllFilter } from "../lib/employee-request";

function statusParam(filter: AllFilter) {
  return filter === "all" ? undefined : filter;
}

export function useAllRequestsPage(filter: AllFilter, dateFrom?: string) {
  const [items, setItems] = useState<Request[]>([]);
  const [total, setTotal] = useState(0);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(false);

  const requestIdRef = useRef(0);

  const fetchPage = useCallback(
    async (cursor: string | undefined, append: boolean) => {
      const requestId = ++requestIdRef.current;
      if (append) setLoadingMore(true);
      else {
        setLoading(true);
        setError(false);
      }

      try {
        const page = await api.listRequestPage({
          limit: REQUESTS_PAGE_SIZE,
          cursor,
          status: statusParam(filter),
          dateFrom,
        });
        if (requestId !== requestIdRef.current) return;

        setTotal(page.total);
        setNextCursor(page.nextCursor);
        setItems((prev) => (append ? [...prev, ...page.items] : page.items));
        setError(false);
      } catch {
        if (requestId !== requestIdRef.current) return;
        setError(true);
      } finally {
        if (requestId === requestIdRef.current) {
          setLoading(false);
          setLoadingMore(false);
        }
      }
    },
    [filter, dateFrom],
  );

  useEffect(() => {
    void fetchPage(undefined, false);
  }, [fetchPage]);

  useEffect(() => {
    const patchFromStore = () => {
      const store = loadGlobalRequests();
      setItems((prev) => prev.map((r) => store.find((s) => s.id === r.id) ?? r));
    };
    return subscribeRequests(patchFromStore);
  }, []);

  const loadMore = useCallback(() => {
    if (!nextCursor || loadingMore) return;
    void fetchPage(nextCursor, true);
  }, [nextCursor, loadingMore, fetchPage]);

  const retry = useCallback(() => {
    void fetchPage(undefined, false);
  }, [fetchPage]);

  return {
    items,
    total,
    hasMore: nextCursor !== null,
    loading,
    loadingMore,
    error,
    loadMore,
    retry,
  };
}

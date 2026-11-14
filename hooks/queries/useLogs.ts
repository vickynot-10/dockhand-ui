import { api } from "@/utils/axios";
import { keepPreviousData, useInfiniteQuery } from "@tanstack/react-query";

export const LOGS_QUERY_KEY = "logs";

export type LogLine = {
  id: string;
  timestamp: string;
  service_id: string;
  service_name: string;
  message: string;
};

export type LogPage = {
  lines: LogLine[];
  has_more: boolean;
  next_cursor: string | null;
};

type LogParams = {
  limit: number;
  search?: string;
  service_id: string | null;
  isLive: boolean;
};

export function useGetLogs({ limit, search, service_id, isLive }: LogParams) {
  return useInfiniteQuery({
    queryKey: [LOGS_QUERY_KEY, limit, search, service_id],
    initialPageParam: null as string | null,
    queryFn: async ({ pageParam }) => {
      const res = await api.get("/logs", {
        params: { limit, search, service_id, before: pageParam },
      });
      return res.data?.data as LogPage;
    },
    getNextPageParam: (lastPage) =>
      lastPage?.has_more ? lastPage.next_cursor : undefined,
    placeholderData: keepPreviousData,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    refetchInterval: (query) =>
      isLive && query.state.data?.pages.length === 1 ? 3000 : false,
  });
}

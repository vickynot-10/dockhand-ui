import { api } from "@/utils/axios";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

const QUERY_KEY = "logs";

type DeployParams = {
  page: number;
  search?: string;
  service_id: string | null;
};

export function useGetLogs({ page, search, service_id }: DeployParams) {
  return useQuery({
    queryKey: [QUERY_KEY, page, search, service_id],
    queryFn: async () => {
      const res = await api.get("/logs", {
        params: { page, search, service_id },
      });
      return res.data ?? null;
    },
    staleTime: Infinity,
    placeholderData: keepPreviousData,
  });
}

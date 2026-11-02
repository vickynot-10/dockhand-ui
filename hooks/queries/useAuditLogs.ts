import { api } from "@/utils/axios";
import { useQuery } from "@tanstack/react-query";
const QUERY_KEY = "audit-logs";

type Params = {
  page: number;
  limit: number;
  search?: string;
};

export const useGetAuditLogs = (params: Params) => {
  return useQuery({
    queryKey: [QUERY_KEY, params],
    queryFn: async () => {
      const res = await api.get("/audit-logs", { params });
      return res.data ?? null;
    },
    staleTime: 1000 * 60 * 5,
  });
};

export const useGetAuditDifference = (id: string) => {
  return useQuery({
    queryKey: ["log-difference", id],
    queryFn: async () => {
      const res = await api.get("/audit-logs/difference", { params: { id } });
      return res.data ?? null;
    },
    staleTime: 1000 * 60 * 5,
  });
};

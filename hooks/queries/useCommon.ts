import { api } from "@/utils/axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useGetAppsList = (execute: boolean) => {
  return useQuery({
    queryKey: ["app-list"],
    queryFn: async () => {
      const res = await api.get("/app/get-apps");
      return res.data ?? null;
    },
    staleTime: 1000 * 60 * 5,
    enabled: execute,
  });
};

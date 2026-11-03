import { FormValues } from "@/types/project.types";
import { api } from "@/utils/axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const QUERY_KEY = "services";

export function useGetUserRepos() {
  return useQuery({
    queryKey: [QUERY_KEY + "gh-repos"],
    queryFn: async () => {
      const res = await api.get("/services/repos");
      return res.data ?? null;
    },
    staleTime: 1000 * 60 * 5,
  });
}

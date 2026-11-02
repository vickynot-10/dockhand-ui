import { ApiFormValues } from "@/types/api.types";
import { api } from "@/utils/axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const QUERY_KEY = "api-keys";

type Params = {
  page: number;
  limit: number;
  search?: string;
};

export const useGetApis = (params: Params) => {
  return useQuery({
    queryKey: [QUERY_KEY, params],
    queryFn: async () => {
      const res = await api.get("/keys", { params });
      return res.data ?? null;
    },
    staleTime: 1000 * 60 * 5,
  });
};

export const useSaveApi = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: ApiFormValues) => {
      let res = null;

      if (data.id) {
        res = await api.put("/keys", data);
      } else {
        delete data.id;
        res = await api.post("/keys", data);
      }

      return res.data ?? null;
    },
    onSuccess: (res: any) => {
      if (res.success) {
        toast.success(res.msg || "API Created Successfully !");
        queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
        queryClient.invalidateQueries({ queryKey: ["app-list"] });
      }
    },
  });
};

export function useUpdateApiStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { id: number }) => {
      const res = await api.patch(`/keys`, {
        id: payload.id,
      });
      return res.data;
    },
    onSuccess: (res: any) => {
      if (res.success) {
        toast.success(res.msg || "API updated Successfully !");
        queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      }
    },
  });
}

export const useDeleteApis = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete(`/keys/${id}`);
      return res.data ?? null;
    },
    onSuccess: (res: any) => {
      if (res.success) {
        toast.success(res.msg || "Deleted Successfully !");
        queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
        queryClient.invalidateQueries({ queryKey: ["app-list"] });
      }
    },
  });
};

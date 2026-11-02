import { api } from "@/utils/axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AppFormValues } from "@/types/app.types";
const QUERY_KEY = "apps";

type Params = {
  page: number;
  limit: number;
  search?: string;
};

export const useGetApps = (params: Params) => {
  return useQuery({
    queryKey: [QUERY_KEY, params],
    queryFn: async () => {
      const res = await api.get("/app", { params });
      return res.data ?? null;
    },
    staleTime: 1000 * 60 * 5,
  });
};

export const useSaveApp = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: AppFormValues) => {
      let res = null;

      if (data.id) {
        res = await api.put("/app", data);
      } else {
        delete data.id;
        res = await api.post("/app", data);
      }

      return res.data ?? null;
    },
    onSuccess: (res: any) => {
      if (res.success) {
        toast.success(res.msg || "App Created Successfully !");
        queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
        queryClient.invalidateQueries({ queryKey: ["app-list"] });
      }
    },
  });
};

export function useUpdateAppStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { id: number; status: boolean }) => {
      const res = await api.patch(`/app`, {
        id: payload.id,
      });
      return res.data;
    },
    onSuccess: (res: any) => {
      if (res.success) {
        toast.success(res.msg || "App updated Successfully !");
        queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
        queryClient.invalidateQueries({ queryKey: ["app-list"] });
      }
    },
  });
}

export const useDeleteApps = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete(`/app/${id}`);
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

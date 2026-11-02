import { api } from "@/utils/axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { FlagFormvalue } from "@/types/flags.types";
import { useRouter } from "next/navigation";
const QUERY_KEY = "flags";

type Params = {
  page: number;
  limit: number;
  search?: string;
};

export const useGetFlags = (params: Params) => {
  return useQuery({
    queryKey: [QUERY_KEY, params],
    queryFn: async () => {
      const res = await api.get("/flags", { params });
      return res.data ?? null;
    },
    staleTime: 1000 * 60 * 5,
  });
};

export const useGetFlagByID = (id: string | undefined) => {
  return useQuery({
    queryKey: ["get-flag", id],
    queryFn: async () => {
      const res = await api.get("/flags/get-flag", { params: { id } });
      return res.data ?? null;
    },
    refetchOnMount: true,
    staleTime: 0,
    enabled: !!id,
  });
};

export const useSaveFlag = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: FlagFormvalue) => {
      const res = await api.post("/flags", data);
      return res.data ?? null;
    },
    onSuccess: (res: any) => {
      if (res.success) {
        toast.success(res.msg || "Flag Created Successfully !");
        queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      }
    },
  });
};

export const useFlagPlayGround = () => {
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await api.post("/flags/playground", data);
      return res.data ?? null;
    },
  });
};
export const useGetFlagListWithVersions = () => {
  return useQuery({
    queryKey: ["get-flag-list"],
    queryFn: async () => {
      const res = await api.get("/flags/get-flag-list");
      return res.data ?? null;
    },
    staleTime: Infinity,
  });
};

export const useOnFlagVersionChange = (id?: number, version?: number) => {
  return useQuery({
    queryKey: ["get-flag-definition", id, version],
    queryFn: async function fetchDefinition() {
      const res = await api.get("/flags/get-definition", {
        params: { id, version },
      });
      const body = res.data ?? null;
      if (!body) return null;
      let parsed = body.data;
      if (typeof parsed === "string") {
        try {
          parsed = JSON.parse(parsed);
        } catch {
          parsed = null;
        }
      }
      return { ...body, data: parsed };
    },
    enabled: !!id && !!version && version > 0,
    staleTime: Infinity,
  });
};

export const useSaveEditorFlag = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      id: number;
      expectedVersion: number;
      definition: any;
    }) => {
      const res = await api.post("/flags/editor", payload);
      return res.data ?? null;
    },
    onSuccess: (res: any) => {
      if (res.success) {
        toast.success(res.msg || "Editor Updated Successfully !");
        queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
        router.push("/flags");
      }
    },
  });
};

export function useUpdateFlagStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { id: number }) => {
      const res = await api.patch(`/flags`, {
        id: payload.id,
      });
      return res.data;
    },
    onSuccess: (res: any) => {
      if (res.success) {
        toast.success(res.msg || "Flag updated Successfully !");
        queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      }
    },
  });
}

export const useDeleteFlag = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete(`/flags/${id}`);
      return res.data ?? null;
    },
    onSuccess: (res: any) => {
      if (res.success) {
        toast.success(res.msg || "Flag Deleted Successfully !");
        queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      }
    },
  });
};

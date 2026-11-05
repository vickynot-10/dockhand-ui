import { GitHubFormValues, DockerFormValues } from "@/types/services.types";
import { api } from "@/utils/axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const QUERY_KEY = "services";

export function useSaveService() {
  return useMutation({
    mutationFn: async (data: GitHubFormValues | DockerFormValues) => {
      const res = await api.post("/services", data);
      return res.data ?? null;
    },
    onSuccess: (res: any) => {
      if (res?.success) {
        toast.success(res.msg || "Service Saved successfully!");
      }
    },
  });
}

export function useDeleteServices() {
  return useMutation({
    mutationFn: async (data: GitHubFormValues | DockerFormValues) => {
      const res = await api.post("/services", data);
      return res.data ?? null;
    },
    onSuccess: (res: any) => {
      if (res?.success) {
        toast.success(res.msg || "Service Saved successfully!");
      }
    },
  });
}

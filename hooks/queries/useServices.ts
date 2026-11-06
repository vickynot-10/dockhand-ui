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

export type ServicesBulkAction = "suspend" | "delete" | "resume";

export function useServicesBulkAction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { ids: string[]; action: ServicesBulkAction }) => {
      const res = await api.post("/services/actions", data);
      return res.data ?? null;
    },
    onSuccess: (res: any, vars) => {
      if (res?.success) {
        const fallback =
          vars.action === "delete"
            ? "Services deleted successfully!"
            : "Services suspended successfully!";
        toast.success(res.msg || fallback);
        queryClient.invalidateQueries({ queryKey: ["projects-services"] });
      }
    },
  });
}

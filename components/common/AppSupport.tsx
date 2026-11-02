"use client";
import { useForm, useWatch } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Bug, Lightbulb, CircleEllipsis, Icon } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { useMutation } from "@tanstack/react-query";
import { api } from "@/utils/axios";
import { toast } from "sonner";
import { Label } from "../ui/label";
import { cn } from "@/lib/utils";
import { AppButton } from "./AppButton";

const ISSUE_TYPES = [
  { label: "Bug", value: "bug", icon: Bug },
  { label: "Feauture", value: "feauture", icon: Lightbulb },
  { label: "Others", value: "others", icon: CircleEllipsis },
];
type IssueType = "bug" | "feauture" | "others";

type SupportFormValues = {
  issue_type: IssueType;
  description: string;
};

type AppSupportModalProps = {
  open: boolean;
  setOpen: () => void;
};

export default function AppSupportModal({
  open,
  setOpen,
}: AppSupportModalProps) {
  const { handleSubmit, control, setValue, register, reset } =
    useForm<SupportFormValues>({
      defaultValues: {
        issue_type: "bug",
        description: "",
      },
    });

  function SetStatus(value: IssueType) {
    setValue("issue_type", value);
  }

  const issue = useWatch({
    control,
    name: "issue_type",
  });

  const submitMuattation = useMutation({
    mutationFn: async (data: SupportFormValues) => {
      const res = await api.post("/support", data);
      return res.data;
    },
    onSuccess: (data) => {
      if (data.success) {
        toast.success(data.msg ?? "Submitted successfully");
        setOpen();
        reset();
      }
    },
  });

  function submitForm(values: SupportFormValues) {
    submitMuattation.mutate(values);
  }

  return (
    <Dialog open={open} onOpenChange={() => setOpen()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Support</DialogTitle>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(submitForm)}
          className="flex flex-col gap-4"
        >
          <div className="flex flex-col gap-3">
            <Label>Status</Label>
            <div className="flex flex-wrap gap-2">
              {ISSUE_TYPES.map((item) => {
                const isActive = item.value === issue;
                return (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => SetStatus(item.value as IssueType)}
                    className={cn(
                      "flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition-colors",
                      isActive
                        ? "border-primary bg-primary/10 text-foreground"
                        : "border-border text-muted-foreground hover:text-foreground hover:bg-accent/50",
                    )}
                  >
                    {" "}
                    <item.icon className="h-3.5 w-3.5" />
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Label>Description</Label>
            <Textarea
              {...register("description")}
              placeholder="Describe the issue or request"
              className="min-h-28 resize-none"
            />
          </div>

          <DialogFooter className="mt-2">
            <AppButton
              variant="secondary"
              onClick={() => setOpen()}
              type="button"
              isLoading={submitMuattation.isPending}
              idleLabel="Cancel"
              className="h-10 min-w-30"
            />
            <AppButton
              type="submit"
              isLoading={submitMuattation.isPending}
              disabled={submitMuattation.isPending}
              idleLabel={"Submit"}
              loadingLabel={"Submitting..."}
              className="h-10 min-w-30"
            />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

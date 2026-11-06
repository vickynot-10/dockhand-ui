"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useServicesBulkAction } from "@/hooks/queries/useServices";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ids: string[];
  type: "suspend" | "delete";
};

const DELETE_KEYWORD = "DELETE";

export default function ServicesSuspendDeleteDialog({
  open,
  onOpenChange,
  ids,
  type,
}: Props) {
  const [deleteText, setDeleteText] = useState("");

  const { mutate, isPending } = useServicesBulkAction();
  const isDelete = type === "delete";
  const count = ids.length;
  const noun = `service${count === 1 ? "" : "s"}`;
  const canConfirm = isDelete ? deleteText.trim() === DELETE_KEYWORD : true;

  useEffect(() => {
    if (open) setDeleteText("");
  }, [open, type]);

  function close() {
    onOpenChange(false);
    setDeleteText("");
  }

  function handleConfirm() {
    if (!canConfirm) return;
    mutate(
      { ids, action: type },
      {
        onSuccess: (res: any) => {
          if (res?.success) {
            // close();
          }
        },
      },
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-0 p-0 sm:max-w-3xl">
        <DialogHeader className="border-b px-8 py-7">
          <DialogTitle className="text-3xl font-semibold">
            {isDelete ? `Delete ${noun}` : `Suspend ${noun}`}
          </DialogTitle>
          <DialogDescription className="text-base">
            {isDelete
              ? "This action cannot be undone."
              : "Suspended services stop running until you resume them."}
          </DialogDescription>
        </DialogHeader>

        {isDelete ? (
          <div className="space-y-4 px-8 py-8">
            <p className="text-base text-muted-foreground">
              You are about to permanently delete{" "}
              <span className="font-semibold text-foreground">
                {count} {noun}
              </span>
              .
            </p>
            <div className="space-y-2">
              <Label htmlFor="services_delete_confirm" className="text-base">
                Type <span className="font-bold">{DELETE_KEYWORD}</span> to
                confirm
              </Label>
              <Input
                id="services_delete_confirm"
                type="text"
                autoComplete="off"
                placeholder={DELETE_KEYWORD}
                className="h-12 text-base"
                value={deleteText}
                onChange={(e) => setDeleteText(e.target.value)}
              />
            </div>
          </div>
        ) : (
          <div className="px-8 py-8">
            <p className="text-base text-muted-foreground">
              Are you sure you want to suspend{" "}
              <span className="font-semibold text-foreground">
                {count} {noun}
              </span>
              ?
            </p>
          </div>
        )}

        <div className="flex items-center gap-3 border-t px-8 py-6">
          <Button
            type="button"
            size="lg"
            variant={isDelete ? "destructive" : "default"}
            onClick={handleConfirm}
            disabled={!canConfirm || isPending}
          >
            {isDelete
              ? isPending
                ? "Deleting..."
                : "Confirm delete"
              : isPending
                ? "Suspending..."
                : "Confirm suspend"}
          </Button>
          <Button
            type="button"
            size="lg"
            variant="outline"
            onClick={close}
            disabled={isPending}
          >
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

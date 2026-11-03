"use client";

import { FormValues } from "@/types/project.types";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useDeleteProject, useSaveProjects } from "@/hooks/queries/useProjects";
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

type EditData = {
  id: string;
  project_name: string;
  environment: string;
};

type CreateOrEditProjectsProps = {
  data?: EditData;
};

export default function CreateOrEditProjects({
  data,
}: CreateOrEditProjectsProps) {
  const isEdit = Boolean(data);
  const [open, setOpen] = useState(false);

  const { mutate: saveProject, isPending: isSaving } = useSaveProjects();
  const { mutate: deleteProject, isPending: isDeleting } = useDeleteProject();
  const isBusy = isSaving || isDeleting;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: getDefaultValues(),
  });

  function getDefaultValues(): FormValues {
    return {
      id: data?.id ?? null,
      project_name: data?.project_name ?? "",
      environment: data?.environment ?? "",
    };
  }

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    reset(getDefaultValues());
  }

  function closeDialog() {
    setOpen(false);
    reset(getDefaultValues());
  }

  function onSubmit(values: FormValues) {
    saveProject(values, {
      onSuccess: (res: any) => {
        if (res?.success) closeDialog();
      },
    });
  }

  function handleDelete() {
    if (!data) return;
    deleteProject(data.id, {
      onSuccess: (res: any) => {
        if (res?.success) closeDialog();
      },
    });
  }

  return (
    <>
      <Button
        variant={isEdit ? "outline" : "default"}
        onClick={() => handleOpenChange(true)}
      >
        {isEdit ? "Edit" : "Add Project"}
      </Button>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="gap-0 p-0 sm:max-w-3xl">
          <DialogHeader className="border-b px-8 py-7">
            <DialogTitle className="text-3xl font-semibold">
              {isEdit ? "Edit Project" : "Add Project"}
            </DialogTitle>
            <DialogDescription className="text-base">
              {isEdit
                ? "Update the project details."
                : "Enter the details for your new project."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-8 px-8 py-8">
              <div className="space-y-2">
                <Label htmlFor="project_name" className="text-base">
                  Project name
                </Label>
                <Input
                  id="project_name"
                  type="text"
                  placeholder="Portfolio"
                  className="h-12 text-base"
                  {...register("project_name", {
                    required: "Project name is required",
                  })}
                />
                {errors.project_name && (
                  <p className="text-sm text-destructive">
                    {errors.project_name.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="environment" className="text-base">
                  Environment
                </Label>
                <Input
                  id="environment"
                  type="text"
                  placeholder="Staging"
                  className="h-12 text-base"
                  {...register("environment", {
                    required: "Environment is required",
                  })}
                />
                {errors.environment && (
                  <p className="text-sm text-destructive">
                    {errors.environment.message}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 border-t px-8 py-6">
              <Button type="submit" size="lg" disabled={isBusy}>
                {isSaving ? "Saving..." : isEdit ? "Save changes" : "Create"}
              </Button>
              <Button
                type="button"
                size="lg"
                variant="outline"
                onClick={closeDialog}
                disabled={isBusy}
              >
                Cancel
              </Button>
              {isEdit && (
                <Button
                  type="button"
                  size="lg"
                  variant="destructive"
                  className="ml-auto"
                  onClick={handleDelete}
                  disabled={isBusy}
                >
                  {isDeleting ? "Deleting..." : "Delete"}
                </Button>
              )}
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

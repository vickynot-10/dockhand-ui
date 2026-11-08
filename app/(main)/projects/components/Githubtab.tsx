"use client";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import {
  BranchField,
  BuildSettingsFields,
  RepoField,
  RepoTypeField,
  RootDirectoryField,
} from "./GithubInputs";
import { EnvVarsField } from "./EnvVars";
import FieldRow from "./FieldRow";
import { Input } from "@/components/ui/input";
import { DEPLOY_TYPE, GITHUB_REPO_TYPE } from "@/constants";
import { AppButton } from "@/components/common/AppButton";
import { useRouter } from "next/navigation";
import { useEditService, useSaveService } from "@/hooks/queries/useServices";
import { generateSlug, validateSlug } from "@/lib/genertateSlug";
import { GitHubFormValues, GithubProps } from "@/types/services.types";
import { useEffect } from "react";

const BASE_DOMAIN = process.env.NEXT_PUBLIC_BASE_DOMAIN ?? "localhost";

export default function GitHubTab({
  id,
  type,
  isEdit,
  editData,
  service_id,
}: GithubProps) {
  const methods = useForm<GitHubFormValues>({
    defaultValues: {
      name: "",
      slug: "",
      repo_id: null,
      repo_type: GITHUB_REPO_TYPE.PRIVATE,
      repo_full_name: "",
      branch: "",
      root_directory: "/",
      port: 3000,
      build_command: "",
      output_directory: "",
      env_vars: [{ key: "", value: "" }],
    },
  });

  const {
    control,
    register,
    handleSubmit,
    setValue,
    formState: { errors, dirtyFields },
    reset,
  } = methods;

  const repoFullName = useWatch({ control, name: "repo_full_name" });
  const projectName = useWatch({ control, name: "name" });
  const projectSlug = useWatch({ control, name: "slug" });

  const { mutate, isPending } = useSaveService();

  const { mutate: editService, isPending: isEditing } = useEditService();

  const router = useRouter();

  useEffect(() => {
    register("repo_id", { required: "Repository is required" });
    register("branch", { required: "Branch is required" });
    register("root_directory", { required: "Root directory is required" });
  }, [register]);

  useEffect(() => {
    if (!isEdit || !editData || !service_id) return;
    reset(editData);
  }, [isEdit, editData]);

  useEffect(() => {
    if (dirtyFields.slug) return;
    setValue("slug", generateSlug(projectName ?? ""));
  }, [projectName, dirtyFields.slug, setValue]);

  function GoBack() {
    router.push(`/projects/${id}`);
  }

  async function handleValidSubmit(values: GitHubFormValues) {
    const payload = {
      ...values,
      env_vars: values.env_vars.filter((v) => v.key.trim()),
      deploy_type: DEPLOY_TYPE.GITHUB,
      repo_type: values.repo_type,
      type,
      project_id: id,
    };
    if (isEdit && service_id) {
      (payload as any).service_id = service_id;
      editService(payload, {
        onSuccess: (res) => {
          if (res?.success) {
            GoBack();
          }
        },
      });
      return;
    }
    mutate(payload, {
      onSuccess: (res) => {
        if (res?.success) {
          GoBack();
        }
      },
    });
  }

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(handleValidSubmit)} className="w-full">
        <div className="w-full space-y-6 pb-6">
          <FieldRow
            label="Name"
            description="A Name for Site"
            htmlFor="site_name"
          >
            <Input
              id="site_name"
              placeholder="Portfolio"
              {...register("name", { required: "Name is required" })}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </FieldRow>

          <FieldRow
            label="Sub Domain"
            description="Your site will be available at this address"
            htmlFor="slug"
          >
            <Input
              id="slug"
              placeholder="my-app"
              {...register("slug", {
                required: "Sub Domain is required",
                validate: (value) => validateSlug(value) ?? true,
              })}
            />
            {projectSlug && (
              <p className="text-sm text-muted-foreground">
                {projectSlug}.{BASE_DOMAIN}
              </p>
            )}
            {errors.slug && (
              <p className="text-sm text-destructive">{errors.slug.message}</p>
            )}
          </FieldRow>

          <FieldRow
            label="Port"
            description="The port your app listens on inside the container"
            htmlFor="port"
          >
            <Input
              id="port"
              type="number"
              placeholder="3000"
              {...register("port", {
                required: "Port is required",
                valueAsNumber: true,
                min: { value: 1, message: "Port must be between 1 and 65535" },
                max: {
                  value: 65535,
                  message: "Port must be between 1 and 65535",
                },
              })}
            />
            {errors.port && (
              <p className="text-sm text-destructive">{errors.port.message}</p>
            )}
          </FieldRow>
          <RepoTypeField />
          <RepoField />
          {repoFullName && (
            <>
              <BranchField />
              <RootDirectoryField />
              <BuildSettingsFields />
              <EnvVarsField />
            </>
          )}
        </div>

        <div className="sticky bottom-0 z-10 flex items-center justify-end gap-2 border-t border-border bg-background py-3">
          <AppButton
            variant="secondary"
            type="button"
            idleLabel="Cancel"
            isLoading={isPending || isEditing}
            disabled={isPending || isEditing}
            onClick={GoBack}
            className=" min-w-30     py-6"
          />

          <AppButton
            idleLabel="Deploy Site"
            className=" min-w-30 py-6"
            isLoading={isPending || isEditing}
            disabled={isPending || isEditing}
            type="submit"
            loadingLabel="Deploying..."
            successLabel="Started"
          />
        </div>
      </form>
    </FormProvider>
  );
}

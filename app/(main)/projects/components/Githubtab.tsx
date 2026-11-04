"use client";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import {
  BranchField,
  BuildSettingsFields,
  RepoField,
  RootDirectoryField,
} from "./GithubInputs";
import { EnvVarsField } from "./EnvVars";
import FieldRow from "./FieldRow";
import { Input } from "@/components/ui/input";
import { DEPLOY_TYPE } from "@/constants";
import { AppButton } from "@/components/common/AppButton";
import { useRouter } from "next/navigation";

import { GitHubFormValues, Props } from "@/types/services.types";

export default function GitHubTab({ id, type }: Props) {
  const methods = useForm<GitHubFormValues>({
    defaultValues: {
      name: "",
      repo_id: null,
      repo_full_name: "",
      branch: "",
      root_directory: "/",
      build_command: "",
      output_directory: "",
      env_vars: [{ key: "", value: "" }],
    },
  });

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = methods;

  const repoFullName = useWatch({ control, name: "repo_full_name" });

  const router = useRouter();

  function GoBack() {
    router.push(`/projects/${id}`);
  }
  async function handleValidSubmit(values: GitHubFormValues) {
    const payload = {
      ...values,
      env_vars: values.env_vars.filter((v) => v.key.trim()),
      deploy_type: DEPLOY_TYPE.GITHUB,
      type,
      id,
    };
    console.log(payload);
  }

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(handleValidSubmit)} className="w-full">
        <div className="w-full space-y-6 pb-6">
          <RepoField />

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
            onClick={GoBack}
            className=" min-w-30     py-6"
          />

          <AppButton
            idleLabel="Deploy Site"
            className=" min-w-30 py-6"
            type="submit"
            loadingLabel="Deploying..."
            successLabel="Started"
          />
        </div>
      </form>
    </FormProvider>
  );
}

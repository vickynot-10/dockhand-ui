"use client";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import {
  BranchField,
  BuildSettingsFields,
  GitHubFormValues,
  RepoField,
  RootDirectoryField,
} from "./GithubInputs";
import { EnvVarsField } from "./EnvVars";
import FieldRow from "./FieldRow";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DEPLOY_TYPE } from "@/constants";

export default function GitHubTab() {
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
    formState: { errors, isSubmitting },
  } = methods;

  const repoFullName = useWatch({ control, name: "repo_full_name" });
  const branch = useWatch({ control, name: "branch" });

  async function handleValidSubmit(values: GitHubFormValues) {
    const payload = {
      ...values,
      env_vars: values.env_vars.filter((v) => v.key.trim()),
      deploy_type: DEPLOY_TYPE.GITHUB,
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
          <Button type="button" variant="outline">
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={!repoFullName || !branch || isSubmitting}
          >
            {isSubmitting ? "Deploying..." : "Deploy"}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}

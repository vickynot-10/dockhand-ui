"use client";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import {
  BranchField,
  BuildSettingsFields,
  GitHubFormValues,
  RepoField,
  RootDirectoryField,
} from "./GithubInputs";
import FieldRow from "./FieldRow";
import { Input } from "@/components/ui/input";

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
    },
  });

  const repoFullName = useWatch({
    control: methods.control,
    name: "repo_full_name",
  });

  return (
    <FormProvider {...methods}>
      <div className="w-full space-y-6">
        <RepoField />

        <FieldRow
          label="Name"
          description="A Name for Site"
          htmlFor="site_name"
        >
          <Input
            id="site_name"
            placeholder="Portfolio"
            {...methods.register("name")}
          />
        </FieldRow>

        {repoFullName && (
          <>
            <BranchField />
            <RootDirectoryField />
            <BuildSettingsFields />
          </>
        )}
      </div>
    </FormProvider>
  );
}

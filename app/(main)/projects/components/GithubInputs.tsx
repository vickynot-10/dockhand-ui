"use client";
import { useEffect } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useGetUserBranch,
  useGetRepoTree,
  useGetDetect,
} from "@/hooks/queries/useGithub";
import RepoCombobox from "./GitHubRepoList";
import FieldRow from "./FieldRow";
import { DirectoryTree } from "./DirectoryTree";
import { Input } from "@/components/ui/input";

export type GitHubFormValues = {
  name: string;
  repo_id: number | null;
  repo_full_name: string;
  branch: string;
  root_directory: string;
  build_command: string;
  output_directory: string;
  env_vars: { key: string; value: string }[];
};
function useRepoParts() {
  const { control } = useFormContext<GitHubFormValues>();
  const repoFullName = useWatch({ control, name: "repo_full_name" });
  const [owner = "", repo = ""] = repoFullName.split("/");
  return { owner, repo };
}

export function RepoField() {
  const { setValue, control } = useFormContext<GitHubFormValues>();
  const repoId = useWatch({ control, name: "repo_id" });

  function handleRepoChange(id: number, selectedRepo: any) {
    if (id === repoId) return;
    setValue("repo_id", id);
    setValue("repo_full_name", selectedRepo.full_name);
    setValue("branch", "");
    setValue("root_directory", "/");
  }

  return (
    <FieldRow
      label="Repository"
      description="Select the repository you want to deploy"
    >
      <RepoCombobox value={repoId} onChange={handleRepoChange} />
    </FieldRow>
  );
}

export function BranchField() {
  const { setValue, control } = useFormContext<GitHubFormValues>();
  const repoFullName = useWatch({ control, name: "repo_full_name" });
  const branch = useWatch({ control, name: "branch" });
  const { owner, repo } = useRepoParts();

  const { data: branchData, isLoading } = useGetUserBranch(owner, repo);

  const branches: string[] = branchData?.data?.branches ?? [];
  const defaultBranch: string = branchData?.data?.default_branch ?? "";

  useEffect(() => {
    if (defaultBranch) setValue("branch", defaultBranch);
  }, [defaultBranch, repoFullName, setValue]);

  function handleBranchChange(v: string | null) {
    setValue("branch", v ?? "");
    setValue("root_directory", "/");
  }

  return (
    <FieldRow label="Branch" description="Branch to build and deploy from">
      <Select
        value={branch}
        onValueChange={handleBranchChange}
        disabled={isLoading}
      >
        <SelectTrigger className="w-full">
          <SelectValue
            placeholder={isLoading ? "Loading..." : "Select branch"}
          />
        </SelectTrigger>
        <SelectContent alignItemWithTrigger={false} sideOffset={4}>
          {branches.map((b) => (
            <SelectItem key={b} value={b}>
              <span className="flex items-center gap-2">
                {b}
                {b === defaultBranch && (
                  <Badge variant="secondary" className="text-xs">
                    default
                  </Badge>
                )}
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </FieldRow>
  );
}

export function RootDirectoryField() {
  const { setValue, control } = useFormContext<GitHubFormValues>();
  const branch = useWatch({ control, name: "branch" });
  const rootDirectory = useWatch({ control, name: "root_directory" });
  const { owner, repo } = useRepoParts();

  const { data: treeData, isLoading } = useGetRepoTree(owner, repo, branch);

  const dirs: string[] = treeData?.data?.dirs ?? [];
  const packageDirs: string[] = treeData?.data?.package_dirs ?? [];
  const truncated: boolean = treeData?.data?.truncated ?? false;

  function handleRootChange(path: string) {
    setValue("root_directory", path);
  }

  return (
    <FieldRow
      label="Root directory"
      description={
        truncated
          ? "Repo is very large, some folders may be missing"
          : "Folder containing your app. Use / for the repo root"
      }
    >
      <DirectoryTree
        dirs={dirs}
        packageDirs={packageDirs}
        value={rootDirectory}
        onChange={handleRootChange}
        loading={!branch || isLoading}
      />
    </FieldRow>
  );
}

export function BuildSettingsFields() {
  const { register, setValue, control } = useFormContext<GitHubFormValues>();
  const branch = useWatch({ control, name: "branch" });
  const rootDirectory = useWatch({ control, name: "root_directory" });
  const { owner, repo } = useRepoParts();

  const { data: detectData, isLoading } = useGetDetect(
    owner,
    repo,
    branch,
    rootDirectory,
  );

  const detectedBuildCommand: string = detectData?.data?.build_command ?? "";

  useEffect(() => {
    if (!detectData) return;
    setValue("build_command", detectedBuildCommand);
  }, [detectData, detectedBuildCommand, setValue]);

  return (
    <>
      <FieldRow
        label="Build command"
        description="Install and build in one command"
        htmlFor="build_command"
      >
        <Input
          id="build_command"
          placeholder={
            isLoading ? "Detecting..." : "npm install && npm run build"
          }
          {...register("build_command")}
        />
      </FieldRow>

      <FieldRow
        label="Output directory"
        description="Folder with the built static files"
        htmlFor="output_directory"
      >
        <Input
          id="output_directory"
          placeholder="dist"
          {...register("output_directory")}
        />
      </FieldRow>
    </>
  );
}

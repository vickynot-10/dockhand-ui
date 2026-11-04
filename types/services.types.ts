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

export type DockerFormValues = {
  image_url: string;
};

export type Props = {
  id: string;
  type: string;
};

"use client";

import CreateOrEditProjects from "./CreateProject";
import { useGetProjects } from "@/hooks/queries/useProjects";

export default function Projects() {
  const { data, isLoading } = useGetProjects();

  if (isLoading) return <p>Loading...</p>;

  const projects = data?.data ?? [];

  console.log(projects);

  return (
    <div className="space-y-4">
      <div className="flex flex-row items-center justify-end">
        <CreateOrEditProjects />
      </div>

      <div className="space-y-2"></div>
    </div>
  );
}

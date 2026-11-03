"use client";
import { useState } from "react";
import { Label } from "@/components/ui/label";
import RepoCombobox from "./GitHubRepoList";

export default function GitHubTab() {
  const [repoId, setRepoId] = useState<number | null>(null);

  return (
    <div className="w-full space-y-2">
      <div className="max-w-md">
        <Label className="text-sm font-semibold">Repository</Label>
        <RepoCombobox value={repoId} onChange={(id) => setRepoId(id)} />
      </div>
    </div>
  );
}

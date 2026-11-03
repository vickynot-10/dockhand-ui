"use client";

import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type DockerFormValues = {
  image_url: string;
};

export default function DockerTab() {
  const {
    register,
    formState: { errors },
  } = useForm<DockerFormValues>({
    defaultValues: { image_url: "" },
  });

  return (
    <div className="w-full space-y-6">
      <div className="max-w-md space-y-1">
        <Label className="text-sm font-semibold">Docker</Label>
        <p className="text-sm text-muted-foreground">
          Deploy an image from a Docker registry
        </p>
      </div>

      <div className="max-w-md space-y-2">
        <Label htmlFor="image_url" className="text-sm font-semibold">
          Image URL
        </Label>
        <Input
          id="image_url"
          type="text"
          placeholder="docker.io/library/nginx:latest"
          {...register("image_url", {
            required: "Image URL is required",
          })}
        />
        {errors.image_url && (
          <p className="text-sm text-destructive">{errors.image_url.message}</p>
        )}
      </div>
    </div>
  );
}

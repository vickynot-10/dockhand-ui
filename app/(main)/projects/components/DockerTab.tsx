"use client";

import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import FieldRow from "./FieldRow";

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
      <FieldRow
        label="Image URL"
        description="Deploy an image from a Docker registry"
        htmlFor="image_url"
      >
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
      </FieldRow>
    </div>
  );
}

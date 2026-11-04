"use client";

import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import FieldRow from "./FieldRow";
import { DEPLOY_TYPE } from "@/constants";
import { Button } from "@/components/ui/button";

type DockerFormValues = {
  image_url: string;
};

export default function DockerTab() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<DockerFormValues>({
    defaultValues: { image_url: "" },
  });

  async function handleValidSubmit(values: DockerFormValues) {
    const payload = {
      image_url: values.image_url,
      deploy_type: DEPLOY_TYPE.DOCKER,
    };
    console.log(payload);
  }

  return (
    <div className="w-full space-y-6">
      <form onSubmit={handleSubmit(handleValidSubmit)} className="w-full">
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
            <p className="text-sm text-destructive">
              {errors.image_url.message}
            </p>
          )}
        </FieldRow>

        <div className="sticky bottom-0  z-10 flex items-center justify-end gap-2 bg-background py-5">
          <Button type="button" variant="outline">
            Cancel
          </Button>
          <Button type="submit">Deploy</Button>
        </div>
      </form>
    </div>
  );
}

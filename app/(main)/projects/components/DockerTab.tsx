"use client";

import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import FieldRow from "./FieldRow";
import { DEPLOY_TYPE } from "@/constants";
import { AppButton } from "@/components/common/AppButton";
import { useRouter } from "next/navigation";

import { DockerFormValues, Props } from "@/types/services.types";

export default function DockerTab({ id, type }: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<DockerFormValues>({
    defaultValues: { image_url: "" },
  });

  const router = useRouter();

  function GoBack() {
    router.push(`/projects/${id}`);
  }

  async function handleValidSubmit(values: DockerFormValues) {
    const payload = {
      image_url: values.image_url,
      deploy_type: DEPLOY_TYPE.DOCKER,
      type,
      id,
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
          <AppButton
            variant="secondary"
            type="button"
            idleLabel="Cancel"
            onClick={GoBack}
            className=" min-w-30     py-6"
          />

          <AppButton
            type="submit"
            idleLabel="Deploy Site"
            className=" min-w-30 py-6"
            loadingLabel="Deploying..."
            successLabel="Started"
          />
        </div>
      </form>
    </div>
  );
}

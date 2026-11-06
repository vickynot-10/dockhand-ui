"use client";

import { useGetServicebyID } from "@/hooks/queries/useServices";
import { DEPLOYMENT_STATUS, DEPLOY_TRIGGER, DEPLOY_TYPE } from "@/constants";
type Props = {
  id: string;
  type: string;
};
export default function ViewService({ id, type }: Props) {
  const { data, isPending } = useGetServicebyID(id);

  console.log(data);
  return (
    <>
      {id} {type}ihi
    </>
  );
}

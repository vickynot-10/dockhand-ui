"use client";

import { useGetServicebyID } from "@/hooks/queries/useServices";

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

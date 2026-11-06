"use client";
import { useGetDeployLogsByID } from "@/hooks/queries/useDeploy";
import { ServiceHeader } from "../ViewServices";
import TerminalLogs, { DeploymentLog } from "./TerminalLogs";

type Props = {
  id: string;
  type: string;
};

const EMPTY: DeploymentLog[] = [];

export default function ViewDeploylogs({ id }: Props) {
  const { data } = useGetDeployLogsByID(id);

  const service = data?.data?.service ?? null;
  if (!service) return null;

  const logs = (data?.data?.deployment_logs ?? EMPTY) as DeploymentLog[];

  return (
    <div className="space-y-6">
      <ServiceHeader service={service} />
      <div className="space-y-2">
        <TerminalLogs logs={logs} />
      </div>
    </div>
  );
}

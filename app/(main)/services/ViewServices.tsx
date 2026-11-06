"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  Copy,
  ExternalLink,
  GitBranch,
  PauseCircle,
  PlayCircle,
  Terminal,
  RotateCcwIcon,
  Rocket,
  Trash2,
  Plug,
} from "lucide-react";
import { DEPLOYMENT_STATUS, DEPLOY_TRIGGER, DEPLOY_TYPE } from "@/constants";
import {
  useDeployService,
  useGetServicebyID,
  useServicesBulkAction,
} from "@/hooks/queries/useServices";
import { formatRelative } from "@/lib/date";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ServiceActionType } from "../projects/components/ServicesDialog";
import ServicesSuspendDeleteDialog from "../projects/components/ServicesDialog";

import AppIcon from "@/components/common/AppIcons";
import AppIconButton from "@/components/common/AppIconButton";
import { ViewServiceSkeleton } from "@/components/common/AppLoaders";
type Props = {
  id: string;
  type: string;
};

type ServiceData = {
  id: string;
  name: string;
  type: "static" | "web";
  host: string | null;
  enabled: boolean;
  project_id: string;
  deploy_type: number;
  port: number;
  image_url: string | null;
  repo_full_name: string | null;
  branch: string | null;
};

type Deployment = {
  id: string;
  status: number;
  trigger: number;
  error: string | null;
  image_tag: string | null;
  commit_sha: string | null;
  container_name: string | null;
  created_on: string;
  started_on: string | null;
  finished_on: string | null;
};

type TableProps = {
  deployments: Deployment[];
  enabled: boolean;
  type: string;
};

const EMPTY: Deployment[] = [];

const STATUS_META: Record<number, { label: string; className: string }> = {
  [DEPLOYMENT_STATUS.QUEUED]: {
    label: "Queued",
    className: "text-muted-foreground",
  },
  [DEPLOYMENT_STATUS.BUILDING]: {
    label: "Building",
    className: "text-blue-600",
  },
  [DEPLOYMENT_STATUS.RUNNING]: {
    label: "Running",
    className: "text-green-600",
  },
  [DEPLOYMENT_STATUS.FAILED]: {
    label: "Failed",
    className: "text-destructive",
  },
  [DEPLOYMENT_STATUS.CANCELLED]: {
    label: "Cancelled",
    className: "text-muted-foreground",
  },
  [DEPLOYMENT_STATUS.SUSPENDED]: {
    label: "Suspended",
    className: "text-amber-600",
  },
  [DEPLOYMENT_STATUS.SUPERSEDED]: {
    label: "Superseded",
    className: "text-muted-foreground",
  },
};

const TRIGGER_LABEL: Record<number, string> = {
  [DEPLOY_TRIGGER.AUTO]: "Auto",
  [DEPLOY_TRIGGER.MANUAL]: "Manual",
};

function formatDuration(start: string | null, end: string | null) {
  if (!start || !end) return "-";
  const seconds = Math.round(
    (new Date(end).getTime() - new Date(start).getTime()) / 1000,
  );
  if (seconds < 60) return `${seconds}s`;
  return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
}

function shortImage(tag: string | null) {
  if (!tag) return "-";
  const [name, digest] = tag.split("@");
  return digest ? `${name}@${digest.slice(7, 19)}` : tag;
}

function LogsCell({
  deployment_id,
  type,
}: {
  deployment_id: string;
  type: string;
}) {
  return (
    <TableCell className="w-10 pe-10">
      <AppIconButton
        icon={<Terminal className="size-4" />}
        tooltip="View logs"
        href={`/services/${type}/${deployment_id}/logs`}
      />

      <AppIconButton
        icon={<RotateCcwIcon className="size-4" />}
        tooltip="Rollback"
      />
    </TableCell>
  );
}

function HeadCell({ children }: { children: React.ReactNode }) {
  return (
    <TableHead className="font-mono text-xs uppercase tracking-wider">
      {children}
    </TableHead>
  );
}

function StatusCell({
  deployment,
  enabled,
}: {
  deployment: Deployment;
  enabled: boolean;
}) {
  const meta = STATUS_META[deployment.status] ?? {
    label: "Unknown",
    className: "text-muted-foreground",
  };
  const isLive = enabled && deployment.status === DEPLOYMENT_STATUS.RUNNING;

  return (
    <TableCell>
      <div className="flex items-center gap-2">
        <Badge variant="outline" className={cn("capitalize", meta.className)}>
          {meta.label}
        </Badge>
        {isLive && <Badge>Live</Badge>}
      </div>
    </TableCell>
  );
}

function TriggerCell({ trigger }: { trigger: number }) {
  return (
    <TableCell>
      <Badge variant="secondary">{TRIGGER_LABEL[trigger] ?? "-"}</Badge>
    </TableCell>
  );
}

function TimeCells({ deployment }: { deployment: Deployment }) {
  return (
    <>
      <TableCell className="text-muted-foreground">
        {formatRelative(deployment.started_on ?? deployment.created_on)}
      </TableCell>
      <TableCell className="text-muted-foreground">
        {formatDuration(deployment.started_on, deployment.finished_on)}
      </TableCell>
    </>
  );
}

function EmptyRow() {
  return (
    <TableRow className="hover:bg-transparent">
      <TableCell
        colSpan={7}
        className="h-24 text-center text-sm text-muted-foreground"
      >
        No deployments yet.
      </TableCell>
    </TableRow>
  );
}

function DockerDeployTable({ deployments, enabled, type }: TableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          <HeadCell>Status</HeadCell>
          <HeadCell>Container</HeadCell>
          <HeadCell>Image</HeadCell>
          <HeadCell>Trigger</HeadCell>
          <HeadCell>Started</HeadCell>
          <HeadCell>Duration</HeadCell>
          <HeadCell>{null}</HeadCell>
        </TableRow>
      </TableHeader>
      <TableBody>
        {deployments.map((deployment) => (
          <TableRow key={deployment.id} className="h-14">
            <StatusCell deployment={deployment} enabled={enabled} />
            <TableCell>
              <div className="flex flex-col">
                <span className="font-mono text-sm">
                  {deployment.container_name ?? deployment.id.slice(0, 8)}
                </span>
                {deployment.error && (
                  <span className="max-w-xs truncate text-xs text-destructive">
                    {deployment.error}
                  </span>
                )}
              </div>
            </TableCell>
            <TableCell className="font-mono text-xs text-muted-foreground">
              {shortImage(deployment.image_tag)}
            </TableCell>
            <TriggerCell trigger={deployment.trigger} />
            <TimeCells deployment={deployment} />
            <LogsCell deployment_id={deployment.id} type={type} />
          </TableRow>
        ))}
        {deployments.length === 0 && <EmptyRow />}
      </TableBody>
    </Table>
  );
}

function GithubDeployTable({ deployments, enabled, type }: TableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          <HeadCell>Status</HeadCell>
          <HeadCell>Deployment</HeadCell>
          <HeadCell>Commit</HeadCell>
          <HeadCell>Trigger</HeadCell>
          <HeadCell>Started</HeadCell>
          <HeadCell>Duration</HeadCell>
          <HeadCell>{null}</HeadCell>
        </TableRow>
      </TableHeader>
      <TableBody>
        {deployments.map((deployment) => (
          <TableRow key={deployment.id} className="h-14">
            <StatusCell deployment={deployment} enabled={enabled} />
            <TableCell>
              <div className="flex flex-col">
                <span className="font-mono text-sm">
                  {deployment.id.slice(0, 8)}
                </span>
                {deployment.error && (
                  <span className="max-w-xs truncate text-xs text-destructive">
                    {deployment.error}
                  </span>
                )}
              </div>
            </TableCell>
            <TableCell className="font-mono text-xs text-muted-foreground">
              {deployment.commit_sha ? deployment.commit_sha.slice(0, 7) : "-"}
            </TableCell>
            <TriggerCell trigger={deployment.trigger} />
            <TimeCells deployment={deployment} />
            <LogsCell deployment_id={deployment.id} type={type} />
          </TableRow>
        ))}
        {deployments.length === 0 && <EmptyRow />}
      </TableBody>
    </Table>
  );
}

export function ServiceHeader({ service }: { service: ServiceData }) {
  const [copied, setCopied] = useState(false);
  const isDocker = service.deploy_type === DEPLOY_TYPE.DOCKER;

  const url = service.host ? `http://${service.host}` : null;

  async function copyUrl() {
    if (!url) return;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <>
      <div className="flex items-center gap-3">
        <h2 className="text-xl font-semibold">{service.name}</h2>
        <Badge variant="secondary" className="capitalize">
          {service.type}
        </Badge>
        {!service.enabled && (
          <Badge variant="outline" className="text-amber-600">
            Suspended
          </Badge>
        )}
      </div>
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
          <div className="flex items-center gap-2">
            <AppIcon type={isDocker ? "docker" : "github"} />

            <span className="font-medium">
              {isDocker ? service.image_url : service.repo_full_name}
            </span>
          </div>
          {!isDocker && service.branch && (
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <GitBranch className="size-4" />
              <span>{service.branch}</span>
            </div>
          )}
          {service.port && (
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Plug className="size-4" />
              <span className="font-mono">:{service.port}</span>
            </div>
          )}{" "}
        </div>

        {url && (
          <div className="flex items-center gap-1">
            <a
              href={url}
              target="_blank"
              rel="noreferrer"
              className={cn(
                "inline-flex items-center gap-1 text-sm text-primary underline-offset-4 hover:underline",
                !service.enabled && "pointer-events-none opacity-50",
              )}
            >
              {url}
              <ExternalLink className="size-3" />
            </a>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-7"
              onClick={copyUrl}
              aria-label="Copy URL"
            >
              {copied ? (
                <Check className="size-4 text-green-600" />
              ) : (
                <Copy className="size-4" />
              )}
            </Button>
          </div>
        )}
      </div>
    </>
  );
}

export default function ViewService({ id, type }: Props) {
  const router = useRouter();
  const { data, isLoading } = useGetServicebyID(id);
  const { mutate: bulkMutate, isPending: isBulkPending } =
    useServicesBulkAction();
  const { mutate: deployMutate, isPending: isDeploying } = useDeployService();

  const [dialogType, setDialogType] = useState<ServiceActionType | null>(null);

  const service = (data?.data?.services ?? null) as ServiceData | null;
  const deployments = (data?.data?.deployments ?? EMPTY) as Deployment[];

  if (isLoading) return <ViewServiceSkeleton />;

  if (!service) {
    return <p className="text-sm text-muted-foreground">Service not found.</p>;
  }

  const hasInFlight = deployments.some(
    (d) =>
      d.status === DEPLOYMENT_STATUS.QUEUED ||
      d.status === DEPLOYMENT_STATUS.BUILDING,
  );

  const isDocker = service.deploy_type === DEPLOY_TYPE.DOCKER;

  function handleResume() {
    bulkMutate({
      action: "resume",
      ids: [service!.id],
      project_id: service!.project_id,
    });
  }

  function handleDeleted() {
    router.push(`/projects/${service!.project_id}`);
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-3">
            <ServiceHeader service={service} />
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              className="gap-1.5"
              disabled={!service.enabled || isDeploying || hasInFlight}
              onClick={() => deployMutate(service.id)}
            >
              <Rocket className="size-4" /> Deploy
            </Button>
            {service.enabled ? (
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5"
                onClick={() => setDialogType("suspend")}
              >
                <PauseCircle className="size-4" /> Suspend
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5"
                disabled={isBulkPending}
                onClick={handleResume}
              >
                <PlayCircle className="size-4 text-green-600" /> Resume
              </Button>
            )}
            <Button
              variant="destructive"
              size="sm"
              className="gap-1.5"
              onClick={() => setDialogType("delete")}
            >
              <Trash2 className="size-4" /> Delete
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Deploys</h3>
          {isDocker ? (
            <DockerDeployTable
              deployments={deployments}
              enabled={service.enabled}
              type={type}
            />
          ) : (
            <GithubDeployTable
              deployments={deployments}
              enabled={service.enabled}
              type={type}
            />
          )}
        </div>
      </div>

      <ServicesSuspendDeleteDialog
        open={dialogType !== null}
        onOpenChange={(o) => !o && setDialogType(null)}
        ids={[service.id]}
        type={dialogType ?? "suspend"}
        onSuccess={dialogType === "delete" ? handleDeleted : undefined}
        project_id={service.project_id}
      />
    </>
  );
}

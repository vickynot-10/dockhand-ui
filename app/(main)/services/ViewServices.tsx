"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ExternalLink,
  PauseCircle,
  PlayCircle,
  Rocket,
  Trash2,
} from "lucide-react";
import { DEPLOYMENT_STATUS } from "@/constants";
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

import ServicesSuspendDeleteDialog from "../projects/components/ServicesDialog";
import { ServiceActionType } from "../projects/components/ServicesDialog";
import Link from "next/link";

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
  image_url: string | null;
};

type Deployment = {
  id: string;
  status: number;
  error: string | null;
  image_tag: string | null;
  container_name: string | null;
  created_on: string;
  started_on: string | null;
  finished_on: string | null;
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

export default function ViewService({ id, type }: Props) {
  const router = useRouter();
  const { data, isLoading } = useGetServicebyID(id);
  const { mutate: bulkMutate, isPending: isBulkPending } =
    useServicesBulkAction();
  const { mutate: deployMutate, isPending: isDeploying } = useDeployService();

  const [dialogType, setDialogType] = useState<ServiceActionType | null>(null);

  const service = (data?.data?.services ?? null) as ServiceData | null;
  const deployments = (data?.data?.deployments ?? EMPTY) as Deployment[];

  if (isLoading) return null;

  if (!service) {
    return <p className="text-sm text-muted-foreground">Service not found.</p>;
  }

  const sorted = [...deployments].sort(
    (a, b) =>
      new Date(b.created_on).getTime() - new Date(a.created_on).getTime(),
  );
  const hasInFlight = deployments.some(
    (d) =>
      d.status === DEPLOYMENT_STATUS.QUEUED ||
      d.status === DEPLOYMENT_STATUS.BUILDING,
  );

  const url = service.host ? `http://${service.host}` : null;

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
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-semibold">{service.name}</h2>
              <Badge variant="secondary" className="capitalize">
                {service.type ?? type}
              </Badge>
              {!service.enabled && (
                <Badge variant="outline" className="text-amber-600">
                  Suspended
                </Badge>
              )}
            </div>
            {url && (
              <Link
                href={url}
                target="_blank"
                rel="noreferrer"
                className={cn(
                  "inline-flex items-center gap-1 text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground",
                  !service.enabled && "pointer-events-none opacity-50",
                )}
              >
                {service.host}
                <ExternalLink className="size-3" />
              </Link>
            )}
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
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="font-mono text-xs uppercase tracking-wider">
                  Status
                </TableHead>
                <TableHead className="font-mono text-xs uppercase tracking-wider">
                  Deployment
                </TableHead>
                <TableHead className="font-mono text-xs uppercase tracking-wider">
                  Image
                </TableHead>
                <TableHead className="font-mono text-xs uppercase tracking-wider">
                  Started
                </TableHead>
                <TableHead className="font-mono text-xs uppercase tracking-wider">
                  Duration
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.map((deployment) => {
                const meta = STATUS_META[deployment.status] ?? {
                  label: "Unknown",
                  className: "text-muted-foreground",
                };
                const isLive =
                  service.enabled &&
                  deployment.status === DEPLOYMENT_STATUS.RUNNING;
                return (
                  <TableRow key={deployment.id} className="h-14">
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className={cn("capitalize", meta.className)}
                        >
                          {meta.label}
                        </Badge>
                        {isLive && <Badge>Live</Badge>}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-mono text-sm">
                          {deployment.container_name ??
                            deployment.id.slice(0, 8)}
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
                    <TableCell className="text-muted-foreground">
                      {formatRelative(
                        deployment.started_on ?? deployment.created_on,
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDuration(
                        deployment.started_on,
                        deployment.finished_on,
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}

              {sorted.length === 0 && (
                <TableRow className="hover:bg-transparent">
                  <TableCell
                    colSpan={5}
                    className="h-24 text-center text-sm text-muted-foreground"
                  >
                    No deployments yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
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

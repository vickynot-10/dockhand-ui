"use client";
import { DEPLOY_TYPE } from "@/constants";
import Link from "next/link";
import { motion } from "motion/react";
import {
  GitBranch,
  ArrowRight,
  FileCode2,
  Server,
  Container,
  MoreHorizontal,
} from "lucide-react";

import { formatRelative } from "@/lib/date";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useGetProjectServices } from "@/hooks/queries/useProjects";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type Props = {
  id: string;
};

type Service = {
  id: string;
  service_name: string;
  deploy_type: number;
  type: "static" | "web";
  updated_on: string;
};

function ServiceNameCell({ service }: { service: Service }) {
  const isDocker = service.deploy_type === DEPLOY_TYPE.DOCKER;
  const Icon = isDocker ? Container : GitBranch;

  return (
    <div className="flex items-center gap-3">
      <Icon
        className="size-4 shrink-0 text-muted-foreground"
        aria-label={isDocker ? "Docker" : "GitHub"}
      />
      <span className="font-medium underline underline-offset-4">
        {service.service_name}
      </span>
    </div>
  );
}

const serviceTypes = [
  {
    key: "static",
    title: "Static Sites",
    description:
      "Ship pre-built pages straight from the edge. Perfect for landing pages, portfolios, docs, and anything that doesn't need a server.",
    cta: "Create Static Site",
    icon: FileCode2,
    href: (id: string) => `/projects/${id}/new/static`,
  },
  {
    key: "web",
    title: "Web Services",
    description:
      "Run long-lived server apps with your own runtime. Great for APIs, full-stack apps, background workers, and backends for mobile apps.",
    cta: "Create Web Service",
    icon: Server,
    href: (id: string) => `/projects/${id}/new/web`,
  },
] as const;

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 260, damping: 24 },
  },
} as const;

export default function ProjectServices({ id }: Props) {
  const { data, isLoading } = useGetProjectServices(id);
  const project_data = data?.data ?? null;
  const services = project_data?.services ?? [];

  if (isLoading) return null;
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Services</h2>
        <p className="text-sm text-muted-foreground">
          {services.length === 0
            ? "No services yet. Create one to get started."
            : `${services.length} service${services.length > 1 ? "s" : ""}`}
        </p>
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid gap-4 sm:grid-cols-2"
      >
        {serviceTypes.map(
          ({ key, title, description, cta, icon: Icon, href }) => (
            <motion.div
              key={key}
              variants={item}
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card className="group h-full transition-colors hover:border-primary/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Icon className="size-5 text-muted-foreground transition-colors group-hover:text-primary" />
                    {title}
                  </CardTitle>
                  <CardDescription className="text-sm leading-relaxed">
                    {description}
                  </CardDescription>
                </CardHeader>

                <CardContent />

                <CardFooter>
                  <Button variant="link" className="h-auto gap-1 p-0">
                    <Link
                      href={href(id)}
                      className=" flex flex-row gap-2 items-center"
                    >
                      {cta}
                      <ArrowRight className=" transition-transform group-hover:translate-x-1" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ),
        )}
      </motion.div>

      {services && services.length > 0 && (
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="font-mono text-xs uppercase tracking-wider">
                Service Name
              </TableHead>
              <TableHead className="font-mono text-xs uppercase tracking-wider">
                Type
              </TableHead>

              <TableHead className="font-mono text-xs uppercase tracking-wider">
                Updated
              </TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {(services as Service[]).map((service) => (
              <TableRow key={service.id} className="h-14">
                <TableCell>
                  <Link href={`/projects/${id}/edit/${service.id}`}>
                    <ServiceNameCell service={service} />
                  </Link>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className="capitalize">
                    {service.type}
                  </Badge>
                </TableCell>

                <TableCell className="text-muted-foreground">
                  {formatRelative(service.updated_on)}
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="icon" className="size-8">
                    <MoreHorizontal className="size-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}

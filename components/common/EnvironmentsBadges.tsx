import { Badge } from "@/components/ui/badge";
import { ENVIRONMENTS } from "@/constants";

const ENVIRONMENT_META: Record<number, { label: string; className: string }> = {
  [ENVIRONMENTS.DEVELOPMENT]: {
    label: "Development",
    className: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  },
  [ENVIRONMENTS.STAGING]: {
    label: "Staging",
    className: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  },
  [ENVIRONMENTS.TESTING]: {
    label: "Testing",
    className: "bg-purple-500/10 text-purple-600 border-purple-500/20",
  },
  [ENVIRONMENTS.PRODUCTION]: {
    label: "Production",
    className: "bg-green-500/10 text-green-600 border-green-500/20",
  },
};

export default function EnvironmentBadge({ value }: { value: number }) {
  const env = ENVIRONMENT_META[value];
  if (!env) return null;
  return (
    <Badge variant="outline" className={env.className}>
      {env.label}
    </Badge>
  );
}

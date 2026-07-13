import { Badge } from "./Badge";
import { Card } from "./Card";
import { PlanToggleSwitch } from "./PlanToggleSwitch";
import type { PlanFeatureFlag } from "../services/types";

export interface PlanFlagsSectionProps {
  flags: PlanFeatureFlag[];
  onToggle: (flagId: string, enabled: boolean) => void;
}

export function PlanFlagsSection({ flags, onToggle }: PlanFlagsSectionProps) {
  return (
    <Card title="Feature flags">
      <div className="space-y-0.5">
        {flags.map((flag) => (
          <div key={flag.id} className="flex items-center gap-4 border-b border-ink-100 py-3 last:border-b-0">
            <div className="min-w-0 flex-1">
              <div className="text-[14px] font-medium text-ink-900">{flag.label}</div>
              <div className="mt-0.5 text-[12.5px] text-ink-400">{flag.description}</div>
            </div>
            <Badge tone={flag.scope === "rollout" ? "amber" : "indigo"}>
              {flag.scope === "rollout" ? "Rollout" : "Plan"}
            </Badge>
            <PlanToggleSwitch
              checked={flag.enabled}
              onChange={(checked) => onToggle(flag.id, checked)}
              label={flag.label}
            />
          </div>
        ))}
      </div>
    </Card>
  );
}

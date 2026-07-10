import { Badge } from "./Badge";
import { Card } from "./Card";
import type { PlanAuditEntry, PlanVersionEntry } from "../services/types";
import { visiblePlanName } from "../plans/planUtils";

export interface PlanHistorySectionProps {
  versions: PlanVersionEntry[];
  auditLog: PlanAuditEntry[];
}

export function PlanHistorySection({ versions, auditLog }: PlanHistorySectionProps) {
  return (
    <div className="mt-4 grid gap-4 xl:grid-cols-2">
      <Card title="Version history">
        <div className="space-y-3">
          {versions.map((entry) => (
            <div key={entry.id} className="rounded-[12px] border border-ink-100 p-3.5">
              <div className="flex items-center justify-between gap-3">
                <div className="text-[13px] font-semibold text-ink-900">
                  {visiblePlanName(entry.plan)} · {entry.version}
                </div>
                <div className="text-[12px] text-ink-400">{entry.changedAt}</div>
              </div>
              <div className="mt-1 text-[13px] text-ink-600">{entry.summary}</div>
              <div className="mt-2 text-[12px] text-ink-400">Changed by {entry.changedBy}</div>
              <div className="mt-2 flex flex-wrap gap-2">
                {entry.fields.map((field) => (
                  <Badge key={field}>{field}</Badge>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card title="Audit trail">
        <div className="space-y-3">
          {auditLog.map((entry) => (
            <div key={entry.id} className="rounded-[12px] border border-ink-100 p-3.5">
              <div className="flex items-center justify-between gap-3">
                <div className="text-[13px] font-semibold text-ink-900">{entry.action}</div>
                <div className="text-[12px] text-ink-400">{entry.timestamp}</div>
              </div>
              <div className="mt-1 text-[13px] text-ink-600">
                {visiblePlanName(entry.plan)} · {entry.details}
              </div>
              <div className="mt-2 text-[12px] text-ink-400">Actor: {entry.actor}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

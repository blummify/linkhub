import { cn } from "@/lib/cn";
import { Icon } from "../icons";
import type { Report, ReportAction, ReportSeverity } from "../services/types";
import { Badge } from "./Badge";
import { Button } from "./Button";

const SEVERITY_BOX: Record<ReportSeverity, string> = {
  high: "bg-danger-50 text-rose-500",
  medium: "bg-amber-50 text-amber-500",
};

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export interface ReportCardProps {
  report: Report;
  onAction: (action: ReportAction) => void;
}

export function ReportCard({ report, onAction }: ReportCardProps) {
  const isHigh = report.severity === "high";

  return (
    <div className="mb-3 flex gap-3.5 rounded-[16px] border border-ink-100 bg-white p-[18px] max-[860px]:flex-col">
      <div
        className={cn(
          "grid h-[42px] w-[42px] flex-none place-items-center rounded-[12px]",
          SEVERITY_BOX[report.severity]
        )}
      >
        <Icon name="alert" className="h-5 w-5" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="text-sm font-semibold text-ink-900">{report.handle}</span>
          <Badge tone={isHigh ? "rose" : "amber"}>{capitalize(report.category)}</Badge>
          <Badge tone="neutral">
            {report.reportCount} {report.reportCount === 1 ? "report" : "reports"}
          </Badge>
        </div>
        <p className="mt-1.5 text-[13px] text-ink-500">{report.description}</p>
        <p className="mt-1.5 text-xs text-ink-400">
          First reported by {report.reporter} · {report.reportedAt} ·{" "}
          <span className="font-[family-name:var(--font-geist-mono)]">{report.url}</span>
        </p>
      </div>

      <div className="flex flex-none items-center gap-2 self-center max-[860px]:self-start">
        <Button onClick={() => onAction("review")}>Review</Button>
        {isHigh ? (
          <Button variant="danger" onClick={() => onAction("takedown")}>
            Take down
          </Button>
        ) : (
          <Button variant="amber" onClick={() => onAction("warn")}>
            Warn
          </Button>
        )}
        <Button variant="ghost" onClick={() => onAction("dismiss")}>
          Dismiss
        </Button>
      </div>
    </div>
  );
}

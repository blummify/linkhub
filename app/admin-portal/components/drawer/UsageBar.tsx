import type { UsageMetric } from "../../services/types";

export function UsageBar({ metric }: { metric: UsageMetric }) {
  const pct = metric.limit > 0 ? Math.min(100, Math.round((metric.used / metric.limit) * 100)) : 0;

  return (
    <div className="my-2 flex items-center gap-2.5 text-[13px]">
      <span className="w-16 text-ink-500">{metric.label}</span>
      <span className="h-[7px] flex-1 overflow-hidden rounded-full bg-ink-100">
        <span className="block h-full rounded-full bg-indigo-500" style={{ width: `${pct}%` }} />
      </span>
      <span className="w-[74px] text-right text-xs text-ink-400">{metric.display}</span>
    </div>
  );
}

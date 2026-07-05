import { cn } from "@/lib/cn";
import { Icon } from "../icons";
import type { DeltaTone, Kpi, TrendDirection } from "../services/types";
import { Sparkline } from "./Sparkline";

const DELTA_FROM_DIRECTION: Record<TrendDirection, DeltaTone> = {
  up: "positive",
  down: "negative",
  flat: "neutral",
};

const DELTA_COLOR: Record<DeltaTone, string> = {
  positive: "text-green-500",
  negative: "text-rose-500",
  warning: "text-amber-500",
  neutral: "text-ink-400",
};

const SPARKLINE_STROKE: Record<DeltaTone, string> = {
  positive: "stroke-green-500",
  negative: "stroke-rose-500",
  warning: "stroke-amber-500",
  neutral: "stroke-ink-300",
};

export function KpiCard({ kpi }: { kpi: Kpi }) {
  const tone = kpi.delta?.tone ?? (kpi.delta ? DELTA_FROM_DIRECTION[kpi.delta.direction] : "neutral");

  return (
    <div className="relative overflow-hidden rounded-[16px] border border-ink-100 bg-white p-[18px]">
      <div className="text-[11.5px] font-medium uppercase tracking-[0.07em] text-ink-400">
        {kpi.label}
      </div>
      <div className="mt-2 font-[family-name:var(--font-instrument-serif)] text-[30px] italic tracking-[-0.02em] text-ink-900">
        {kpi.value}
      </div>
      {kpi.delta && (
        <div className={cn("mt-1.5 inline-flex items-center gap-1 text-xs font-medium", DELTA_COLOR[tone])}>
          {kpi.delta.direction === "up" && <Icon name="trendUp" className="h-3.5 w-3.5" />}
          {kpi.delta.direction === "down" && <Icon name="trendDown" className="h-3.5 w-3.5" />}
          {kpi.delta.text}
        </div>
      )}
      {kpi.sparkline && (
        <Sparkline
          values={kpi.sparkline}
          strokeClassName={SPARKLINE_STROKE[tone]}
          className="absolute bottom-4 right-4 h-6 w-[62px]"
        />
      )}
    </div>
  );
}

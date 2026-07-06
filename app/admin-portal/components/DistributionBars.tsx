import { cn } from "@/lib/cn";
import type { DistributionSlice } from "../services/types";

const FILL_CLASSES: Record<DistributionSlice["tone"], string> = {
  neutral: "bg-ink-300",
  primary: "bg-indigo-500",
  purple: "bg-purple-500",
};

export function DistributionBars({ slices }: { slices: DistributionSlice[] }) {
  return (
    <div>
      {slices.map((slice) => (
        <div key={slice.label} className="my-3 flex items-center gap-3">
          <span className="w-[78px] text-[13px] text-ink-700">{slice.label}</span>
          <span className="h-2 flex-1 overflow-hidden rounded-full bg-ink-100">
            <span
              className={cn("block h-full rounded-full", FILL_CLASSES[slice.tone])}
              style={{ width: `${slice.pct}%` }}
            />
          </span>
          <span className="w-[38px] text-right text-[12.5px] font-semibold text-ink-700">
            {slice.pct}%
          </span>
        </div>
      ))}
    </div>
  );
}

import { useMemo } from "react";
import { cn } from "@/lib/cn";

export interface SparklineProps {
  /** Raw data points; rendered as a normalized polyline. */
  values: number[];
  /** Tailwind stroke utility for the line, e.g. "stroke-green-500". */
  strokeClassName?: string;
  width?: number;
  height?: number;
  className?: string;
}

/** Build a normalized SVG path so any value range fits the viewBox. */
function buildPath(values: number[], width: number, height: number): string {
  const pad = 3;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const stepX = values.length > 1 ? width / (values.length - 1) : 0;

  return values
    .map((value, index) => {
      const x = index * stepX;
      // Invert: higher values sit nearer the top of the viewBox.
      const y = height - pad - ((value - min) / span) * (height - pad * 2);
      return `${index === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");
}

export function Sparkline({
  values,
  strokeClassName = "stroke-current",
  width = 62,
  height = 24,
  className,
}: SparklineProps) {
  const d = useMemo(() => buildPath(values, width, height), [values, width, height]);

  if (values.length < 2) return null;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={className}
      fill="none"
      aria-hidden="true"
      focusable="false"
      preserveAspectRatio="none"
    >
      <path
        d={d}
        className={cn(strokeClassName)}
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

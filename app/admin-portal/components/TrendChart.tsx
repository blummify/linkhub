import { useMemo } from "react";

const WIDTH = 640;
const HEIGHT = 220;
const PAD = 40;

interface Line {
  line: string;
  area: string;
}

/** Normalize a series into a line path (and a closed area path) within the viewBox. */
function buildLine(values: number[]): Line {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const stepX = values.length > 1 ? WIDTH / (values.length - 1) : 0;

  const points = values.map((value, index) => {
    const x = index * stepX;
    const y = PAD + (1 - (value - min) / span) * (HEIGHT - PAD * 2);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

  const line = `M${points.map((p) => p.replace(",", " ")).join(" L")}`;
  const area = `${line} L${WIDTH} ${HEIGHT} L0 ${HEIGHT} Z`;
  return { line, area };
}

export interface TrendChartProps {
  signups: number[];
  revenue: number[];
}

/** Dual-line trend chart (signups + revenue) as a lightweight inline SVG. */
export function TrendChart({ signups, revenue }: TrendChartProps) {
  const signupsLine = useMemo(() => buildLine(signups), [signups]);
  const revenueLine = useMemo(() => buildLine(revenue), [revenue]);

  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      width="100%"
      height={200}
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
    >
      {[55, 110, 165].map((y) => (
        <line key={y} x1={0} y1={y} x2={WIDTH} y2={y} className="stroke-ink-100" />
      ))}
      <path d={signupsLine.area} className="fill-indigo-500" fillOpacity={0.08} />
      <path
        d={signupsLine.line}
        fill="none"
        className="stroke-indigo-500"
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d={revenueLine.line}
        fill="none"
        className="stroke-green-500"
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

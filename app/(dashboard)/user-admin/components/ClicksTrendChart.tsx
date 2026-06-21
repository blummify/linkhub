"use client";

import { useMemo, useState } from "react";
import type { ManagedLink } from "./types";
import { sumClicks, formatClicks, buildClicksSeries } from "@/lib/clicks";

type RangeKey = "7" | "30";

const RANGES: { key: RangeKey; label: string; days: number }[] = [
  { key: "7", label: "7D", days: 7 },
  { key: "30", label: "30D", days: 30 },
];

const panelCard: React.CSSProperties = {
  background: "white",
  border: "1px solid #eef0f7",
  borderRadius: 18,
  padding: "20px 20px 16px",
  boxShadow: "0 1px 2px rgba(15,23,42,0.04)",
};

function dateLabel(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// ── Hand-built SVG bar chart (no chart lib, matching the codebase convention) ──
function BarChart({ values, days }: { values: number[]; days: number }) {
  const W = 720;
  const H = 180;
  const padT = 12;
  const padB = 22;
  const innerH = H - padT - padB;

  const bars = useMemo(() => {
    const m = Math.max(...values, 1);
    const slot = W / values.length;
    const gap = days > 14 ? slot * 0.32 : slot * 0.42;
    const barW = slot - gap;
    return values.map((v, i) => {
      const h = (v / m) * innerH;
      return { x: i * slot + gap / 2, y: padT + innerH - h, w: barW, h, v, i };
    });
  }, [values, days, innerH]);

  const lastIdx = values.length - 1;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      role="img"
      aria-label={`Clicks over the last ${days} days`}
      style={{ width: "100%", height: 180, display: "block" }}
    >
      <defs>
        <linearGradient id="clicksBarGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3b46e0" />
          <stop offset="100%" stopColor="#6873ff" />
        </linearGradient>
      </defs>

      <line x1={0} y1={padT + innerH} x2={W} y2={padT + innerH} stroke="#eef0f7" strokeWidth={1} />

      {bars.map((b) => (
        <rect
          key={b.i}
          x={b.x}
          y={b.y}
          width={b.w}
          height={Math.max(b.h, b.v > 0 ? 2 : 0)}
          rx={2}
          fill="url(#clicksBarGrad)"
        >
          <title>{`${dateLabel(lastIdx - b.i)}: ${formatClicks(b.v)} clicks`}</title>
        </rect>
      ))}

      {[0, Math.floor(lastIdx / 2), lastIdx].map((idx, k) => {
        const slot = W / values.length;
        const x = idx * slot + slot / 2;
        return (
          <text
            key={k}
            x={Math.min(Math.max(x, 18), W - 18)}
            y={H - 6}
            textAnchor="middle"
            fontSize={11}
            fill="#a8aecb"
            fontFamily="'Geist Mono', monospace"
          >
            {dateLabel(lastIdx - idx)}
          </text>
        );
      })}
    </svg>
  );
}

function ZeroState() {
  return (
    <div className="flex flex-col items-center justify-center text-center" style={{ padding: "28px 16px 24px" }}>
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: 12,
          background: "#f0f1f9",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 14,
          color: "#6b75a3",
        }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v18h18" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M7 14l3-3 3 3 4-5" />
        </svg>
      </div>
      <p
        className="leading-none"
        style={{
          fontSize: 26,
          fontWeight: 400,
          fontStyle: "italic",
          fontFamily: "var(--font-instrument-serif), Georgia, serif",
          color: "#0b1020",
          letterSpacing: "-0.02em",
          marginBottom: 8,
        }}
      >
        0 clicks
      </p>
      <p className="max-w-sm" style={{ fontSize: 13, color: "#6b75a3", lineHeight: 1.6 }}>
        Your click data populates once your public page is live.{" "}
        <span style={{ color: "#3b46e0", fontWeight: 500 }}>Share your page</span> to start tracking how your links
        perform.
      </p>
    </div>
  );
}

export interface ClicksTrendChartProps {
  links: ManagedLink[];
}

export function ClicksTrendChart({ links }: ClicksTrendChartProps) {
  const [range, setRange] = useState<RangeKey>("7");

  const total = useMemo(() => sumClicks(links), [links]);
  const days = range === "7" ? 7 : 30;
  const series = useMemo(() => buildClicksSeries(total, days), [total, days]);

  return (
    <div style={panelCard}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div
            style={{
              fontFamily: "var(--font-instrument-serif), Georgia, serif",
              fontStyle: "italic",
              fontSize: 22,
              color: "#0b1020",
              letterSpacing: "-0.01em",
            }}
          >
            Clicks over time
          </div>
          <p style={{ fontSize: 12.5, color: "#6b75a3", marginTop: 2 }}>
            {total > 0 ? `${formatClicks(total)} total clicks · last ${days} days` : "No clicks recorded yet"}
          </p>
        </div>

        {total > 0 && (
          <div
            role="group"
            aria-label="Select time range"
            style={{
              display: "inline-flex",
              background: "white",
              border: "1px solid #eef0f7",
              borderRadius: 99,
              padding: 3,
              boxShadow: "0 1px 2px rgba(15,23,42,0.04)",
              alignSelf: "flex-start",
            }}
          >
            {RANGES.map((r) => (
              <button
                key={r.key}
                type="button"
                aria-pressed={range === r.key}
                onClick={() => setRange(r.key)}
                className="cursor-pointer transition-all duration-150"
                style={{
                  padding: "6px 14px",
                  fontSize: 12.5,
                  fontWeight: 500,
                  color: range === r.key ? "white" : "#6b75a3",
                  background: range === r.key ? "#0b1020" : "transparent",
                  borderRadius: 99,
                  border: 0,
                  fontFamily: "inherit",
                }}
              >
                {r.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <div style={{ marginTop: 16 }}>{total > 0 ? <BarChart values={series} days={days} /> : <ZeroState />}</div>
    </div>
  );
}

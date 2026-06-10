"use client";

import { memo, useMemo, useState } from "react";
import CollapsibleSidebar from "../components/CollapsibleSidebar";
import { useSidebarStore } from "@/store/sidebarStore";
import { DashboardTopBar } from "../user-admin/components/DashboardTopBar";
import { CommandPalette } from "../components/CommandPalette";

// ── Data ──────────────────────────────────────────────────────────────────────
function generateSeries(days: number, base: number, variance: number): number[] {
  const arr: number[] = [];
  for (let i = 0; i < days; i++) {
    const noise = (Math.sin(i * 0.6) + Math.cos(i * 0.3)) * variance;
    const v = Math.max(0, base + noise + Math.sin(i * 0.13) * variance * 0.4);
    arr.push(Math.round(v));
  }
  return arr;
}

const RANGE_DATA = {
  "7":   { clicks: generateSeries(7, 72, 25),   visitors: generateSeries(7, 48, 16),   totalClicks: 504,   totalVisitors: 336,  ctr: 71.2, clicksDelta: 18.6, visitorsDelta: 12.3, ctrDelta:  1.2 },
  "30":  { clicks: generateSeries(30, 70, 30),  visitors: generateSeries(30, 47, 20),  totalClicks: 2096,  totalVisitors: 1418, ctr: 68.2, clicksDelta: 12.4, visitorsDelta:  8.1, ctrDelta: -1.8 },
  "90":  { clicks: generateSeries(90, 65, 35),  visitors: generateSeries(90, 44, 22),  totalClicks: 5832,  totalVisitors: 3941, ctr: 67.6, clicksDelta: 22.7, visitorsDelta: 14.5, ctrDelta: -0.4 },
  "all": { clicks: generateSeries(180, 60, 40), visitors: generateSeries(180, 40, 25), totalClicks: 10847, totalVisitors: 7204, ctr: 66.4, clicksDelta: 38.9, visitorsDelta: 28.3, ctrDelta:  4.1 },
} as const;

type RangeKey = keyof typeof RANGE_DATA;

const RANGE_LABEL: Record<RangeKey, string> = {
  "7": "Last 7 days",
  "30": "Last 30 days",
  "90": "Last 90 days",
  all: "All time",
};

const TOP_LINKS = [
  { title: "Official Website",      url: "johndoe.design",               clicks: 1240, share: 59, trend: [12,16,14,22,20,28,26,32,30,38], type: "globe" },
  { title: "Latest Portfolio Drop", url: "behance.net/johndoe/vibe-check", clicks: 856, share: 41, trend: [8,12,10,14,18,16,22,24,28,32],  type: "behance" },
];

const SOURCES = [
  { name: "Direct",      clicks: 728, pct: 35, colorClass: "s1" },
  { name: "Instagram",   clicks: 524, pct: 25, colorClass: "s2" },
  { name: "X / Twitter", clicks: 314, pct: 15, colorClass: "s3" },
  { name: "WhatsApp",    clicks: 251, pct: 12, colorClass: "s4" },
  { name: "LinkedIn",    clicks: 167, pct:  8, colorClass: "s5" },
  { name: "Other",       clicks: 112, pct:  5, colorClass: "s6" },
];

const SOURCE_COLORS: Record<string, string> = {
  s1: "linear-gradient(90deg, #3b46e0, #6873ff)",
  s2: "linear-gradient(90deg, #c13584, #f56040)",
  s3: "linear-gradient(90deg, #1d9bf0, #0b1020)",
  s4: "linear-gradient(90deg, #25d366, #4cc764)",
  s5: "linear-gradient(90deg, #0a66c2, #4a90d9)",
  s6: "linear-gradient(90deg, #a8aecb, #6b75a3)",
};

const DEVICES = [
  { name: "Mobile",  pct: 64, clicks: 1341, color: "#3b46e0" },
  { name: "Desktop", pct: 28, clicks:  587, color: "#6873ff" },
  { name: "Tablet",  pct:  8, clicks:  168, color: "#c8cefd" },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
function fmt(n: number) {
  return n.toLocaleString("en-US");
}

function smoothPath(pts: { x: number; y: number }[]): string {
  if (pts.length < 2) return "";
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
  }
  return d;
}

// ── Sub-components ────────────────────────────────────────────────────────────
const Delta = memo(function Delta({ val, suffix = "%" }: { val: number; suffix?: string }) {
  const up = val >= 0;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 3,
        padding: "2px 7px",
        borderRadius: 99,
        fontSize: 11,
        fontWeight: 600,
        background: up ? "#e8f6ee" : "#fef2f4",
        color: up ? "#16a34a" : "#e11d48",
      }}
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="10" height="10">
        {up
          ? <path strokeLinecap="round" strokeLinejoin="round" d="M7 17l5-5 4 4 6-7"/>
          : <path strokeLinecap="round" strokeLinejoin="round" d="M17 7l-5 5-4-4-6 7"/>}
      </svg>
      {up ? "+" : ""}{val.toFixed(1)}{suffix}
    </span>
  );
});

const PanelTitle = memo(function PanelTitle({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontFamily: "var(--font-instrument-serif), Georgia, serif",
        fontStyle: "italic",
        fontSize: 22,
        color: "#0b1020",
        letterSpacing: "-0.01em",
      }}
    >
      {children}
    </div>
  );
});

const Sparkline = memo(function Sparkline({ values }: { values: number[] }) {
  const W = 60, H = 22;
  const { line, area } = useMemo(() => {
    const max = Math.max(...values, 1);
    const stepX = W / (values.length - 1);
    const pts = values.map((v, i) => ({
      x: i * stepX,
      y: H - (v / max) * (H - 3) - 1.5,
    }));
    const l = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");
    return { line: l, area: `${l} L ${W} ${H} L 0 ${H} Z` };
  }, [values]);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" width={W} height={H}>
      <path d={area} fill="#f1f3ff" opacity={0.7}/>
      <path d={line} fill="none" stroke="#6873ff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
});

const LinkIcon = memo(function LinkIcon({ type }: { type: string }) {
  if (type === "behance") return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M6.94 4.5c.7 0 1.34.06 1.92.19.58.13 1.07.33 1.49.61.4.28.73.65.95 1.12.23.47.34 1.05.34 1.73 0 .74-.17 1.36-.5 1.86-.34.49-.84.9-1.5 1.22.9.26 1.57.72 2.02 1.37.44.66.66 1.45.66 2.36 0 .75-.13 1.39-.4 1.93-.28.55-.67 1-1.16 1.35-.49.35-1.05.6-1.7.76-.62.16-1.3.24-2 .24H0V4.5h6.94z"/>
    </svg>
  );
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10"/>
      <path strokeLinecap="round" d="M2 12h20M12 2a15.3 15.3 0 010 20"/>
    </svg>
  );
});

const SourceIcon = memo(function SourceIcon({ name }: { name: string }) {
  if (name === "Instagram") return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="2" width="20" height="20" rx="5"/>
      <circle cx="12" cy="12" r="4"/>
      <circle cx="17.5" cy="6.5" r=".5" fill="currentColor"/>
    </svg>
  );
  if (name === "X / Twitter") return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  );
  if (name === "WhatsApp") return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.5 14.4c-.3-.15-1.77-.87-2.04-.97-.28-.1-.48-.15-.67.15-.2.3-.78.97-.95 1.17-.17.2-.35.22-.65.07-.3-.15-1.27-.47-2.42-1.5-.9-.8-1.5-1.78-1.67-2.08-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51l-.57-.01c-.2 0-.52.08-.8.37-.27.3-1.04 1.02-1.04 2.49 0 1.47 1.07 2.89 1.22 3.09.15.2 2.1 3.21 5.08 4.5.71.31 1.26.49 1.69.63.71.22 1.36.19 1.87.12.57-.09 1.77-.72 2.02-1.42.25-.7.25-1.3.17-1.42-.07-.13-.27-.2-.57-.35z"/>
    </svg>
  );
  if (name === "LinkedIn") return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
    </svg>
  );
  if (name === "Other") return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
      <circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/>
    </svg>
  );
  // Direct
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10"/>
      <path strokeLinecap="round" d="M2 12h20M12 2a15.3 15.3 0 010 20"/>
    </svg>
  );
});

const DonutChart = memo(function DonutChart() {
  const cx = 50, cy = 50, r = 36, sw = 14;
  const C = 2 * Math.PI * r;
  const segments = useMemo(() =>
    DEVICES.reduce<{ nodes: React.ReactNode[]; offset: number }>(
      (acc, d, i) => {
        const dash = (d.pct / 100) * C;
        acc.nodes.push(
          <circle
            key={i}
            cx={cx} cy={cy} r={r}
            fill="none"
            stroke={d.color}
            strokeWidth={sw}
            strokeDasharray={`${dash} ${C - dash}`}
            strokeDashoffset={-acc.offset}
            transform={`rotate(-90 ${cx} ${cy})`}
          />
        );
        return { nodes: acc.nodes, offset: acc.offset + dash };
      },
      { nodes: [], offset: 0 }
    ).nodes,
  [C]);

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
      <svg viewBox="0 0 100 100" width={160} height={160} style={{ flexShrink: 0 }}>
        {segments}
        <text
          x={cx} y={cy - 6}
          textAnchor="middle"
          dominantBaseline="middle"
          style={{
            fontFamily: "var(--font-instrument-serif), Georgia, serif",
            fontStyle: "italic",
            fontSize: 22,
            fill: "#0b1020",
          }}
        >
          {DEVICES[0].pct}%
        </text>
        <text
          x={cx} y={cy + 10}
          textAnchor="middle"
          style={{ fontSize: 8, fill: "#a8aecb", textTransform: "uppercase", letterSpacing: "0.1em" }}
        >
          Mobile
        </text>
      </svg>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 12 }}>
        {DEVICES.map((d) => (
          <div key={d.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 12, height: 12, borderRadius: 3, background: d.color, flexShrink: 0 }}/>
              <div>
                <div style={{ fontSize: 13, color: "#0b1020", fontWeight: 500 }}>{d.name}</div>
                <div style={{ fontSize: 10.5, color: "#6b75a3", fontFamily: "'Geist Mono', monospace", marginTop: 1 }}>{fmt(d.clicks)} clicks</div>
              </div>
            </div>
            <div style={{ fontSize: 13, color: "#0b1020", fontWeight: 500, fontFamily: "'Geist Mono', monospace" }}>{d.pct}%</div>
          </div>
        ))}
      </div>
    </div>
  );
});

// ── Line chart ────────────────────────────────────────────────────────────────
const LineChart = memo(function LineChart({ range }: { range: RangeKey }) {
  const data = RANGE_DATA[range];
  const { clicks, visitors } = data;
  const W = 800, H = 280;
  const padL = 42, padR = 16, padT = 16, padB = 32;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;
  const yTicks = 4;

  const { clickPath, areaPath, visitorPath, stepX, maxY } = useMemo(() => {
    const max = Math.max(...clicks, ...visitors) * 1.18;
    const sX = innerW / (clicks.length - 1);
    const toPt = (val: number, i: number) => ({
      x: padL + i * sX,
      y: padT + innerH - (val / max) * innerH,
    });
    const cPts = clicks.map(toPt);
    const vPts = visitors.map(toPt);
    const cp = smoothPath(cPts);
    return {
      clickPath: cp,
      areaPath: `${cp} L ${cPts[cPts.length - 1].x} ${padT + innerH} L ${cPts[0].x} ${padT + innerH} Z`,
      visitorPath: smoothPath(vPts),
      stepX: sX,
      maxY: max,
    };
  }, [clicks, visitors, innerW, innerH, padL, padT]);

  const today = new Date();

  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ width: "100%", height: 280 }}>
      <defs>
        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3b46e0" stopOpacity="0.22"/>
          <stop offset="100%" stopColor="#3b46e0" stopOpacity="0"/>
        </linearGradient>
      </defs>

      {/* Grid lines */}
      {Array.from({ length: yTicks + 1 }, (_, i) => {
        const y = padT + (innerH / yTicks) * i;
        const val = Math.round(maxY - (maxY / yTicks) * i);
        return (
          <g key={i}>
            <line x1={padL} y1={y} x2={W - padR} y2={y} stroke="#eef0f7" strokeWidth="1" strokeDasharray={i === yTicks ? undefined : "2,4"}/>
            <text x={padL - 8} y={y + 3.5} textAnchor="end" fontSize="10" fill="#a8aecb" fontFamily="'Geist Mono', monospace">{val}</text>
          </g>
        );
      })}

      {/* X-axis labels */}
      {[0, 0.25, 0.5, 0.75, 1].map((frac, i) => {
        const idx = Math.round((clicks.length - 1) * frac);
        const x = padL + idx * stepX;
        const d = new Date(today);
        d.setDate(today.getDate() - (clicks.length - 1 - idx));
        const label = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
        return <text key={i} x={x} y={H - padB + 18} textAnchor="middle" fontSize="10" fill="#a8aecb" fontFamily="'Geist Mono', monospace">{label}</text>;
      })}

      {/* Area + lines */}
      <path d={areaPath} fill="url(#areaGrad)"/>
      <path d={visitorPath} fill="none" stroke="#c8cefd" strokeWidth="2" strokeDasharray="4,3" strokeLinecap="round" strokeLinejoin="round"/>
      <path d={clickPath} fill="none" stroke="#3b46e0" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
});

// ── Main component ────────────────────────────────────────────────────────────
export default function UserAnalyticsClient() {
  const isCollapsed = useSidebarStore((s) => s.isCollapsed);
  const [range, setRange] = useState<RangeKey>("30");
  const [showPalette, setShowPalette] = useState(false);

  const data = RANGE_DATA[range];

  return (
    <>
    <div className="bg-[#f7f8fc] text-on-surface min-h-screen antialiased font-sans flex overflow-hidden">
      <CollapsibleSidebar>
        <main
          className={`flex-1 transition-all duration-500 ease-in-out ${
            isCollapsed ? "lg:ml-[80px]" : "lg:ml-[256px]"
          } ml-0 overflow-y-auto bg-[#f7f8fc] h-screen`}
        >
          <div className="flex-1 min-w-0 px-4 pt-[22px] pb-24 lg:pb-14 sm:px-6 lg:px-8">
            <DashboardTopBar
              searchPlaceholder="Search metrics, date ranges, actions…"
              onSearchClick={() => setShowPalette(true)}
            />

            {/* Page head */}
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-7">
              <div>
                <div style={{ fontSize: 12, color: "#6b75a3", marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
                  <span>Workspace</span>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="12" height="12">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 18l6-6-6-6"/>
                  </svg>
                  <span style={{ color: "#0b1020", fontWeight: 500 }}>Analytics</span>
                </div>
                <h1
                  className="text-[32px] sm:text-[42px]"
                  style={{
                    fontFamily: "var(--font-instrument-serif), Georgia, serif",
                    fontStyle: "italic",
                    lineHeight: 1,
                    letterSpacing: "-0.02em",
                    color: "#0b1020",
                  }}
                >
                  How&apos;s it{" "}
                  <em style={{ color: "#3b46e0", fontStyle: "italic" }}>going</em>?
                </h1>
                <p style={{ fontSize: 13.5, color: "#6b75a3", marginTop: 6 }}>
                  A snapshot of your linkhub&apos;s performance.
                </p>
              </div>

              <div className="flex gap-2 items-center flex-wrap">
                {/* Range pills */}
                <div
                  style={{
                    display: "inline-flex",
                    background: "white",
                    border: "1px solid #eef0f7",
                    borderRadius: 99,
                    padding: 3,
                    boxShadow: "0 1px 2px rgba(15,23,42,0.04)",
                  }}
                >
                  {(["7", "30", "90", "all"] as RangeKey[]).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRange(r)}
                      style={{
                        padding: "6px 14px",
                        fontSize: 12.5,
                        fontWeight: 500,
                        color: range === r ? "white" : "#6b75a3",
                        background: range === r ? "#0b1020" : "transparent",
                        borderRadius: 99,
                        border: 0,
                        cursor: "pointer",
                        fontFamily: "inherit",
                        transition: "all 0.15s ease",
                      }}
                    >
                      {r === "all" ? "All" : `${r}D`}
                    </button>
                  ))}
                </div>

                {/* Export */}
                <button
                  type="button"
                  style={{
                    background: "white",
                    border: "1px solid #eef0f7",
                    boxShadow: "0 1px 2px rgba(15,23,42,0.04)",
                    padding: "9px 14px 9px 12px",
                    borderRadius: 99,
                    fontSize: 12.5,
                    fontWeight: 500,
                    color: "#1a2244",
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    fontFamily: "inherit",
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#eef0f7"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "white"; }}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/>
                  </svg>
                  Export CSV
                </button>
              </div>
            </div>

            {/* KPI row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mb-6">
              {/* Total clicks */}
              <div style={kpiCard}>
                <div style={kpiLabel}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="12" height="12">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/>
                  </svg>
                  Total clicks
                </div>
                <div style={kpiValue}>{fmt(data.totalClicks)}</div>
                <div style={kpiMeta}>
                  <Delta val={data.clicksDelta}/>
                  <span>vs prev {RANGE_LABEL[range].toLowerCase()}</span>
                </div>
              </div>

              {/* Unique visitors */}
              <div style={kpiCard}>
                <div style={kpiLabel}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="12" height="12">
                    <circle cx="9" cy="7" r="4"/><path strokeLinecap="round" strokeLinejoin="round" d="M3 21v-2a4 4 0 014-4h4a4 4 0 014 4v2M17 11l2 2 4-4"/>
                  </svg>
                  Unique visitors
                </div>
                <div style={kpiValue}>{fmt(data.totalVisitors)}</div>
                <div style={kpiMeta}>
                  <Delta val={data.visitorsDelta}/>
                  <span>vs prev {RANGE_LABEL[range].toLowerCase()}</span>
                </div>
              </div>

              {/* CTR */}
              <div style={kpiCard}>
                <div style={kpiLabel}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="12" height="12">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                  </svg>
                  Click-through rate
                </div>
                <div style={kpiValue}>{data.ctr}%</div>
                <div style={kpiMeta}>
                  <Delta val={data.ctrDelta}/>
                  <span>vs prev {RANGE_LABEL[range].toLowerCase()}</span>
                </div>
              </div>

              {/* Top link */}
              <div style={kpiCard}>
                <div style={kpiLabel}>
                  <svg viewBox="0 0 24 24" fill="currentColor" width="12" height="12">
                    <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 16.8 5.8 21.3l2.4-7.4L2 9.4h7.6z"/>
                  </svg>
                  Top link
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 10 }}>
                  <div
                    style={{
                      width: 36, height: 36, borderRadius: 10,
                      background: "linear-gradient(135deg, #3b46e0, #7a85ff)",
                      color: "white", display: "flex", alignItems: "center", justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                      <circle cx="12" cy="12" r="10"/>
                      <path strokeLinecap="round" d="M2 12h20M12 2a15.3 15.3 0 010 20"/>
                    </svg>
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "#0b1020", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>Official Website</div>
                    <div style={{ fontSize: 11.5, color: "#6b75a3", marginTop: 2 }}>1,240 clicks · 59% of total</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Chart card */}
            <div style={panelCard}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 18 }}>
                <div>
                  <PanelTitle>Clicks over time</PanelTitle>
                  <div style={{ fontSize: 12, color: "#6b75a3", marginTop: 3 }}>{RANGE_LABEL[range]}</div>
                </div>
                <div style={{ display: "flex", gap: 14, fontSize: 11.5, color: "#6b75a3" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#3b46e0", display: "inline-block" }}/>
                    Clicks
                  </span>
                  <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#c8cefd", display: "inline-block" }}/>
                    Visitors
                  </span>
                </div>
              </div>
              <LineChart range={range}/>
            </div>

            {/* Top links + Sources */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5 mb-3.5">

              {/* Top links */}
              <div style={panelCard}>
                <div style={{ marginBottom: 18 }}>
                  <PanelTitle>Top links</PanelTitle>
                  <div style={{ fontSize: 11.5, color: "#6b75a3", marginTop: 2 }}>Most clicks in the selected period</div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  {TOP_LINKS.map((link, i) => (
                    <div
                      key={link.title}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "22px 32px 1fr 60px 80px",
                        gap: 12,
                        alignItems: "center",
                        padding: "10px 8px",
                        borderRadius: 8,
                        transition: "background 0.15s",
                      }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = "#f7f8fc"; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = "transparent"; }}
                    >
                      <div style={{ fontFamily: "'Geist Mono', monospace", fontSize: 11, color: "#6b75a3", textAlign: "center" }}>
                        {String(i + 1).padStart(2, "0")}
                      </div>
                      <div
                        style={{
                          width: 32, height: 32, borderRadius: 8,
                          background: "linear-gradient(135deg, #3b46e0, #6873ff)",
                          color: "white",
                          display: "flex", alignItems: "center", justifyContent: "center",
                        }}
                      >
                        <LinkIcon type={link.type}/>
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: 13.5, fontWeight: 500, color: "#0b1020", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{link.title}</div>
                        <div style={{ fontSize: 11, color: "#6b75a3", fontFamily: "'Geist Mono', monospace", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginTop: 1 }}>{link.url}</div>
                      </div>
                      <Sparkline values={link.trend}/>
                      <div style={{ textAlign: "right", fontFamily: "'Geist Mono', monospace", fontSize: 13, color: "#0b1020", fontWeight: 500 }}>
                        {fmt(link.clicks)}
                        <div style={{ fontSize: 10, color: "#6b75a3", marginTop: 1, fontWeight: 400 }}>{link.share}%</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Traffic sources */}
              <div style={panelCard}>
                <div style={{ marginBottom: 18 }}>
                  <PanelTitle>Traffic sources</PanelTitle>
                  <div style={{ fontSize: 11.5, color: "#6b75a3", marginTop: 2 }}>Where your visitors are coming from</div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {SOURCES.map((s) => (
                    <div key={s.name}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#0b1020", fontWeight: 500 }}>
                          <span style={{ width: 22, height: 22, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", color: "#6b75a3" }}>
                            <SourceIcon name={s.name}/>
                          </span>
                          {s.name}
                        </div>
                        <div style={{ fontFamily: "'Geist Mono', monospace", fontSize: 11.5, color: "#6b75a3" }}>
                          <b style={{ color: "#0b1020", fontWeight: 500 }}>{fmt(s.clicks)}</b> · {s.pct}%
                        </div>
                      </div>
                      <div style={{ height: 6, background: "#eef0f7", borderRadius: 99, overflow: "hidden" }}>
                        <div
                          style={{
                            height: "100%",
                            width: `${s.pct}%`,
                            background: SOURCE_COLORS[s.colorClass],
                            borderRadius: 99,
                            transition: "width 0.6s cubic-bezier(0.16,1,0.3,1)",
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Devices + Geography */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">

              {/* Devices donut */}
              <div style={panelCard}>
                <div style={{ marginBottom: 18 }}>
                  <PanelTitle>Devices</PanelTitle>
                  <div style={{ fontSize: 11.5, color: "#6b75a3", marginTop: 2 }}>How your audience visits</div>
                </div>
                <DonutChart/>
              </div>

              {/* Geography — Pro locked */}
              <div style={{ ...panelCard, position: "relative", overflow: "hidden" }}>
                {/* Blurred placeholder */}
                <div style={{ filter: "blur(6px)", opacity: 0.45, pointerEvents: "none", userSelect: "none" }}>
                  <PanelTitle>Geography</PanelTitle>
                  <div style={{ fontSize: 11.5, color: "#6b75a3", marginTop: 2, marginBottom: 18 }}>Top countries by clicks</div>
                  {[["🇬🇭 Ghana", "682", 32], ["🇳🇬 Nigeria", "421", 20], ["🇺🇸 United States", "318", 15], ["🇬🇧 United Kingdom", "241", 11]].map(([name, count, pct]) => (
                    <div key={String(name)} style={{ marginBottom: 14 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                        <span style={{ fontSize: 13, color: "#0b1020", fontWeight: 500 }}>{name}</span>
                        <span style={{ fontSize: 11.5, color: "#6b75a3" }}><b style={{ color: "#0b1020" }}>{count}</b> · {pct}%</span>
                      </div>
                      <div style={{ height: 6, background: "#eef0f7", borderRadius: 99, overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${pct}%`, background: "linear-gradient(90deg, #3b46e0, #6873ff)", borderRadius: 99 }}/>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Lock overlay */}
                <div
                  style={{
                    position: "absolute", inset: 0,
                    display: "grid", placeItems: "center",
                    background: "linear-gradient(180deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.85) 50%, rgba(255,255,255,0.95) 100%)",
                    backdropFilter: "blur(2px)",
                  }}
                >
                  <div style={{ textAlign: "center", padding: "16px 22px 20px", maxWidth: 320 }}>
                    <span
                      style={{
                        display: "inline-flex", alignItems: "center", gap: 5,
                        background: "#2c1810", color: "#f5d77f",
                        padding: "4px 10px", borderRadius: 99,
                        fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em",
                        marginBottom: 10,
                      }}
                    >
                      <svg viewBox="0 0 24 24" fill="currentColor" width="10" height="10">
                        <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 16.8 5.8 21.3l2.4-7.4L2 9.4h7.6z"/>
                      </svg>
                      PRO
                    </span>
                    <div
                      style={{
                        fontFamily: "var(--font-instrument-serif), Georgia, serif",
                        fontStyle: "italic",
                        fontSize: 22,
                        color: "#0b1020",
                        marginBottom: 6,
                        lineHeight: 1.15,
                      }}
                    >
                      See where your audience is
                    </div>
                    <p style={{ fontSize: 12.5, color: "#6b75a3", lineHeight: 1.5, marginBottom: 14 }}>
                      Unlock geography, heatmaps, custom date ranges, and per-link UTM tracking.
                    </p>
                    <button
                      type="button"
                      style={{
                        background: "linear-gradient(180deg, #3b46e0, #2a37c0)",
                        color: "white", border: 0,
                        padding: "9px 18px", borderRadius: 99,
                        fontSize: 12.5, fontWeight: 600, fontFamily: "inherit",
                        cursor: "pointer",
                        display: "inline-flex", alignItems: "center", gap: 5,
                        boxShadow: "0 4px 14px -4px rgba(59,70,224,0.5)",
                      }}
                    >
                      Upgrade to Pro
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="13" height="13">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M13 5l7 7-7 7"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </CollapsibleSidebar>
    </div>

    <CommandPalette
      open={showPalette}
      onClose={() => setShowPalette(false)}
      variant="analytics"
      searchPlaceholder="Search metrics, date ranges, actions…"
      onSelectRange={(r) => setRange(r)}
      onExport={() => { /* export CSV */ }}
    />
    </>
  );
}

// ── Shared card styles ────────────────────────────────────────────────────────
const panelCard: React.CSSProperties = {
  background: "white",
  border: "1px solid #eef0f7",
  borderRadius: 18,
  padding: "22px 22px 18px",
  boxShadow: "0 1px 2px rgba(15,23,42,0.04)",
  marginBottom: 0,
};

const kpiCard: React.CSSProperties = {
  background: "white",
  border: "1px solid #eef0f7",
  borderRadius: 18,
  padding: "18px 18px 16px",
  boxShadow: "0 1px 2px rgba(15,23,42,0.04)",
};

const kpiLabel: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 600,
  color: "#6b75a3",
  textTransform: "uppercase",
  letterSpacing: "0.1em",
  display: "inline-flex",
  alignItems: "center",
  gap: 5,
};

const kpiValue: React.CSSProperties = {
  fontFamily: "var(--font-instrument-serif), Georgia, serif",
  fontStyle: "italic",
  fontSize: 38,
  color: "#0b1020",
  lineHeight: 1.05,
  marginTop: 8,
  letterSpacing: "-0.02em",
};

const kpiMeta: React.CSSProperties = {
  marginTop: 8,
  fontSize: 12,
  color: "#6b75a3",
  display: "flex",
  alignItems: "center",
  gap: 6,
};

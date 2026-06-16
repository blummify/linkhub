"use client";

import { useRef, useEffect, useState } from "react";
import Link from "next/link";
import ReactCountryFlag from "react-country-flag";

interface StatCardData {
  label: string;
  value?: string;
  change?: string;
  changeType?: "green";
  sparkData?: number[];
  countryCode?: string;
  cityName?: string;
  trafficPercent?: string;
}

interface AnalyticsCardsProps {
  cards?: StatCardData[];
}

const DEFAULT_CARDS: StatCardData[] = [
  {
    label: "TOTAL CLICKS",
    value: "2,096",
    change: "+12.4%",
    changeType: "green",
    sparkData: [10, 12, 9, 14, 11, 16, 15, 18, 20, 19],
  },
  {
    label: "PROFILE VIEWS",
    value: "854",
    change: "+8.1%",
    changeType: "green",
    sparkData: [8, 10, 9, 11, 10, 12, 13, 11, 14, 15],
  },
  {
    label: "CTR",
    value: "63.2%",
    change: "+3.0%",
    changeType: "green",
    sparkData: [12, 11, 13, 12, 14, 13, 14, 15, 14, 16],
  },
  {
    label: "TOP REGION",
    countryCode: "GH",
    cityName: "Accra",
    trafficPercent: "42% of traffic",
  },
];

// ── Sparkline: draws itself left-to-right on mount ────────────────────────────
function Sparkline({ values }: { values: number[] }) {
  const pathRef = useRef<SVGPathElement>(null);
  const W = 58, H = 22, pad = 1;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const d = values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * (W - pad * 2) + pad;
      const y = H - pad - ((v - min) / range) * (H - pad * 2);
      return `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");

  useEffect(() => {
    const el = pathRef.current;
    if (!el || typeof el.getTotalLength !== "function") return;
    const len = el.getTotalLength();
    el.style.strokeDasharray = `${len}`;
    el.style.strokeDashoffset = `${len}`;
    // force reflow so the browser registers the initial state
    el.getBoundingClientRect();
    el.style.transition = "stroke-dashoffset 1.4s cubic-bezier(0.4, 0, 0.2, 1) 0.35s";
    el.style.strokeDashoffset = "0";
  }, []);

  return (
    <svg
      width={W}
      height={H}
      viewBox={`0 0 ${W} ${H}`}
      style={{ position: "absolute", bottom: 12, right: 12, opacity: 0.85 }}
      aria-hidden
    >
      <path
        ref={pathRef}
        d={d}
        fill="none"
        stroke="#16a34a"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ── Delta badge: slides up and counts to target value ────────────────────────
function DeltaBadge({ change }: { change: string }) {
  const match = change.match(/(\d+\.?\d*)/);
  const target = match ? parseFloat(match[0]) : 0;
  const prefix = change.startsWith("+") ? "+" : change.startsWith("-") ? "-" : "";
  const hasPct = change.includes("%");

  const [count, setCount] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 150);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!visible) return;
    const duration = 1000;
    const startTime = performance.now();

    function tick(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(target * eased);
      if (progress < 1) requestAnimationFrame(tick);
    }

    const raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [visible, target]);

  return (
    <div
      className="inline-flex items-center gap-1"
      style={{
        marginTop: 4,
        fontSize: 11.5,
        fontWeight: 500,
        color: "#16a34a",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(5px)",
        transition: "opacity 0.45s ease 0.15s, transform 0.45s cubic-bezier(0.16,1,0.3,1) 0.15s",
      }}
    >
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 17l5-5 4 4 6-7"/>
      </svg>
      {prefix}{count.toFixed(1)}{hasPct ? "%" : ""}
    </div>
  );
}

// ── Card grid ─────────────────────────────────────────────────────────────────
export function AnalyticsCards({ cards = DEFAULT_CARDS }: AnalyticsCardsProps) {
  // headline metrics are always the first two cards (Total Clicks, Profile Views)
  const glanceCards = cards.slice(0, 2).filter((c) => !c.countryCode);

  return (
    <>
      {/* ── Mobile glance strip (< lg) — 2 headline cards + analytics link ── */}
      <div className="lg:hidden" style={{ marginBottom: 16 }}>
        <div className="grid grid-cols-2 gap-3" style={{ marginBottom: 8 }}>
          {glanceCards.map((card, idx) => (
            <div
              key={card.label}
              style={{
                background: "white",
                border: "1px solid #eef0f7",
                borderRadius: 14,
                padding: "12px 14px",
                animation: "acCardUp 0.55s cubic-bezier(0.16,1,0.3,1) both",
                animationDelay: `${idx * 70}ms`,
              }}
            >
              <p
                className="uppercase"
                style={{ fontSize: 10.5, fontWeight: 500, color: "#6b75a3", letterSpacing: "0.07em", marginBottom: 6 }}
              >
                {card.label}
              </p>
              <p
                className="leading-none"
                style={{
                  fontSize: 22,
                  fontWeight: 400,
                  fontStyle: "italic",
                  fontFamily: "var(--font-instrument-serif), Georgia, serif",
                  color: "#0b1020",
                  letterSpacing: "-0.02em",
                }}
              >
                {card.value}
              </p>
              {card.change && <DeltaBadge change={card.change} />}
            </div>
          ))}
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <Link
            href="/user-analytics"
            style={{
              fontSize: 12.5,
              fontWeight: 500,
              color: "#3b46e0",
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            View analytics
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>

      {/* ── Desktop full 4-card grid (≥ lg) ── */}
      <div className="hidden lg:grid grid-cols-4 gap-3" style={{ marginBottom: 24 }}>
        {cards.map((card, idx) => {
          const isTopRegion = !!card.countryCode;

          return (
            <div
              key={card.label}
              className="relative overflow-hidden"
              style={{
                background: "white",
                border: "1px solid #eef0f7",
                borderRadius: 16,
                padding: "14px 16px",
                animation: "acCardUp 0.55s cubic-bezier(0.16,1,0.3,1) both",
                animationDelay: `${idx * 70}ms`,
              }}
            >
              <p
                className="uppercase"
                style={{ fontSize: 11.5, fontWeight: 500, color: "#6b75a3", letterSpacing: "0.07em", marginBottom: 8 }}
              >
                {card.label}
              </p>

              {isTopRegion ? (
                <>
                  <div className="flex items-center gap-2">
                    {card.countryCode && (
                      <ReactCountryFlag
                        countryCode={card.countryCode}
                        svg
                        style={{ width: "22px", height: "16px", borderRadius: "3px" }}
                        title={card.countryCode}
                      />
                    )}
                    <span
                      className="leading-none"
                      style={{
                        fontSize: 22,
                        fontWeight: 400,
                        fontStyle: "italic",
                        fontFamily: "var(--font-instrument-serif), Georgia, serif",
                        color: "#0b1020",
                        letterSpacing: "-0.02em",
                      }}
                    >
                      {card.cityName ?? card.value}
                    </span>
                  </div>
                  {card.trafficPercent && (
                    <p style={{ fontSize: 11.5, color: "#6b75a3", marginTop: 4 }}>
                      {card.trafficPercent}
                    </p>
                  )}
                </>
              ) : (
                <>
                  <p
                    className="leading-none"
                    style={{
                      fontSize: 26,
                      fontWeight: 400,
                      fontStyle: "italic",
                      fontFamily: "var(--font-instrument-serif), Georgia, serif",
                      color: "#0b1020",
                      letterSpacing: "-0.02em",
                    }}
                  >
                    {card.value}
                  </p>
                  {card.change && <DeltaBadge change={card.change} />}
                  {card.sparkData && card.changeType && (
                    <Sparkline values={card.sparkData} />
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}

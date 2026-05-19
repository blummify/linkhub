"use client";

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

function Sparkline({ values, color }: { values: number[]; color: "green" }) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const W = 58;
  const H = 22;
  const pad = 1;

  const points = values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * (W - pad * 2) + pad;
      const y = H - pad - ((v - min) / range) * (H - pad * 2);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <svg
      width={W}
      height={H}
      viewBox={`0 0 ${W} ${H}`}
      style={{ position: "absolute", bottom: 12, right: 12, opacity: 0.85 }}
      aria-hidden
    >
      <polyline
        points={points}
        fill="none"
        stroke="#16a34a"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function AnalyticsCards({ cards = DEFAULT_CARDS }: AnalyticsCardsProps) {
  return (
    <div className="grid grid-cols-1 min-[480px]:grid-cols-2 md:grid-cols-4 gap-3" style={{ marginBottom: 24 }}>
      {cards.map((card) => {
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
                {card.change && (
                  <div
                    className="inline-flex items-center gap-1"
                    style={{
                      marginTop: 4,
                      fontSize: 11.5,
                      fontWeight: 500,
                      color: "#16a34a",
                    }}
                  >
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M7 17l5-5 4 4 6-7"/>
                    </svg>
                    {card.change}
                  </div>
                )}
                {card.sparkData && card.changeType && (
                  <Sparkline values={card.sparkData} color={card.changeType} />
                )}
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}

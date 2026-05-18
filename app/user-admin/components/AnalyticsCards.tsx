"use client";

import ReactCountryFlag from "react-country-flag";

interface StatCardData {
  label: string;
  value?: string;
  change?: string;
  changeType?: "green" | "blue";
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
    change: "~ +12.4%",
    changeType: "green",
    sparkData: [10, 12, 9, 14, 11, 16, 15, 18, 20, 19],
  },
  {
    label: "PROFILE VIEWS",
    value: "854",
    change: "~ +8.1%",
    changeType: "green",
    sparkData: [8, 10, 9, 11, 10, 12, 13, 11, 14, 15],
  },
  {
    label: "CTR",
    value: "63.2%",
    change: "~ +3.0%",
    changeType: "blue",
    sparkData: [12, 11, 13, 12, 14, 13, 14, 15, 14, 16],
  },
  {
    label: "TOP REGION",
    countryCode: "GH",
    cityName: "GH Accra",
    trafficPercent: "42% of traffic",
  },
];

function Sparkline({ values, color }: { values: number[]; color: "green" | "blue" }) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const W = 80;
  const H = 30;
  const pad = 2;

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
      className="absolute bottom-4 right-4 opacity-70"
      aria-hidden
    >
      <polyline
        points={points}
        fill="none"
        stroke={color === "green" ? "#16a34a" : "#2563eb"}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function AnalyticsCards({ cards = DEFAULT_CARDS }: AnalyticsCardsProps) {
  return (
    <div className="grid grid-cols-1 min-[480px]:grid-cols-2 md:grid-cols-4 gap-3 mb-6">
      {cards.map((card) => {
        const isTopRegion = !!card.countryCode;

        return (
          <div
            key={card.label}
            className="relative overflow-hidden bg-white rounded-xl p-5 min-h-[90px]"
            style={{ border: "0.5px solid #e5e5f0" }}
          >
            <p className="text-[11px] uppercase tracking-[0.06em] text-on-surface-variant/60 mb-2">
              {card.label}
            </p>

            {isTopRegion ? (
              <>
                <div className="flex items-center gap-2">
                  {card.countryCode && (
                    <ReactCountryFlag
                      countryCode={card.countryCode}
                      svg
                      style={{ width: "24px", height: "18px", borderRadius: "3px" }}
                      title={card.countryCode}
                    />
                  )}
                  <span
                    className="text-[24px] font-semibold text-on-surface leading-none"
                    style={{ fontStyle: "italic", fontFamily: "Georgia, serif" }}
                  >
                    {card.cityName ?? card.value}
                  </span>
                </div>
                {card.trafficPercent && (
                  <p className="text-[12px] text-on-surface-variant/60 mt-1.5">
                    {card.trafficPercent}
                  </p>
                )}
              </>
            ) : (
              <>
                <p className="text-[28px] font-semibold text-on-surface leading-none">
                  {card.value}
                </p>
                {card.change && (
                  <span
                    className={`inline-flex items-center gap-1 mt-2 text-[12px] font-medium rounded-full px-2 py-0.5 ${
                      card.changeType === "blue"
                        ? "text-blue-700 bg-blue-50"
                        : "text-green-700 bg-green-50"
                    }`}
                  >
                    {card.change}
                  </span>
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

interface UsageSectionProps {
  plan: "free" | "hub" | "studio";
  periodEnd: string | null;
  onUpgrade: () => void;
}

type UsageItem = {
  label: string;
  current: number;
  limit: number | null; // null = unlimited
  display: string;
};

function getUsageItems(plan: "free" | "hub" | "studio"): UsageItem[] {
  if (plan === "free") {
    return [
      { label: "Links",      current: 3,   limit: 5,     display: "3 / 5" },
      { label: "Page views", current: 750, limit: 1_000, display: "750 / 1,000" },
      { label: "Storage",    current: 18,  limit: 50,    display: "18 MB / 50 MB" },
    ];
  }
  if (plan === "hub") {
    return [
      { label: "Links",          current: 12,   limit: 100,    display: "12 / 100" },
      { label: "Page views",     current: 8420, limit: 50_000, display: "8,420 / 50,000" },
      { label: "Custom domains", current: 1,    limit: 3,      display: "1 / 3" },
      { label: "Storage",        current: 820,  limit: 1_024,  display: "820 MB / 1 GB" },
    ];
  }
  // studio
  return [
    { label: "Links",          current: 45,     limit: null,    display: "45 / ∞" },
    { label: "Page views",     current: 124000, limit: 500_000, display: "124,000 / 500,000" },
    { label: "Custom domains", current: 2,      limit: 10,      display: "2 / 10" },
    { label: "Storage",        current: 3277,   limit: 10_240,  display: "3.2 GB / 10 GB" },
  ];
}

import { BillingSectionCard } from "./BillingSectionCard";

function fillStyle(pct: number): React.CSSProperties {
  if (pct >= 90) return { background: "linear-gradient(90deg, #e11d48, #be123c)" };
  if (pct >= 70) return { background: "linear-gradient(90deg, #d97706, #ea580c)" };
  return { background: "linear-gradient(90deg, #6873ff, #3b46e0)" };
}

export function UsageSection({ plan, periodEnd, onUpgrade }: UsageSectionProps) {
  const items = getUsageItems(plan);
  const storage = items.find((i) => i.label === "Storage")!;
  const storagePct = storage.limit != null
    ? Math.min(100, Math.round((storage.current / storage.limit) * 100))
    : 0;

  const resetLabel = periodEnd
    ? new Date(periodEnd).toLocaleDateString("en-GB", { day: "numeric", month: "short" })
    : "monthly";

  const description =
    plan === "free"
      ? `Resets ${resetLabel}. Upgrade for higher limits and custom domains.`
      : `Resets ${resetLabel}.`;

  const storageUpgradeHint = plan === "free" ? "1 GB" : "10 GB";

  return (
    <BillingSectionCard title="Usage this period" description={description}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px 26px" }}>
        {items.map((item) => {
          const pct = item.limit != null
            ? Math.min(100, Math.round((item.current / item.limit) * 100))
            : 0;
          return (
            <div key={item.label}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 7 }}>
                <span style={{ fontSize: 12.5, color: "#1a2244", fontWeight: 500 }}>{item.label}</span>
                <span style={{ fontSize: 11.5, color: "#6b75a3", fontFamily: "'Geist Mono', monospace" }}>
                  {item.display}
                </span>
              </div>
              <div
                role="progressbar"
                aria-label={`${item.label} used`}
                aria-valuenow={item.current}
                aria-valuemin={0}
                aria-valuemax={item.limit ?? item.current}
                style={{ height: 7, background: "#eef0f7", borderRadius: 99, overflow: "hidden" }}
              >
                <div style={{ height: "100%", width: `${pct}%`, borderRadius: 99, transition: "width 0.8s cubic-bezier(0.16,1,0.3,1)", ...fillStyle(pct) }} />
              </div>
            </div>
          );
        })}
      </div>

      {storagePct >= 70 && (
        <div style={{ marginTop: 16, padding: "11px 13px", background: "#fdf3e3", border: "1px solid #f4dcae", borderRadius: 8, display: "flex", alignItems: "center", gap: 10, fontSize: 12.5, color: "#b45309" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0 }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          </svg>
          Storage is at {storagePct}%. Upgrade for {storageUpgradeHint} before you hit the cap.
          <button
            onClick={onUpgrade}
            style={{ marginLeft: "auto", display: "inline-flex", alignItems: "center", background: "white", color: "#1a2244", border: "1px solid #d6dae9", borderRadius: 8, padding: "6px 11px", fontSize: 12, fontWeight: 500, cursor: "pointer", whiteSpace: "nowrap" }}
          >
            Upgrade
          </button>
        </div>
      )}
    </BillingSectionCard>
  );
}

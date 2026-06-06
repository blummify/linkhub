import { BillingSectionCard } from "./BillingSectionCard";

interface UsageSectionProps {
  onUpgrade: () => void;
}

const USAGE_ITEMS = [
  { label: "Links",          current: 12,   limit: 100,   display: "12 / 100" },
  { label: "Page views",     current: 8420, limit: 50000, display: "8,420 / 50,000" },
  { label: "Custom domains", current: 1,    limit: 3,     display: "1 / 3" },
  { label: "Storage",        current: 820,  limit: 1024,  display: "820 MB / 1 GB" },
];

function fillStyle(pct: number): React.CSSProperties {
  if (pct >= 90) return { background: "linear-gradient(90deg, #e11d48, #be123c)" };
  if (pct >= 70) return { background: "linear-gradient(90deg, #d97706, #ea580c)" };
  return { background: "linear-gradient(90deg, #6873ff, #3b46e0)" };
}

export function UsageSection({ onUpgrade }: UsageSectionProps) {
  const storage = USAGE_ITEMS.find((i) => i.label === "Storage")!;
  const storagePct = Math.round((storage.current / storage.limit) * 100);

  return (
    <BillingSectionCard
      title="Usage this period"
      description="Resets Dec 14. Pro includes generous limits — you're only charged if you exceed them."
    >
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px 26px" }}>
        {USAGE_ITEMS.map((item) => {
          const pct = Math.min(100, Math.round((item.current / item.limit) * 100));
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
                aria-valuemax={item.limit}
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
          Storage is at {storagePct}%. Upgrade for 10&nbsp;GB before you hit the cap.
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

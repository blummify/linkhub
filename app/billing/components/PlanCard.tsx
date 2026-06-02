import { BRANDING_FONT_SERIF } from "@/app/constants/brandingFonts";

const PLANS = {
  free: { name: "Free", price: "$0", per: "forever" },
  pro:  { name: "Pro",  price: "$12", per: "/ month · billed annually" },
};

interface PlanCardProps {
  plan: "free" | "pro";
  canceled: boolean;
  onChangePlan: () => void;
  onCancelSubscription: () => void;
  onResumeSubscription: () => void;
}

export function PlanCard({ plan, canceled, onChangePlan, onCancelSubscription, onResumeSubscription }: PlanCardProps) {
  const p = PLANS[plan];

  if (plan === "free") {
    return (
      <div
        className="rounded-2xl border border-[#e6e9ff] bg-[#f1f3ff] flex flex-col justify-between h-full"
        style={{ padding: "22px 24px" }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 20 }}>
          <div>
            <div style={{ fontSize: 10.5, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.12em", color: "#3b46e0" }}>
              Current plan
            </div>
            <div style={{ fontFamily: BRANDING_FONT_SERIF, fontStyle: "italic", fontSize: 40, lineHeight: 1, letterSpacing: "-0.02em", margin: "8px 0 6px", color: "#0b1020" }}>
              Free
            </div>
            <div style={{ fontSize: 14, color: "#3a4474" }}>5 links · 1k views · no custom domain</div>
          </div>
          <button
            onClick={onChangePlan}
            style={{
              display: "inline-flex", alignItems: "center", gap: 7,
              background: "#3b46e0", color: "white",
              border: "none", borderRadius: 8, padding: "8px 14px",
              fontSize: 13, fontWeight: 500, cursor: "pointer", whiteSpace: "nowrap",
              boxShadow: "0 4px 12px -4px rgba(59,70,224,0.4)",
            }}
          >
            Upgrade to Pro
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="rounded-2xl flex flex-col justify-between h-full relative overflow-hidden"
      style={{ background: "linear-gradient(135deg, #0b1020, #1e2a8a)", padding: "22px 24px", border: "none" }}
    >
      <div style={{ position: "absolute", top: -80, right: -70, width: 260, height: 260, borderRadius: "50%", background: "radial-gradient(circle, rgba(104,115,255,0.45), transparent 70%)", pointerEvents: "none" }} />

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 20, position: "relative" }}>
        <div>
          <div style={{ fontSize: 10.5, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.12em", color: "rgba(255,255,255,0.7)" }}>
            Current plan
          </div>
          <div style={{ fontFamily: BRANDING_FONT_SERIF, fontStyle: "italic", fontSize: 40, lineHeight: 1, letterSpacing: "-0.02em", margin: "8px 0 6px", color: "white" }}>
            {p.name}
          </div>
          <div style={{ fontSize: 14, color: "rgba(255,255,255,0.8)" }}>
            <strong style={{ color: "white", fontWeight: 600 }}>{p.price}</strong> {p.per}
          </div>
        </div>
        <button
          onClick={onChangePlan}
          style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "white", color: "#1e2a8a", border: "none", borderRadius: 8, padding: "8px 14px", fontSize: 13, fontWeight: 500, cursor: "pointer", whiteSpace: "nowrap" }}
        >
          Change plan
        </button>
      </div>

      <div style={{ marginTop: 22, paddingTop: 16, borderTop: "1px solid rgba(255,255,255,0.14)", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12.5, color: "rgba(255,255,255,0.72)", position: "relative" }}>
        {canceled ? (
          <>
            <span>Canceled · access until <strong style={{ color: "white", fontWeight: 500 }}>December 14, 2026</strong></span>
            <button onClick={onResumeSubscription} style={{ background: "none", border: "none", padding: 0, color: "rgba(255,255,255,0.85)", fontSize: 12.5, textDecoration: "underline", textUnderlineOffset: 2, cursor: "pointer" }}>
              Resume
            </button>
          </>
        ) : (
          <>
            <span>Renews on <strong style={{ color: "white", fontWeight: 500 }}>December 14, 2026</strong></span>
            <button onClick={onCancelSubscription} style={{ background: "none", border: "none", padding: 0, color: "rgba(255,255,255,0.85)", fontSize: 12.5, textDecoration: "underline", textUnderlineOffset: 2, cursor: "pointer" }}>
              Cancel subscription
            </button>
          </>
        )}
      </div>
    </div>
  );
}

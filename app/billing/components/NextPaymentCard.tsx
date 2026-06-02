interface NextPaymentCardProps {
  amount: string | null;
  dueDate: string | null;
  cardBrand?: string;
  cardLast4?: string;
}

export function NextPaymentCard({ amount, dueDate, cardBrand, cardLast4 }: NextPaymentCardProps) {
  const displayAmount = amount ?? "—";
  const displayDate = dueDate
    ? new Date(dueDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
    : "—";

  return (
    <div
      className="bg-white rounded-2xl border border-[#eef0f7] flex flex-col justify-between h-full"
      style={{ boxShadow: "0 1px 2px rgba(15,23,42,0.04), 0 1px 1px rgba(15,23,42,0.03)", padding: "22px 24px" }}
    >
      <p style={{ fontSize: 14, fontWeight: 600, color: "#0b1020", marginBottom: 6 }}>
        Next payment
      </p>

      <div>
        <div style={{ fontFamily: "'Geist Mono', monospace", fontSize: 34, fontWeight: 500, color: "#0b1020", letterSpacing: "-0.02em", lineHeight: 1 }}>
          {displayAmount}
        </div>
        <div style={{ fontSize: 12.5, color: "#6b75a3", marginTop: 8 }}>
          on <strong style={{ color: "#1a2244", fontWeight: 600 }}>{displayDate}</strong>
        </div>
      </div>

      {cardLast4 && (
        <div style={{ marginTop: 16, paddingTop: 14, borderTop: "1px solid #eef0f7", display: "flex", alignItems: "center", gap: 9, fontSize: 12.5, color: "#3a4474" }}>
          <span style={{ width: 34, height: 23, borderRadius: 6, background: "linear-gradient(135deg, #1a1f4d, #3b46e0)", color: "white", display: "inline-flex", alignItems: "center", justifyContent: "center", fontFamily: "'Geist Mono', monospace", fontSize: 8, fontWeight: 700, letterSpacing: "0.08em", flexShrink: 0 }}>
            {(cardBrand ?? "CARD").toUpperCase()}
          </span>
          {cardBrand ? `${cardBrand.charAt(0).toUpperCase()}${cardBrand.slice(1)}` : "Card"} ending {cardLast4}
        </div>
      )}
    </div>
  );
}

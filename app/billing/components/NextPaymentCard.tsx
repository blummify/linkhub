export function NextPaymentCard() {
  return (
    <div
      className="bg-white rounded-2xl border border-[#eef0f7] flex flex-col justify-between h-full"
      style={{
        boxShadow: "0 1px 2px rgba(15,23,42,0.04), 0 1px 1px rgba(15,23,42,0.03)",
        padding: "22px 24px",
      }}
    >
      <div>
        <p style={{ fontSize: 14, fontWeight: 600, color: "#0b1020", marginBottom: 6 }}>
          Next payment
        </p>
      </div>

      <div>
        <div
          style={{
            fontFamily: "'Geist Mono', monospace",
            fontSize: 34,
            fontWeight: 500,
            color: "#0b1020",
            letterSpacing: "-0.02em",
            lineHeight: 1,
          }}
        >
          $144.00
        </div>
        <div style={{ fontSize: 12.5, color: "#6b75a3", marginTop: 8 }}>
          on <strong style={{ color: "#1a2244", fontWeight: 600 }}>Dec 14, 2026</strong>
        </div>
      </div>

      <div
        style={{
          marginTop: 16,
          paddingTop: 14,
          borderTop: "1px solid #eef0f7",
          display: "flex",
          alignItems: "center",
          gap: 9,
          fontSize: 12.5,
          color: "#3a4474",
        }}
      >
        {/* Mini brand chip */}
        <span
          style={{
            width: 34,
            height: 23,
            borderRadius: 6,
            background: "linear-gradient(135deg, #1a1f4d, #3b46e0)",
            color: "white",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "'Geist Mono', monospace",
            fontSize: 8,
            fontWeight: 700,
            letterSpacing: "0.08em",
            flexShrink: 0,
          }}
        >
          VISA
        </span>
        Visa ending 4242
      </div>
    </div>
  );
}

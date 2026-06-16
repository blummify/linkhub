"use client";

import { useBrandingStore } from "@/store/brandingStore";
import { useShallow } from "zustand/react/shallow";

const CARD_STYLES = [
  {
    id: "filled",
    label: "Filled",
    preview: { background: "white", border: "1px solid #eef0f7", boxShadow: "0 2px 6px rgba(15,23,42,0.06)" },
  },
  {
    id: "ghost",
    label: "Ghost",
    preview: { background: "transparent", border: "1.5px solid rgba(255,255,255,0.4)", boxShadow: "none" },
  },
  {
    id: "soft",
    label: "Soft",
    preview: { background: "rgba(59,70,224,0.10)", border: "1px solid transparent", boxShadow: "none" },
  },
  {
    id: "shadow",
    label: "Shadow",
    preview: { background: "white", border: "1px solid transparent", boxShadow: "0 6px 20px rgba(15,23,42,0.14)" },
  },
];

const sectionLabel: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 600,
  color: "#6b75a3",
  textTransform: "uppercase",
  letterSpacing: "0.09em",
  marginBottom: 12,
};

export function CardStyleSection() {
  const { cardStyle, setCardStyle } = useBrandingStore(
    useShallow((s) => ({ cardStyle: s.cardStyle, setCardStyle: s.setCardStyle }))
  );

  return (
    <div>
      <p style={sectionLabel}>Card style</p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        {CARD_STYLES.map((style) => {
          const active = cardStyle === style.id;
          return (
            <button
              key={style.id}
              type="button"
              onClick={() => setCardStyle(style.id)}
              style={{
                padding: "14px 10px 11px",
                border: `1.5px solid ${active ? "#3b46e0" : "#eef0f7"}`,
                borderRadius: 12,
                background: active ? "#f0f1ff" : "white",
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 9,
                transition: "all 0.15s",
              }}
            >
              {/* Mini card preview */}
              <div
                style={{
                  width: "100%",
                  height: 22,
                  borderRadius: 6,
                  ...style.preview,
                  background: active
                    ? style.id === "ghost" ? "transparent" : style.id === "soft" ? "rgba(59,70,224,0.10)" : "white"
                    : style.preview.background,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 4,
                }}
              >
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: active ? "#3b46e0" : "#d6dae9", flexShrink: 0 }} />
                <div style={{ flex: 1, height: 2, borderRadius: 99, background: active ? "#3b46e0" : "#d6dae9" }} />
              </div>
              <span style={{ fontSize: 11, fontWeight: 500, color: active ? "#3b46e0" : "#6b75a3" }}>
                {style.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

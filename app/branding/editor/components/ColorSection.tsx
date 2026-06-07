"use client";

import { useBrandingStore } from "@/store/brandingStore";

const ACCENT_PRESETS: { color: string; gradient: string }[] = [
  { color: "#3b46e0", gradient: "linear-gradient(135deg, #3b46e0, #6873ff)" },
  { color: "#16a34a", gradient: "linear-gradient(135deg, #16a34a, #4ade80)" },
  { color: "#d97706", gradient: "linear-gradient(135deg, #d97706, #fbbf24)" },
  { color: "#e11d48", gradient: "linear-gradient(135deg, #e11d48, #fb7185)" },
  { color: "#7c3aed", gradient: "linear-gradient(135deg, #7c3aed, #a78bfa)" },
  { color: "#0891b2", gradient: "linear-gradient(135deg, #0891b2, #22d3ee)" },
  { color: "#1a1a1a", gradient: "linear-gradient(135deg, #1a1a1a, #525252)" },
];

const TEXT_PRESETS = [
  { label: "Auto",  value: null,      swatch: "linear-gradient(135deg, #0b1020 50%, white 50%)" },
  { label: "Light", value: "#ffffff", swatch: "#ffffff" },
  { label: "Dark",  value: "#0b1020", swatch: "#0b1020" },
  { label: "Slate", value: "#6b75a3", swatch: "#6b75a3" },
];

const subsLabel: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 600,
  color: "#6b75a3",
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  marginBottom: 10,
  display: "block",
};

export function ColorSection() {
  const store = useBrandingStore();
  const isAccentPreset = ACCENT_PRESETS.some((p) => p.color === store.accentColor);

  return (
    <div>
      {/* ── Accent color ──────────────────────────────── */}
      <span style={subsLabel}>Accent color</span>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginBottom: 12 }}>
        {ACCENT_PRESETS.map(({ color, gradient }) => {
          const active = store.accentColor === color;
          return (
            <button
              key={color}
              type="button"
              onClick={() => store.setAccentColor(color)}
              title={color}
              style={{
                width: 32,
                height: 32,
                borderRadius: 9,
                background: gradient,
                border: active ? "2.5px solid #0b1020" : "2.5px solid transparent",
                cursor: "pointer",
                boxShadow: active ? "0 0 0 2px white inset" : "0 1px 3px rgba(0,0,0,0.12)",
                transition: "all 0.15s",
                flexShrink: 0,
              }}
            />
          );
        })}

        <label title="Custom color" style={{ position: "relative", cursor: "pointer", display: "block", flexShrink: 0 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 9,
              background: isAccentPreset ? "transparent" : store.accentColor,
              border: isAccentPreset ? "2px dashed #d6dae9" : "2.5px solid #0b1020",
              boxShadow: !isAccentPreset ? "0 0 0 2px white inset" : undefined,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#6b75a3",
              transition: "all 0.15s",
            }}
          >
            {isAccentPreset && (
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14" />
              </svg>
            )}
          </div>
          <input
            type="color"
            value={store.accentColor}
            onChange={(e) => store.setAccentColor(e.target.value)}
            style={{ position: "absolute", inset: 0, opacity: 0, width: "100%", height: "100%", cursor: "pointer" }}
          />
        </label>
      </div>

      {/* Hex readout */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          background: "#f7f8fc",
          borderRadius: 8,
          padding: "7px 10px",
          border: "1px solid #eef0f7",
          marginBottom: 20,
        }}
      >
        <div
          style={{
            width: 14,
            height: 14,
            borderRadius: 4,
            background: store.accentColor,
            flexShrink: 0,
            border: "1px solid rgba(0,0,0,0.1)",
          }}
        />
        <span style={{ fontSize: 12, color: "#6b75a3", fontFamily: "var(--branding-font-mono, ui-monospace, monospace)" }}>
          {store.accentColor.toUpperCase()}
        </span>
      </div>

      {/* ── Text color ────────────────────────────────── */}
      <span style={subsLabel}>Text color</span>

      <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
        {TEXT_PRESETS.map((p) => {
          const active = store.textColor === p.value;
          return (
            <button
              key={String(p.value)}
              type="button"
              title={p.label}
              onClick={() => store.setTextColor(p.value)}
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 5,
                padding: "8px 4px",
                border: `1.5px solid ${active ? "#3b46e0" : "#eef0f7"}`,
                borderRadius: 10,
                background: active ? "#f0f1ff" : "white",
                cursor: "pointer",
                transition: "all 0.15s",
              }}
            >
              <div
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: 6,
                  background: p.swatch,
                  border: "1px solid rgba(0,0,0,0.08)",
                  flexShrink: 0,
                }}
              />
              <span style={{ fontSize: 10, color: active ? "#3b46e0" : "#6b75a3", fontWeight: active ? 600 : 400 }}>
                {p.label}
              </span>
            </button>
          );
        })}

        {/* Custom text color */}
        <label style={{ position: "relative", cursor: "pointer", display: "block", flex: 1 }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 5,
              padding: "8px 4px",
              border: "1.5px dashed #d6dae9",
              borderRadius: 10,
              background: "white",
              cursor: "pointer",
            }}
          >
            <div
              style={{
                width: 22,
                height: 22,
                borderRadius: 6,
                border: "1px dashed #d6dae9",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#6b75a3",
              }}
            >
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14" />
              </svg>
            </div>
            <span style={{ fontSize: 10, color: "#6b75a3" }}>Custom</span>
          </div>
          <input
            type="color"
            value={store.textColor ?? "#ffffff"}
            onChange={(e) => store.setTextColor(e.target.value)}
            style={{ position: "absolute", inset: 0, opacity: 0, width: "100%", height: "100%", cursor: "pointer" }}
          />
        </label>
      </div>
    </div>
  );
}

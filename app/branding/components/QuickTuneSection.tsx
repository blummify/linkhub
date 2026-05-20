"use client";

import { BRANDING_HEADING_FONT_OPTIONS } from "@/app/constants/brandingFonts";

const ACCENT_PRESETS: { color: string; gradient: string }[] = [
  { color: "#3b46e0", gradient: "linear-gradient(135deg, #3b46e0, #6873ff)" },
  { color: "#16a34a", gradient: "linear-gradient(135deg, #16a34a, #4ade80)" },
  { color: "#d97706", gradient: "linear-gradient(135deg, #d97706, #fbbf24)" },
  { color: "#e11d48", gradient: "linear-gradient(135deg, #e11d48, #fb7185)" },
  { color: "#7c3aed", gradient: "linear-gradient(135deg, #7c3aed, #a78bfa)" },
  { color: "#0891b2", gradient: "linear-gradient(135deg, #0891b2, #22d3ee)" },
  { color: "#1a1a1a", gradient: "linear-gradient(135deg, #1a1a1a, #525252)" },
];

const BUTTON_SHAPES: { id: string; label: string; radius: number }[] = [
  { id: "square", label: "Square", radius: 0 },
  { id: "rounded", label: "Rounded", radius: 4 },
  { id: "pill", label: "Pill", radius: 999 },
];

interface QuickTuneSectionProps {
  accentColor: string;
  buttonStyle: string;
  fontFamily: string;
  onAccentColorChange: (v: string) => void;
  onButtonStyleChange: (v: string) => void;
  onFontFamilyChange: (v: string) => void;
}

const qtLabel: React.CSSProperties = {
  fontSize: 11.5,
  fontWeight: 500,
  color: "#6b75a3",
  marginBottom: 10,
  textTransform: "uppercase",
  letterSpacing: "0.07em",
};

export function QuickTuneSection({
  accentColor,
  buttonStyle,
  fontFamily,
  onAccentColorChange,
  onButtonStyleChange,
  onFontFamilyChange,
}: QuickTuneSectionProps) {
  const isPreset = ACCENT_PRESETS.some((p) => p.color === accentColor);

  return (
    <div
      style={{
        background: "white",
        border: "1px solid #eef0f7",
        borderRadius: 18,
        padding: "22px 24px",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 22,
        }}
      >
        <div>
          <p style={qtLabel}>Accent color</p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {ACCENT_PRESETS.map(({ color, gradient }) => (
              <button
                key={color}
                type="button"
                onClick={() => onAccentColorChange(color)}
                title={color}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 10,
                  border: accentColor === color ? "2px solid #0b1020" : "2px solid transparent",
                  background: gradient,
                  cursor: "pointer",
                  boxShadow:
                    accentColor === color ? "0 0 0 2px white inset" : "none",
                  transition: "all 0.15s ease",
                }}
              />
            ))}
            <label title="Custom color" style={{ position: "relative", cursor: "pointer" }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 10,
                  border: `1.5px dashed ${isPreset ? "#d6dae9" : accentColor}`,
                  background: isPreset ? "transparent" : accentColor,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#6b75a3",
                }}
              >
                {isPreset && (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14"/>
                  </svg>
                )}
              </div>
              <input
                type="color"
                value={accentColor}
                onChange={(e) => onAccentColorChange(e.target.value)}
                style={{
                  position: "absolute",
                  inset: 0,
                  opacity: 0,
                  width: "100%",
                  height: "100%",
                  cursor: "pointer",
                }}
              />
            </label>
          </div>
        </div>

        <div>
          <p style={qtLabel}>Button shape</p>
          <div style={{ display: "flex", gap: 8 }}>
            {BUTTON_SHAPES.map(({ id, label, radius }) => {
              const active = buttonStyle === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => onButtonStyleChange(id)}
                  style={{
                    flex: 1,
                    padding: "14px 8px",
                    border: `1.5px solid ${active ? "#3b46e0" : "#eef0f7"}`,
                    borderRadius: 12,
                    background: active ? "#f0f1ff" : "white",
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 8,
                    transition: "all 0.15s ease",
                  }}
                >
                  <div
                    style={{
                      width: "100%",
                      height: 12,
                      borderRadius: radius,
                      background: "#0b1020",
                    }}
                  />
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 500,
                      color: active ? "#3b46e0" : "#6b75a3",
                    }}
                  >
                    {label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <p style={qtLabel}>Heading font</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {BRANDING_HEADING_FONT_OPTIONS.map((font) => {
              const active = fontFamily === font.value;
              return (
                <button
                  key={font.id}
                  type="button"
                  onClick={() => onFontFamilyChange(font.value)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "9px 12px",
                    border: `1px solid ${active ? "#3b46e0" : "#eef0f7"}`,
                    borderRadius: 10,
                    cursor: "pointer",
                    background: active ? "#f0f1ff" : "white",
                    transition: "all 0.15s ease",
                    width: "100%",
                    textAlign: "left",
                  }}
                >
                  <span
                    style={{
                      fontSize: 14,
                      color: "#0b1020",
                      fontFamily: font.stack,
                      ...("previewStyle" in font ? font.previewStyle : {}),
                    }}
                  >
                    {font.name}
                  </span>
                  <span
                    style={{
                      fontSize: 10.5,
                      color: "#6b75a3",
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                    }}
                  >
                    {font.type}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

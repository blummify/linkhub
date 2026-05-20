"use client";

import { HEADLINE_FONT_OPTIONS } from "@/app/constants/previewFonts";

const ACCENT_PRESETS = [
  "#3b46e0",
  "#0f172a",
  "#16a34a",
  "#dc2626",
  "#d97706",
  "#7c3aed",
  "#0891b2",
];

const BUTTON_SHAPES: { id: string; label: string; radius: number }[] = [
  { id: "flat",    label: "Square",  radius: 4  },
  { id: "rounded", label: "Rounded", radius: 12 },
  { id: "shadow",  label: "Pill",    radius: 99 },
];

const FONT_PICKS = HEADLINE_FONT_OPTIONS.slice(0, 4) as unknown as string[];

interface QuickTuneSectionProps {
  accentColor: string;
  buttonStyle: string;
  fontFamily: string;
  onAccentColorChange: (v: string) => void;
  onButtonStyleChange: (v: string) => void;
  onFontFamilyChange: (v: string) => void;
}

const subLabel: React.CSSProperties = {
  fontSize: 10.5,
  fontWeight: 600,
  color: "#6b75a3",
  letterSpacing: "0.10em",
  textTransform: "uppercase",
  marginBottom: 12,
};

export function QuickTuneSection({
  accentColor,
  buttonStyle,
  fontFamily,
  onAccentColorChange,
  onButtonStyleChange,
  onFontFamilyChange,
}: QuickTuneSectionProps) {
  const isPreset = ACCENT_PRESETS.includes(accentColor);

  return (
    <div
      style={{
        background: "white",
        border: "1px solid #eef0f7",
        borderRadius: 18,
        padding: "22px 24px",
        display: "flex",
        flexDirection: "column",
        gap: 24,
      }}
    >
      {/* Accent color */}
      <div>
        <p style={subLabel}>Accent color</p>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          {ACCENT_PRESETS.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => onAccentColorChange(color)}
              title={color}
              style={{
                width: 28,
                height: 28,
                borderRadius: "50%",
                border: 0,
                background: color,
                cursor: "pointer",
                flexShrink: 0,
                boxShadow:
                  accentColor === color
                    ? `0 0 0 2.5px white, 0 0 0 4.5px ${color}`
                    : "none",
                transition: "box-shadow 0.15s",
              }}
            />
          ))}

          {/* Custom color picker */}
          <label
            title="Custom color"
            style={{ position: "relative", width: 28, height: 28, cursor: "pointer", flexShrink: 0 }}
          >
            <div
              style={{
                width: "100%",
                height: "100%",
                borderRadius: "50%",
                border: `2px ${isPreset ? "dashed" : "solid"} ${isPreset ? "#d6dae9" : accentColor}`,
                background: isPreset ? "white" : accentColor,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
                boxShadow: !isPreset
                  ? `0 0 0 2.5px white, 0 0 0 4.5px ${accentColor}`
                  : "none",
                transition: "box-shadow 0.15s",
              }}
            >
              {isPreset && (
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#a8aecb" strokeWidth="2">
                  <circle cx="12" cy="12" r="3"/>
                  <path strokeLinecap="round" d="M12 2v3M12 19v3M2 12h3M19 12h3M4.93 4.93l2.12 2.12M16.95 16.95l2.12 2.12M4.93 19.07l2.12-2.12M16.95 7.05l2.12-2.12"/>
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

      {/* Button shape */}
      <div>
        <p style={subLabel}>Button shape</p>
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
                  padding: "10px 0",
                  borderRadius: 10,
                  fontSize: 12.5,
                  fontWeight: active ? 700 : 500,
                  border: "1px solid",
                  borderColor: active ? "#3b46e0" : "#eef0f7",
                  background: active ? "#f0f1ff" : "white",
                  color: active ? "#3b46e0" : "#6b75a3",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  transition: "all 0.15s",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 8,
                }}
                onMouseEnter={(e) => {
                  if (!active) {
                    (e.currentTarget as HTMLButtonElement).style.borderColor = "#d6dae9";
                    (e.currentTarget as HTMLButtonElement).style.background = "#f7f8fc";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!active) {
                    (e.currentTarget as HTMLButtonElement).style.borderColor = "#eef0f7";
                    (e.currentTarget as HTMLButtonElement).style.background = "white";
                  }
                }}
              >
                <div
                  style={{
                    width: 44,
                    height: 18,
                    borderRadius: radius,
                    background: active ? "#3b46e0" : "#d6dae9",
                    transition: "background 0.15s",
                  }}
                />
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Heading font */}
      <div>
        <p style={subLabel}>Heading font</p>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {FONT_PICKS.map((name) => {
            const active = fontFamily === name;
            return (
              <button
                key={name}
                type="button"
                onClick={() => onFontFamilyChange(name)}
                style={{
                  padding: "7px 14px",
                  borderRadius: 99,
                  fontSize: 13,
                  border: "1px solid",
                  borderColor: active ? "#3b46e0" : "#eef0f7",
                  background: active ? "#f0f1ff" : "white",
                  color: active ? "#3b46e0" : "#6b75a3",
                  fontWeight: active ? 700 : 500,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  transition: "all 0.15s",
                  whiteSpace: "nowrap",
                }}
                onMouseEnter={(e) => {
                  if (!active) {
                    (e.currentTarget as HTMLButtonElement).style.borderColor = "#d6dae9";
                    (e.currentTarget as HTMLButtonElement).style.background = "#f7f8fc";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!active) {
                    (e.currentTarget as HTMLButtonElement).style.borderColor = "#eef0f7";
                    (e.currentTarget as HTMLButtonElement).style.background = "white";
                  }
                }}
              >
                {name}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

"use client";

import { THEME_PRESETS, type ThemePreset } from "@/app/constants/themePresets";

interface ThemesSectionProps {
  selectedThemeId: string;
  onSelect: (preset: ThemePreset) => void;
}

const THEME_SWATCHES: Record<string, [string, string]> = {
  "indigo-mint":     ["#1f33aa", "#006c4c"],
  "sunset-glow":    ["#ff6b35", "#ffcc33"],
  "midnight-oasis": ["#3b4ec2", "#e2e8ff"],
  "cloud-white":    ["#1a1b22", "#757684"],
};

export function ThemesSection({ selectedThemeId, onSelect }: ThemesSectionProps) {
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
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: 12,
        }}
      >
        {THEME_PRESETS.map((preset) => {
          const selected = selectedThemeId === preset.id;
          const [c1, c2] = THEME_SWATCHES[preset.id] ?? ["#3b46e0", "#7a85ff"];

          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => onSelect(preset)}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 10,
                padding: 0,
                border: 0,
                background: "transparent",
                cursor: "pointer",
                opacity: selected ? 1 : 0.72,
                transition: "opacity 0.15s",
                textAlign: "center",
              }}
              onMouseEnter={(e) => {
                if (!selected)
                  (e.currentTarget as HTMLButtonElement).style.opacity = "1";
              }}
              onMouseLeave={(e) => {
                if (!selected)
                  (e.currentTarget as HTMLButtonElement).style.opacity = "0.72";
              }}
            >
              {/* Mini preview card */}
              <div
                style={{
                  width: "100%",
                  aspectRatio: "4 / 3",
                  background: "#f7f8fc",
                  borderRadius: 12,
                  padding: 8,
                  border: `2px solid ${selected ? "#3b46e0" : "transparent"}`,
                  boxShadow: selected
                    ? "0 0 0 3px rgba(59,70,224,0.12)"
                    : "0 1px 3px rgba(15,23,42,0.06)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.15s",
                }}
              >
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    borderRadius: 8,
                    background: preset.appearance.bgColor,
                    border: "1px solid rgba(0,0,0,0.06)",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                  }}
                >
                  <div style={{ display: "flex", gap: 6 }}>
                    <div
                      style={{
                        width: 16,
                        height: 16,
                        borderRadius: "50%",
                        background: c1,
                      }}
                    />
                    <div
                      style={{
                        width: 16,
                        height: 16,
                        borderRadius: "50%",
                        background: c2,
                      }}
                    />
                  </div>
                  {/* Mini link bars */}
                  <div
                    style={{
                      width: "60%",
                      height: 5,
                      borderRadius: 3,
                      background: c1,
                      opacity: 0.6,
                    }}
                  />
                  <div
                    style={{
                      width: "50%",
                      height: 5,
                      borderRadius: 3,
                      background: c1,
                      opacity: 0.35,
                    }}
                  />
                </div>
              </div>

              <span
                style={{
                  fontSize: 12.5,
                  fontWeight: selected ? 700 : 500,
                  color: selected ? "#0b1020" : "#6b75a3",
                  fontFamily: "inherit",
                  transition: "color 0.15s",
                }}
              >
                {preset.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

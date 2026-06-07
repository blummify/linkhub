"use client";

import { useBrandingStore } from "@/store/brandingStore";
import { BRANDING_HEADING_FONT_OPTIONS } from "@/app/constants/brandingFonts";
import { BODY_FONTS } from "@/app/constants/editorBodyFonts";

const subsLabel: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 600,
  color: "#6b75a3",
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  marginBottom: 8,
  display: "block",
};

export function TypographySection() {
  const store = useBrandingStore();

  return (
    <div>
      {/* Heading font */}
      <span style={subsLabel}>Heading font</span>
      <div style={{ display: "flex", flexDirection: "column", gap: 5, marginBottom: 18 }}>
        {BRANDING_HEADING_FONT_OPTIONS.map((font) => {
          const active = store.fontFamily === font.value;
          return (
            <button
              key={font.id}
              type="button"
              onClick={() => store.setFontFamily(font.value)}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "10px 13px",
                border: `1.5px solid ${active ? "#3b46e0" : "#eef0f7"}`,
                borderRadius: 10,
                cursor: "pointer",
                background: active ? "#f0f1ff" : "white",
                transition: "all 0.15s",
                textAlign: "left",
              }}
            >
              <span
                style={{
                  fontSize: 15,
                  color: active ? "#3b46e0" : "#0b1020",
                  fontFamily: font.stack,
                  ...("previewStyle" in font ? font.previewStyle : {}),
                }}
              >
                {font.name}
              </span>
              <span
                style={{
                  fontSize: 10,
                  color: active ? "#6873ff" : "#a8aecb",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  fontWeight: 600,
                }}
              >
                {font.type}
              </span>
            </button>
          );
        })}
      </div>

      {/* Body font */}
      <span style={subsLabel}>Body font</span>
      <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
        {BODY_FONTS.map((font) => {
          const active = store.bodyFont === font.value;
          return (
            <button
              key={font.id}
              type="button"
              onClick={() => store.setBodyFont(font.value)}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "9px 13px",
                border: `1.5px solid ${active ? "#3b46e0" : "#eef0f7"}`,
                borderRadius: 10,
                cursor: "pointer",
                background: active ? "#f0f1ff" : "white",
                transition: "all 0.15s",
                textAlign: "left",
              }}
            >
              <span
                style={{
                  fontSize: 14,
                  color: active ? "#3b46e0" : "#0b1020",
                  fontFamily: font.stack,
                }}
              >
                {font.name}
              </span>
              {active && (
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#3b46e0" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

"use client";

import { useBrandingStore } from "@/store/brandingStore";
import { useShallow } from "zustand/react/shallow";

const PRESETS = [
  { label: "None",     color: "#000000", opacity: 0   },
  { label: "Dark 30%", color: "#000000", opacity: 30  },
  { label: "Dark 50%", color: "#000000", opacity: 50  },
  { label: "Light 20%",color: "#ffffff", opacity: 20  },
];

const TINT_COLORS = [
  { label: "Black",  value: "#000000" },
  { label: "White",  value: "#ffffff" },
];

const sectionLabel: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 600,
  color: "#6b75a3",
  textTransform: "uppercase",
  letterSpacing: "0.09em",
  marginBottom: 12,
};

export function OverlaySection() {
  const { overlayColor, overlayOpacity, accentColor, setOverlay } = useBrandingStore(
    useShallow((s) => ({
      overlayColor: s.overlayColor,
      overlayOpacity: s.overlayOpacity,
      accentColor: s.accentColor,
      setOverlay: s.setOverlay,
    }))
  );

  const tintColors = [
    ...TINT_COLORS,
    { label: "Accent", value: accentColor },
  ];

  return (
    <div>
      <p style={sectionLabel}>Overlay</p>

      {/* Quick presets */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
        {PRESETS.map((p) => {
          const active = overlayOpacity === p.opacity && (p.opacity === 0 || overlayColor === p.color);
          return (
            <button
              key={p.label}
              type="button"
              onClick={() => setOverlay(p.color, p.opacity)}
              style={{
                fontSize: 11,
                fontWeight: 500,
                padding: "5px 10px",
                borderRadius: 99,
                border: `1.5px solid ${active ? "#3b46e0" : "#eef0f7"}`,
                background: active ? "#f0f1ff" : "white",
                color: active ? "#3b46e0" : "#4b5680",
                cursor: "pointer",
                transition: "all 0.15s",
                flexShrink: 0,
              }}
            >
              {p.label}
            </button>
          );
        })}
      </div>

      {/* Opacity slider */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 7 }}>
          <span style={{ fontSize: 11.5, color: "#6b75a3", fontWeight: 500 }}>Opacity</span>
          <span style={{ fontSize: 11.5, color: "#0b1020", fontWeight: 600 }}>{overlayOpacity}%</span>
        </div>
        <input
          type="range"
          min={0}
          max={100}
          step={5}
          value={overlayOpacity}
          onChange={(e) => setOverlay(overlayColor, Number(e.target.value))}
          style={{ width: "100%", accentColor: "#3b46e0" }}
        />
      </div>

      {/* Color swatches */}
      <div>
        <span style={{ fontSize: 11.5, color: "#6b75a3", fontWeight: 500, display: "block", marginBottom: 8 }}>Tint color</span>
        <div style={{ display: "flex", gap: 8 }}>
          {tintColors.map((c) => {
            const isActive = overlayColor === c.value && overlayOpacity > 0;
            return (
              <button
                key={c.value}
                type="button"
                title={c.label}
                onClick={() => setOverlay(c.value, overlayOpacity === 0 ? 30 : overlayOpacity)}
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 8,
                  background: c.value,
                  border: isActive ? "2.5px solid #3b46e0" : "1.5px solid #d6dae9",
                  boxShadow: isActive ? "0 0 0 2px white inset" : "none",
                  cursor: "pointer",
                  transition: "all 0.15s",
                  flexShrink: 0,
                }}
              />
            );
          })}

          {/* Custom tint picker */}
          <label style={{ position: "relative", cursor: "pointer", display: "block" }}>
            <div
              style={{
                width: 30,
                height: 30,
                borderRadius: 8,
                border: "1.5px dashed #d6dae9",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#6b75a3",
                transition: "all 0.15s",
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14" />
              </svg>
            </div>
            <input
              type="color"
              value={overlayColor}
              onChange={(e) => setOverlay(e.target.value, overlayOpacity === 0 ? 30 : overlayOpacity)}
              style={{ position: "absolute", inset: 0, opacity: 0, width: "100%", height: "100%", cursor: "pointer" }}
            />
          </label>
        </div>
      </div>
    </div>
  );
}

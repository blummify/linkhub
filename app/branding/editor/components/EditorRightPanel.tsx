"use client";

import { useBrandingStore } from "@/store/brandingStore";
import { BRANDING_BUTTON_SHAPES } from "@/app/constants/brandingButtonShapes";
import { EDITOR_EFFECTS } from "@/app/constants/editorEffects";
import { ColorSection } from "./ColorSection";
import { TypographySection } from "./TypographySection";
import { CardStyleSection } from "./CardStyleSection";

const sectionLabel: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 600,
  color: "#6b75a3",
  textTransform: "uppercase",
  letterSpacing: "0.09em",
  marginBottom: 12,
};

function Divider() {
  return <div style={{ height: 1, background: "#f0f1f7" }} />;
}

export function EditorRightPanel() {
  const store = useBrandingStore();

  return (
    <div
      style={{
        width: 300,
        flexShrink: 0,
        overflowY: "auto",
        borderLeft: "1px solid #eef0f7",
        background: "white",
        scrollbarWidth: "none",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* ── Colors ───────────────────────────────────── */}
      <section style={{ padding: "20px 20px 18px" }}>
        <ColorSection />
      </section>

      <Divider />

      {/* ── Button Shape ─────────────────────────────── */}
      <section style={{ padding: "18px 20px" }}>
        <p style={sectionLabel}>Button shape</p>
        <div style={{ display: "flex", gap: 8 }}>
          {BRANDING_BUTTON_SHAPES.map(({ id, label, radiusPx }) => {
            const active = store.buttonStyle === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => store.setButtonStyle(id)}
                style={{
                  flex: 1,
                  padding: "13px 8px 11px",
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
                <div
                  style={{
                    width: "100%",
                    height: 11,
                    borderRadius: radiusPx,
                    background: active ? "#3b46e0" : "#c8cce0",
                    transition: "background 0.15s",
                  }}
                />
                <span style={{ fontSize: 11, fontWeight: 500, color: active ? "#3b46e0" : "#6b75a3" }}>
                  {label}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <Divider />

      {/* ── Typography ───────────────────────────────── */}
      <section style={{ padding: "18px 20px" }}>
        <TypographySection />
      </section>

      <Divider />

      {/* ── Card Style ───────────────────────────────── */}
      <section style={{ padding: "18px 20px" }}>
        <CardStyleSection />
      </section>

      <Divider />

      {/* ── Effects ──────────────────────────────────── */}
      <section style={{ padding: "18px 20px 24px" }}>
        <p style={sectionLabel}>Effects</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {EDITOR_EFFECTS.map((effect) => {
            const enabled = store.effects.includes(effect.id);
            return (
              <div
                key={effect.id}
                role="button"
                tabIndex={0}
                onClick={() => store.toggleEffect(effect.id)}
                onKeyDown={(e) => e.key === "Enter" && store.toggleEffect(effect.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 11,
                  padding: "9px 12px",
                  borderRadius: 10,
                  background: enabled ? "#f0f1ff" : "transparent",
                  border: `1px solid ${enabled ? "#c7d0ff" : "transparent"}`,
                  cursor: "pointer",
                  transition: "all 0.15s",
                  outline: "none",
                }}
              >
                <span style={{ fontSize: 15, width: 20, textAlign: "center", lineHeight: 1, flexShrink: 0 }}>
                  {effect.icon}
                </span>
                <span style={{ flex: 1, fontSize: 13, color: "#0b1020", fontWeight: enabled ? 500 : 400 }}>
                  {effect.name}
                </span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={enabled}
                  onClick={(e) => { e.stopPropagation(); store.toggleEffect(effect.id); }}
                  style={{
                    width: 38,
                    height: 21,
                    borderRadius: 99,
                    border: "none",
                    background: enabled ? "#3b46e0" : "#d6dae9",
                    position: "relative",
                    cursor: "pointer",
                    transition: "background 0.2s",
                    flexShrink: 0,
                  }}
                >
                  <span
                    style={{
                      position: "absolute",
                      top: 2.5,
                      left: enabled ? 19 : 2.5,
                      width: 16,
                      height: 16,
                      borderRadius: "50%",
                      background: "white",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.18)",
                      transition: "left 0.2s",
                    }}
                  />
                </button>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

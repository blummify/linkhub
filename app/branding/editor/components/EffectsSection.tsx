"use client";

import { EDITOR_EFFECTS } from "@/app/constants/editorEffects";

interface EffectsSectionProps {
  effects: string[];
  onToggle: (id: string) => void;
}

const labelStyle: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 600,
  color: "#6b75a3",
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  marginBottom: 12,
};

export function EffectsSection({ effects, onToggle }: EffectsSectionProps) {
  return (
    <div>
      <p style={labelStyle}>Effects</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {EDITOR_EFFECTS.map((effect) => {
          const enabled = effects.includes(effect.id);
          return (
            <div
              key={effect.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "11px 14px",
                borderRadius: 10,
                background: enabled ? "#f0f1ff" : "white",
                border: `1px solid ${enabled ? "#c7d0ff" : "#eef0f7"}`,
                cursor: "pointer",
                transition: "all 0.15s",
              }}
              onClick={() => onToggle(effect.id)}
            >
              <span style={{ fontSize: 16, lineHeight: 1, width: 20, textAlign: "center" }}>
                {effect.icon}
              </span>
              <span style={{ flex: 1, fontSize: 13.5, color: "#0b1020", fontWeight: enabled ? 500 : 400 }}>
                {effect.name}
              </span>
              {/* Toggle */}
              <button
                type="button"
                role="switch"
                aria-checked={enabled}
                onClick={(e) => { e.stopPropagation(); onToggle(effect.id); }}
                style={{
                  width: 40,
                  height: 22,
                  borderRadius: 11,
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
                    top: 3,
                    left: enabled ? 21 : 3,
                    width: 16,
                    height: 16,
                    borderRadius: "50%",
                    background: "white",
                    boxShadow: "0 1px 2px rgba(0,0,0,0.2)",
                    transition: "left 0.2s",
                  }}
                />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

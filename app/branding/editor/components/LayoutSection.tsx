"use client";

import { useBrandingStore } from "@/store/brandingStore";
import { useShallow } from "zustand/react/shallow";

const PROFILE_LAYOUTS = [
  { id: "classic",  label: "Classic",  desc: "Avatar top, name, bio, links" },
  { id: "minimal",  label: "Minimal",  desc: "Compact header, no frame" },
  { id: "centered", label: "Centered", desc: "Everything centered, wide avatar" },
];

const LINK_DENSITIES = [
  { id: "default",     label: "Default" },
  { id: "comfortable", label: "Comfortable" },
  { id: "compact",     label: "Compact" },
];

const sectionLabel: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 600,
  color: "#6b75a3",
  textTransform: "uppercase",
  letterSpacing: "0.09em",
  marginBottom: 12,
};

export function LayoutSection() {
  const { profileLayout, setProfileLayout, linkDensity, setLinkDensity } = useBrandingStore(
    useShallow((s) => ({
      profileLayout: s.profileLayout,
      setProfileLayout: s.setProfileLayout,
      linkDensity: s.linkDensity,
      setLinkDensity: s.setLinkDensity,
    }))
  );

  return (
    <div>
      <p style={sectionLabel}>Layout</p>

      {/* Profile style */}
      <div style={{ marginBottom: 18 }}>
        <span style={{ fontSize: 11.5, color: "#6b75a3", fontWeight: 500, display: "block", marginBottom: 8 }}>
          Profile style
        </span>
        <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
          {PROFILE_LAYOUTS.map((layout) => {
            const active = profileLayout === layout.id;
            return (
              <button
                key={layout.id}
                type="button"
                onClick={() => setProfileLayout(layout.id)}
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
                <div>
                  <div style={{ fontSize: 13, fontWeight: active ? 600 : 500, color: active ? "#3b46e0" : "#0b1020" }}>
                    {layout.label}
                  </div>
                  <div style={{ fontSize: 11, color: "#6b75a3", marginTop: 1 }}>{layout.desc}</div>
                </div>
                {active && (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3b46e0" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Link density */}
      <div>
        <span style={{ fontSize: 11.5, color: "#6b75a3", fontWeight: 500, display: "block", marginBottom: 8 }}>
          Link density
        </span>
        <div style={{ display: "flex", background: "#f0f1f7", borderRadius: 10, padding: 3, gap: 2 }}>
          {LINK_DENSITIES.map((d) => {
            const active = linkDensity === d.id;
            return (
              <button
                key={d.id}
                type="button"
                onClick={() => setLinkDensity(d.id)}
                style={{
                  flex: 1,
                  padding: "6px 0",
                  border: "none",
                  borderRadius: 7,
                  background: active ? "white" : "transparent",
                  boxShadow: active ? "0 1px 3px rgba(15,23,42,0.08)" : "none",
                  color: active ? "#0b1020" : "#6b75a3",
                  fontSize: 11.5,
                  fontWeight: active ? 600 : 400,
                  cursor: "pointer",
                  transition: "all 0.15s",
                }}
              >
                {d.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

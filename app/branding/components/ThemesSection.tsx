"use client";

import { memo, useMemo, useState } from "react";
import {
  BRANDING_THEMES,
  DEFAULT_THEME,
  type BrandingTheme,
} from "@/app/constants/brandingThemes";
import { BRANDING_FONT_SERIF } from "@/app/constants/brandingFonts";
import { BrandingConfirmModal } from "./BrandingConfirmModal";

interface ThemesSectionProps {
  selectedThemeId: string;
  displayName: string;
  handle: string;
  onSelect: (theme: BrandingTheme) => void;
}

type CategoryId =
  | "all"
  | "minimal"
  | "bold"
  | "editorial"
  | "playful"
  | "dark"
  | "pro";

const CATEGORIES: {
  id: CategoryId;
  label: string;
  icon?: React.ReactNode;
  filter?: (t: BrandingTheme) => boolean;
}[] = [
  {
    id: "all",
    label: "All themes",
    icon: (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 3l14 9-14 9V3z"/>
      </svg>
    ),
  },
  { id: "minimal", label: "Minimal", filter: (t) => t.tagType === "minimal" },
  { id: "bold", label: "Bold", filter: (t) => t.tagType === "bold" },
  { id: "editorial", label: "Editorial", filter: (t) => t.tagType === "editorial" },
  { id: "playful", label: "Playful", filter: (t) => t.tagType === "playful" },
  { id: "dark", label: "Dark", filter: (t) => t.screen.dark },
  {
    id: "pro",
    label: "Pro",
    filter: (t) => !!t.isPro,
    icon: (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 16.8 5.8 21.3l2.4-7.4L2 9.4h7.6z"/>
      </svg>
    ),
  },
];

const TAG_STYLES: Record<string, React.CSSProperties> = {
  popular: { background: "#f0f1ff", color: "#3b46e0" },
  new:     { background: "#fffbeb", color: "#d97706" },
  pro:     { background: "#2c1810", color: "#f5d77f" },
};
const TAG_STYLE_DEFAULT: React.CSSProperties = { background: "#eef0f7", color: "#6b75a3" };
function tagStyles(tagType?: BrandingTheme["tagType"]): React.CSSProperties {
  return (tagType && TAG_STYLES[tagType]) ?? TAG_STYLE_DEFAULT;
}

const ThemePreviewCard = memo(function ThemePreviewCard({
  theme,
  displayName,
  handle,
  selected,
  onSelect,
}: {
  theme: BrandingTheme;
  displayName: string;
  handle: string;
  selected: boolean;
  onSelect: () => void;
}) {
  const p = theme.preview;
  const shortName = displayName.split(" ").slice(0, 2).join(" ") || "Your Name";
  const initial = displayName.charAt(0).toUpperCase() || "?";
  const slug = handle || "handle";

  return (
    <button
      type="button"
      onClick={onSelect}
      style={{
        background: "white",
        border: `1px solid ${selected ? "#3b46e0" : "#eef0f7"}`,
        borderRadius: 18,
        overflow: "hidden",
        cursor: "pointer",
        textAlign: "left",
        padding: 0,
        boxShadow: selected
          ? "0 0 0 3px rgba(59,70,224,0.15), 0 4px 12px rgba(15,23,42,0.08)"
          : "none",
        transition: "all 0.2s ease",
        position: "relative",
      }}
      onMouseEnter={(e) => {
        if (!selected) {
          (e.currentTarget as HTMLButtonElement).style.borderColor = "#d6dae9";
          (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-2px)";
          (e.currentTarget as HTMLButtonElement).style.boxShadow =
            "0 4px 12px rgba(15,23,42,0.08)";
        }
      }}
      onMouseLeave={(e) => {
        if (!selected) {
          (e.currentTarget as HTMLButtonElement).style.borderColor = "#eef0f7";
          (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
          (e.currentTarget as HTMLButtonElement).style.boxShadow = "none";
        }
      }}
    >
      {selected && (
        <div
          aria-hidden
          style={{
            position: "absolute",
            top: 12,
            right: 12,
            width: 22,
            height: 22,
            background: "#3b46e0",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 4px 10px rgba(59,70,224,0.4)",
            zIndex: 2,
          }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>
      )}

      <div
        style={{
          aspectRatio: "4 / 3",
          padding: 18,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 6,
          background: p.bg,
          color: p.color,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: theme.id === "monochrome" || theme.id === "editorial" ? 4 : "50%",
            background: p.avatarBg,
            color: p.avatarColor,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 600,
            fontSize: 11,
            fontFamily: p.nameFont,
          }}
        >
          {initial}
        </div>
        <div
          style={{
            fontSize: 10,
            fontWeight: 600,
            textAlign: "center",
            lineHeight: 1.1,
            fontFamily: p.nameFont,
            fontStyle: p.nameFontStyle as React.CSSProperties["fontStyle"],
          }}
        >
          {shortName}
        </div>
        <div style={{ fontSize: 8, opacity: 0.7 }}>@{slug}</div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 4,
            width: "70%",
            marginTop: 4,
          }}
        >
          {["Official Website", "Portfolio"].map((label) => (
            <div
              key={label}
              style={{
                padding: "5px 8px",
                borderRadius: p.btnRadius ?? 6,
                fontSize: 8,
                fontWeight: 500,
                textAlign: "center",
                background: p.btnBg,
                border: p.btnBorder ? `1px solid ${p.btnBorder}` : undefined,
                color: p.btnColor,
              }}
            >
              {label}
            </div>
          ))}
        </div>
      </div>

      <div
        style={{
          padding: "12px 14px",
          borderTop: "1px solid #eef0f7",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span
          style={{
            fontSize: 13.5,
            fontWeight: 600,
            color: "#0b1020",
            letterSpacing: "-0.01em",
          }}
        >
          {theme.name}
        </span>
        {theme.tag && (
          <span
            style={{
              fontSize: 9.5,
              fontWeight: 600,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              padding: "2.5px 7px",
              borderRadius: 5,
              ...tagStyles(theme.tagType),
            }}
          >
            {theme.tagType === "new" ? "NEW" : theme.tagType === "pro" ? "PRO" : theme.tag}
          </span>
        )}
      </div>
    </button>
  );
});

export function ThemesSection({
  selectedThemeId,
  displayName,
  handle,
  onSelect,
}: ThemesSectionProps) {
  const [category, setCategory] = useState<CategoryId>("all");
  const [proModalTheme, setProModalTheme] = useState<BrandingTheme | null>(null);

  const handleThemeClick = (theme: BrandingTheme) => {
    if (theme.isPro) {
      setProModalTheme(theme);
      return;
    }
    onSelect(theme);
  };

  const selectedTheme =
    BRANDING_THEMES.find((t) => t.id === selectedThemeId) ?? DEFAULT_THEME;

  const filteredThemes = useMemo(() => {
    const cat = CATEGORIES.find((c) => c.id === category);
    if (!cat?.filter) return BRANDING_THEMES;
    return BRANDING_THEMES.filter(cat.filter);
  }, [category]);

  const categoryCounts = useMemo(() => {
    const counts: Record<CategoryId, number> = {
      all: BRANDING_THEMES.length,
      minimal: 0,
      bold: 0,
      editorial: 0,
      playful: 0,
      dark: 0,
      pro: 0,
    };
    for (const c of CATEGORIES) {
      if (c.id === "all" || !c.filter) continue;
      counts[c.id] = BRANDING_THEMES.filter(c.filter).length;
    }
    return counts;
  }, []);

  return (
    <div>
      <div
        style={{
          display: "flex",
          gap: 8,
          marginBottom: 16,
          flexWrap: "wrap",
        }}
      >
        {CATEGORIES.map((cat) => {
          const active = category === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setCategory(cat.id)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 7,
                fontSize: 12.5,
                fontWeight: 500,
                color: active ? "white" : "#6b75a3",
                padding: "7px 13px",
                borderRadius: 99,
                cursor: "pointer",
                background: active ? "#0b1020" : "white",
                border: `1px solid ${active ? "#0b1020" : "#eef0f7"}`,
                fontFamily: "inherit",
                transition: "all 0.15s ease",
              }}
            >
              {cat.icon}
              {cat.label}
              <span
                style={{
                  fontSize: 11,
                  padding: "1px 6px",
                  borderRadius: 99,
                  background: active ? "rgba(255,255,255,0.2)" : "#eef0f7",
                  color: active ? "white" : "#6b75a3",
                }}
              >
                {categoryCounts[cat.id]}
              </span>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {filteredThemes.map((theme) => (
          <ThemePreviewCard
            key={theme.id}
            theme={theme}
            displayName={displayName}
            handle={handle}
            selected={selectedThemeId === theme.id}
            onSelect={() => handleThemeClick(theme)}
          />
        ))}
      </div>

      <BrandingConfirmModal
        open={proModalTheme !== null}
        onClose={() => setProModalTheme(null)}
        icon="info"
        title={
          proModalTheme
            ? `${proModalTheme.name} is a Pro theme`
            : ""
        }
        body="Upgrade to Linkhub Pro to unlock premium themes, custom fonts, and advanced analytics."
        confirmText="Upgrade now"
        confirmStyle="primary"
        onConfirm={() => {
          /* upgrade flow */
        }}
      />

      <div
        style={{
          marginTop: 20,
          background: "linear-gradient(135deg, white, #f4f6fc)",
          border: "1px solid #eef0f7",
          borderRadius: 18,
          padding: "18px 20px",
          display: "grid",
          gridTemplateColumns: "auto 1fr auto",
          alignItems: "center",
          gap: 20,
        }}
      >
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: 12,
            background: "linear-gradient(135deg, #eef0f7, #f0f1ff)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#3b46e0",
          }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l7-7 3 3-7 7-3-3z"/>
            <path strokeLinecap="round" strokeLinejoin="round" d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5zM2 2l7.586 7.586"/>
            <circle cx="11" cy="11" r="2"/>
          </svg>
        </div>
        <div>
          <div
            style={{
              fontFamily: BRANDING_FONT_SERIF,
              fontStyle: "italic",
              fontSize: 18,
              color: "#0b1020",
              letterSpacing: "-0.01em",
            }}
          >
            Currently using{" "}
            <em style={{ color: "#3b46e0", fontStyle: "italic" }}>{selectedTheme.name}</em>
          </div>
          <p style={{ fontSize: 12.5, color: "#6b75a3", marginTop: 2 }}>
            Customize colors, fonts, and button shapes below.
          </p>
        </div>
        <button
          type="button"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 7,
            background: "white",
            border: "1px solid #eef0f7",
            color: "#1a2244",
            padding: "10px 14px",
            borderRadius: 99,
            fontFamily: "inherit",
            fontSize: 13,
            fontWeight: 500,
            cursor: "pointer",
            whiteSpace: "nowrap",
          }}
        >
          Open editor →
        </button>
      </div>
    </div>
  );
}

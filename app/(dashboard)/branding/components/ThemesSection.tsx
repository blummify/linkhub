"use client";

import { memo, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import {
  BRANDING_THEMES,
  type BrandingTheme,
} from "@/app/constants/brandingThemes";
import { BRANDING_FONT_SERIF } from "@/app/constants/brandingFonts";
import { BrandingConfirmModal } from "./BrandingConfirmModal";
import { getGradientById } from "@/app/constants/editorBackgroundGradients";
import { sendEditorLink } from "@/app/actions/profile";
import type { CustomTheme as CustomThemeRecord } from "@prisma/client";

function swatchStyle(theme: CustomThemeRecord): React.CSSProperties {
  if (theme.backgroundType === "gradient") {
    if (theme.backgroundValue.startsWith("solid:")) {
      return { background: theme.backgroundValue.replace("solid:", "") };
    }
    const grad = getGradientById(theme.backgroundValue);
    return { background: grad?.value ?? `linear-gradient(135deg, ${theme.accentColor}, #000)` };
  }
  return { background: theme.accentColor };
}

function relativeTime(date: Date): string {
  const diff = (Date.now() - new Date(date).getTime()) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 86400 * 7) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(date).toLocaleDateString();
}

interface ThemesSectionProps {
  selectedThemeId: string;
  displayName: string;
  handle: string;
  onSelect: (theme: BrandingTheme) => void;
  /** Compact mode for narrow containers: scrollable pill row + 2-column grid */
  compact?: boolean;
  customThemes?: CustomThemeRecord[];
  activeCustomThemeId?: string | null;
  onApplyCustomTheme?: (id: string) => Promise<void>;
  onDeleteCustomTheme?: (id: string) => Promise<void>;
  onEditCustomTheme?: (theme: CustomThemeRecord) => void;
  applyingThemeId?: string | null;
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
  compact = false,
  customThemes = [],
  activeCustomThemeId = null,
  onApplyCustomTheme,
  onDeleteCustomTheme,
  onEditCustomTheme,
  applyingThemeId = null,
}: ThemesSectionProps) {
  const [category, setCategory] = useState<CategoryId>("all");
  const [proModalTheme, setProModalTheme] = useState<BrandingTheme | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [showHandoffSheet, setShowHandoffSheet] = useState(false);
  const [isHandoffClosing, setIsHandoffClosing] = useState(false);
  const [emailStatus, setEmailStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  function requestCloseHandoffSheet() { setIsHandoffClosing(true); }

  function handleHandoffSheetAnimEnd(e: React.AnimationEvent<HTMLDivElement>) {
    if (isHandoffClosing && e.animationName === "lhSheetOut") {
      setShowHandoffSheet(false);
      setIsHandoffClosing(false);
    }
  }

  const handleThemeClick = (theme: BrandingTheme) => {
    if (theme.isPro) {
      setProModalTheme(theme);
      return;
    }
    onSelect(theme);
  };

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
      {customThemes.length > 0 && (
        <div style={{ marginBottom: 28 }}>
          <div
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: "#6b75a3",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              marginBottom: 12,
            }}
          >
            My Themes
          </div>
          <div className={compact ? "grid grid-cols-2 gap-3" : "grid grid-cols-2 sm:grid-cols-3 gap-4"}>
            {customThemes.map((ct) => {
              const isActive = ct.id === activeCustomThemeId;
              const isApplying = ct.id === applyingThemeId;
              return (
                <div
                  key={ct.id}
                  style={{
                    background: "white",
                    border: `1px solid ${isActive ? "#3b46e0" : "#eef0f7"}`,
                    borderRadius: 18,
                    overflow: "hidden",
                    boxShadow: isActive
                      ? "0 0 0 3px rgba(59,70,224,0.15), 0 4px 12px rgba(15,23,42,0.08)"
                      : "none",
                    position: "relative",
                    transition: "all 0.2s ease",
                  }}
                >
                  {isActive && (
                    <div
                      style={{
                        position: "absolute",
                        top: 10,
                        right: 10,
                        background: "#3b46e0",
                        color: "white",
                        fontSize: 9.5,
                        fontWeight: 700,
                        letterSpacing: "0.06em",
                        textTransform: "uppercase",
                        padding: "2px 8px",
                        borderRadius: 99,
                        zIndex: 2,
                      }}
                    >
                      Active
                    </div>
                  )}

                  {/* Swatch */}
                  <div
                    style={{
                      height: 72,
                      ...swatchStyle(ct),
                      position: "relative",
                      overflow: "hidden",
                    }}
                  >
                    {ct.backgroundType === "image" && ct.backgroundValue && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={ct.backgroundValue}
                        alt=""
                        loading="lazy"
                        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    )}
                    {ct.backgroundType === "video" && (
                      <div
                        style={{
                          position: "absolute",
                          inset: 0,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5">
                          <polygon points="5 3 19 12 5 21 5 3"/>
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Info row */}
                  <div style={{ padding: "10px 14px 12px" }}>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: "#0b1020",
                        marginBottom: 2,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {ct.name}
                    </div>
                    <div style={{ fontSize: 11, color: "#9ba3c0", marginBottom: 10 }}>
                      {relativeTime(ct.createdAt)}
                    </div>

                    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                      <button
                        type="button"
                        disabled={isActive || isApplying}
                        onClick={() => onApplyCustomTheme?.(ct.id)}
                        style={{
                          flex: 1,
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 5,
                          fontSize: 12,
                          fontWeight: 600,
                          padding: "7px 0",
                          borderRadius: 8,
                          border: "none",
                          cursor: isActive || isApplying ? "default" : "pointer",
                          background: isActive ? "#eef0f7" : "linear-gradient(180deg, #3b46e0, #2a37c0)",
                          color: isActive ? "#9ba3c0" : "white",
                          fontFamily: "inherit",
                          transition: "opacity 0.15s",
                          opacity: isApplying ? 0.7 : 1,
                        }}
                      >
                        {isApplying ? (
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="animate-spin">
                            <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                          </svg>
                        ) : isActive ? "Active" : "Apply"}
                      </button>
                      <button
                        type="button"
                        onClick={() => onEditCustomTheme?.(ct)}
                        title="Edit in editor"
                        style={{
                          width: 30,
                          height: 30,
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          borderRadius: 8,
                          border: "1px solid #eef0f7",
                          background: "white",
                          color: "#9ba3c0",
                          cursor: "pointer",
                          flexShrink: 0,
                          transition: "all 0.15s",
                          padding: 0,
                        }}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLButtonElement).style.color = "#3b46e0";
                          (e.currentTarget as HTMLButtonElement).style.borderColor = "#c7d0ff";
                          (e.currentTarget as HTMLButtonElement).style.background = "#f0f1ff";
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLButtonElement).style.color = "#9ba3c0";
                          (e.currentTarget as HTMLButtonElement).style.borderColor = "#eef0f7";
                          (e.currentTarget as HTMLButtonElement).style.background = "white";
                        }}
                      >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                        </svg>
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteId(ct.id)}
                        title="Delete theme"
                        style={{
                          width: 30,
                          height: 30,
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          borderRadius: 8,
                          border: "1px solid #eef0f7",
                          background: "white",
                          color: "#9ba3c0",
                          cursor: "pointer",
                          flexShrink: 0,
                          transition: "all 0.15s",
                          padding: 0,
                        }}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLButtonElement).style.color = "#dc2626";
                          (e.currentTarget as HTMLButtonElement).style.borderColor = "#fecaca";
                          (e.currentTarget as HTMLButtonElement).style.background = "#fef2f2";
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLButtonElement).style.color = "#9ba3c0";
                          (e.currentTarget as HTMLButtonElement).style.borderColor = "#eef0f7";
                          (e.currentTarget as HTMLButtonElement).style.background = "white";
                        }}
                      >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="3 6 5 6 21 6"/>
                          <path strokeLinecap="round" d="M19 6l-1 14H6L5 6"/>
                          <path strokeLinecap="round" d="M10 11v6M14 11v6"/>
                          <path strokeLinecap="round" d="M9 6V4h6v2"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <BrandingConfirmModal
        open={confirmDeleteId !== null}
        onClose={() => setConfirmDeleteId(null)}
        icon="warn"
        title="Delete this theme?"
        body={
          confirmDeleteId === activeCustomThemeId
            ? "This theme is currently active. Deleting it will remove it from your library, but your public page will keep its current appearance until you apply a different theme."
            : "This action cannot be undone. The theme will be permanently removed from your library."
        }
        confirmText="Delete"
        confirmStyle="danger"
        onConfirm={async () => {
          if (confirmDeleteId) await onDeleteCustomTheme?.(confirmDeleteId);
          setConfirmDeleteId(null);
        }}
      />

      <div
        style={{
          display: "flex",
          gap: 8,
          marginBottom: 16,
          flexWrap: compact ? "nowrap" : "wrap",
          overflowX: compact ? "auto" : "visible",
          scrollbarWidth: "none",
          paddingBottom: compact ? 4 : 0,
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
                flexShrink: 0,
                whiteSpace: "nowrap",
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

      <div className={compact ? "grid grid-cols-2 gap-3" : "grid grid-cols-2 sm:grid-cols-3 gap-4"}>
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

      {/* Pro custom theme banner */}
      <div
        style={{
          marginTop: 20,
          borderRadius: 18,
          overflow: "hidden",
          position: "relative",
          background: "linear-gradient(135deg, #0e1340 0%, #1b2580 60%, #2d1f6e 100%)",
          padding: "20px 20px 20px 20px",
        }}
      >
        {/* Subtle radial glow */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            background: "radial-gradient(ellipse at 80% 20%, rgba(109,120,255,0.35) 0%, transparent 65%)",
            pointerEvents: "none",
          }}
        />

        {/* Star-dot accent */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            top: 14,
            right: 18,
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.35)",
            boxShadow: "10px 18px 0 rgba(255,255,255,0.15), -8px 28px 0 rgba(255,255,255,0.1)",
          }}
        />

        <div style={{ position: "relative", display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Badge */}
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
              background: "rgba(255,255,255,0.12)",
              border: "1px solid rgba(255,255,255,0.18)",
              borderRadius: 99,
              padding: "3px 10px 3px 7px",
              fontSize: 11,
              fontWeight: 600,
              color: "rgba(255,255,255,0.9)",
              letterSpacing: "0.06em",
              width: "fit-content",
            }}
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6L12 2z"/>
            </svg>
            PRO
          </span>

          {/* Heading + subtext */}
          <div>
            <div
              className="text-[17px] lg:text-[20px]"
              style={{
                fontFamily: BRANDING_FONT_SERIF,
                fontStyle: "italic",
                color: "white",
                letterSpacing: "-0.02em",
                lineHeight: 1.25,
                marginBottom: 6,
              }}
            >
              Create a custom theme
            </div>
            <p style={{ fontSize: 12.5, color: "rgba(180,190,255,0.85)", lineHeight: 1.5, margin: 0 }}>
              Upload your own background, add effects, and build a fully custom look with the Open Editor.
            </p>
          </div>

          {/* Feature pills */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {["Custom backgrounds", "Visual effects", "21 themes"].map((f) => (
              <span
                key={f}
                style={{
                  fontSize: 11.5,
                  color: "rgba(200,210,255,0.9)",
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  borderRadius: 6,
                  padding: "3px 9px",
                }}
              >
                {f}
              </span>
            ))}
          </div>

          {/* CTA — mobile: handoff sheet; desktop: open editor */}
          <div>
            {/* Mobile button */}
            <button
              type="button"
              className="inline-flex items-center justify-center w-full lg:hidden"
              onClick={() => setShowHandoffSheet(true)}
              style={{
                gap: 7,
                background: "white",
                color: "#1a2244",
                borderRadius: 10,
                padding: "10px 18px",
                fontSize: 13,
                fontWeight: 600,
                border: 0,
                fontFamily: "inherit",
                cursor: "pointer",
                boxShadow: "0 4px 16px -4px rgba(0,0,0,0.35)",
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l7-7 3 3-7 7-3-3z"/>
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5zM2 2l7.586 7.586"/>
                <circle cx="11" cy="11" r="2"/>
              </svg>
              Design it on desktop
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </button>

            {/* Mobile desktop hint */}
            <p
              className="flex items-center lg:hidden"
              style={{
                marginTop: 7,
                gap: 5,
                fontSize: 11,
                color: "rgba(180,190,255,0.55)",
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="3" width="20" height="14" rx="2"/>
                <path strokeLinecap="round" d="M8 21h8M12 17v4"/>
              </svg>
              Best on desktop
            </p>

            {/* Desktop link */}
            <Link
              href="/branding/editor"
              className="hidden lg:inline-flex w-fit"
              style={{
                alignItems: "center",
                justifyContent: "center",
                gap: 7,
                background: "white",
                color: "#1a2244",
                borderRadius: 10,
                padding: "10px 18px",
                fontSize: 13,
                fontWeight: 600,
                textDecoration: "none",
                boxShadow: "0 4px 16px -4px rgba(0,0,0,0.35)",
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l7-7 3 3-7 7-3-3z"/>
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5zM2 2l7.586 7.586"/>
                <circle cx="11" cy="11" r="2"/>
              </svg>
              Open the Editor
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </Link>
          </div>
        </div>
      </div>

      {/* ── Mobile handoff sheet — editor lives on desktop ── */}
      {mounted && showHandoffSheet && createPortal(
        <div
          className="fixed inset-0 z-[100] flex items-end"
          style={{
            opacity: isHandoffClosing ? 0 : 1,
            transition: `opacity ${isHandoffClosing ? "var(--motion-sheet-out) var(--ease-in)" : "var(--motion-base) var(--ease-standard)"}`,
          }}
          onClick={requestCloseHandoffSheet}
        >
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div
            className="relative w-full bg-white"
            style={{
              borderRadius: "24px 24px 0 0",
              animation: isHandoffClosing
                ? "lhSheetOut var(--motion-sheet-out) var(--ease-in) forwards"
                : "lhSheetIn var(--motion-sheet-in) var(--ease-out) both",
              maxHeight: "min(90dvh, 90vh)",
              overflow: "auto",
            }}
            onClick={(e) => e.stopPropagation()}
            onAnimationEnd={handleHandoffSheetAnimEnd}
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-1 shrink-0">
              <div style={{ width: 36, height: 4, borderRadius: 99, background: "#d6dae9" }} />
            </div>

            {/* Content */}
            <div
              style={{
                padding: "16px 24px",
                paddingBottom: "calc(24px + env(safe-area-inset-bottom, 0px))",
                display: "flex",
                flexDirection: "column",
                gap: 0,
              }}
            >
              {/* Icon */}
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 14,
                  background: "linear-gradient(135deg, #0e1340 0%, #1b2580 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 16,
                  flexShrink: 0,
                }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="rgba(180,190,255,0.9)" strokeWidth="1.75">
                  <rect x="2" y="3" width="20" height="14" rx="2"/>
                  <path strokeLinecap="round" d="M8 21h8M12 17v4"/>
                </svg>
              </div>

              {/* Title */}
              <h2
                style={{
                  fontFamily: BRANDING_FONT_SERIF,
                  fontStyle: "italic",
                  fontSize: 22,
                  color: "#0b1020",
                  letterSpacing: "-0.02em",
                  lineHeight: 1.2,
                  margin: 0,
                  marginBottom: 10,
                }}
              >
                Your theme studio lives on desktop
              </h2>

              {/* Body */}
              <p
                style={{
                  fontSize: 14,
                  color: "#6b75a3",
                  lineHeight: 1.6,
                  margin: 0,
                  marginBottom: 24,
                }}
              >
                The custom editor — backgrounds, effects, and full styling — needs a bigger canvas than a phone. Open Linkhub on a computer to build your custom theme.
              </p>

              {/* Primary: Email me the link */}
              <button
                type="button"
                disabled={emailStatus === "sending" || emailStatus === "sent"}
                onClick={async () => {
                  if (emailStatus !== "idle" && emailStatus !== "error") return;
                  setEmailStatus("sending");
                  const result = await sendEditorLink();
                  setEmailStatus("error" in result ? "error" : "sent");
                }}
                style={{
                  width: "100%",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  background:
                    emailStatus === "sent"
                      ? "linear-gradient(180deg, #16a34a, #15803d)"
                      : "linear-gradient(180deg, #3b46e0, #2a37c0)",
                  color: "white",
                  border: 0,
                  borderRadius: 12,
                  padding: "13px 18px",
                  fontSize: 14,
                  fontWeight: 600,
                  fontFamily: "inherit",
                  cursor: emailStatus === "sent" || emailStatus === "sending" ? "default" : "pointer",
                  opacity: emailStatus === "sending" ? 0.8 : 1,
                  boxShadow: "0 4px 18px -4px rgba(59,70,224,0.45)",
                  transition: "background 0.2s",
                  marginBottom: 10,
                }}
              >
                {emailStatus === "sending" ? (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="animate-spin">
                    <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                  </svg>
                ) : emailStatus === "sent" ? (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                ) : (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                  </svg>
                )}
                {emailStatus === "sent"
                  ? "Email sent!"
                  : emailStatus === "error"
                  ? "Couldn't send — tap to retry"
                  : "Email me the link"}
              </button>

              {/* Secondary: Copy link */}
              <button
                type="button"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(
                      `${window.location.origin}/branding/editor`
                    );
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  } catch {}
                }}
                style={{
                  width: "100%",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  background: "white",
                  color: copied ? "#16a34a" : "#1a2244",
                  border: `1px solid ${copied ? "#bbf7d0" : "#d6dae9"}`,
                  borderRadius: 12,
                  padding: "13px 18px",
                  fontSize: 14,
                  fontWeight: 600,
                  fontFamily: "inherit",
                  cursor: "pointer",
                  transition: "color 0.2s, border-color 0.2s",
                  marginBottom: 16,
                }}
              >
                {copied ? (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                ) : (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="9" y="9" width="13" height="13" rx="2"/>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
                  </svg>
                )}
                {copied ? "Copied!" : "Copy link"}
              </button>

              {/* Dismiss */}
              <button
                type="button"
                onClick={requestCloseHandoffSheet}
                style={{
                  background: "none",
                  border: 0,
                  fontSize: 13.5,
                  color: "#9ba3c0",
                  fontFamily: "inherit",
                  cursor: "pointer",
                  padding: "6px 0",
                  textAlign: "center",
                  width: "100%",
                }}
              >
                Maybe later
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

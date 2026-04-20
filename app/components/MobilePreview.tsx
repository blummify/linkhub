"use client";

import React from "react";
import { bodyFontStack, headlineFontStack } from "../constants/previewFonts";

export interface AppearanceState {
  profileTitle: string;
  profileBio: string;
  profileLayout: string;
  themeId: string;
  wallpaperStyle: string;
  bgColor: string;
  textColor: string;
  buttonStyle: string;
  buttonShadow: string;
  buttonRoundness: string;
  /** Headline / profile title in preview */
  fontFamily: string;
  /** Bio + link rows in preview */
  bodyFontFamily: string;
  titleSize: "small" | "large";
  titleColor: string;
  footerStyle: "minimal" | "default" | "socials";
}

/** Demo defaults aligned with the Appearance / Links editor mock data */
export const DEFAULT_APPEARANCE: AppearanceState = {
  profileTitle: "@yourname",
  profileBio: "Digital Curator & Designer",
  profileLayout: "classic",
  themeId: "custom",
  wallpaperStyle: "fill",
  bgColor: "#fcfaff",
  textColor: "#1e293b",
  buttonStyle: "flat",
  buttonShadow: "none",
  buttonRoundness: "full",
  fontFamily: "Inter",
  bodyFontFamily: "Inter",
  titleSize: "small",
  titleColor: "#0f172a",
  footerStyle: "minimal",
};

export type PreviewLinkRow =
  | { kind: "label"; title: string }
  | {
      kind: "button";
      title: string;
      url?: string;
      icon?: string;
      accent?: boolean;
    };

const DEFAULT_LINK_ROWS: PreviewLinkRow[] = [];

/** Maps editor values (`solid` legacy) to preview link-button variants */
export function normalizePreviewButtonStyle(s: string): "flat" | "rounded" | "outline" | "shadow" {
  if (s === "solid") return "flat";
  if (s === "flat" || s === "rounded" || s === "outline" || s === "shadow") return s;
  return "flat";
}

function previewTypographyVars(appearance: AppearanceState): React.CSSProperties {
  return {
    ["--preview-headline-font" as string]: headlineFontStack(appearance.fontFamily),
    ["--preview-body-font" as string]: bodyFontStack(appearance.bodyFontFamily),
  };
}

function previewTypographyCss(): string {
  return `
            .preview-shell .preview-headline { font-family: var(--preview-headline-font, inherit); }
            .preview-shell .preview-body-text,
            .preview-shell .preview-label,
            .preview-shell .preview-link-title { font-family: var(--preview-body-font, inherit); }
          `;
}

function outlineBorderForTheme(themeId: string): string {
  if (themeId === "midnight-oasis") return "rgba(255,255,255,0.28)";
  if (themeId === "sunset-glow") return "rgba(251, 146, 60, 0.45)";
  if (themeId === "bliss") return "rgba(126, 34, 150, 0.35)";
  if (themeId === "agate") return "rgba(14, 165, 233, 0.35)";
  return "rgba(15, 23, 42, 0.2)";
}

function previewCardButtonStyleCss(appearance: AppearanceState): string {
  const bs = normalizePreviewButtonStyle(appearance.buttonStyle);
  if (bs !== "outline") return "";
  const border = outlineBorderForTheme(appearance.themeId);
  return `
            .preview-card-btn[data-preview-btn="outline"] {
              background: transparent !important;
              border-width: 2px !important;
              border-style: solid !important;
              border-color: ${border} !important;
              box-shadow: none !important;
            }
          `;
}

function phoneFrameBackground(appearance: AppearanceState): React.CSSProperties {
  const { themeId, bgColor } = appearance;
  if (themeId === "agate") {
    return {
      backgroundColor: "#0ea5e9",
      backgroundImage: "linear-gradient(to bottom right, #22d3ee, #2563eb)",
    };
  }
  if (themeId === "bliss") {
    return {
      backgroundImage: "linear-gradient(to bottom right, #fbcfe8, #d8b4fe)",
    };
  }
  if (themeId === "indigo-mint") {
    return {
      backgroundImage: "linear-gradient(to bottom right, #fbf8ff, #f4f2fc)",
    };
  }
  if (themeId === "sunset-glow") {
    return {
      backgroundImage: "linear-gradient(to bottom right, #fff5f0, #fff1e0)",
    };
  }
  if (themeId === "midnight-oasis") {
    return {
      backgroundImage: "linear-gradient(to bottom right, #1a1b22, #2f3037)",
    };
  }
  if (themeId === "cloud-white") {
    return { backgroundColor: "#ffffff" };
  }
  return { backgroundColor: bgColor };
}

function previewInjectedCss(appearance: AppearanceState): string {
  const { themeId, textColor } = appearance;
  if (themeId === "agate") {
    return `
            .preview-shell { color: ${textColor}; }
            .preview-card {
              background: rgba(255,255,255,0.95);
              color: var(--color-primary, #1f33aa);
              border: 1px solid rgb(248 250 252);
            }
            .preview-label { color: #334155; }
            .preview-link-title { color: #0f172a; }
          `;
  }
  if (themeId === "bliss") {
    return `
            .preview-shell { color: #701a75; }
            .preview-card {
              background: rgba(255,255,255,0.95);
              color: #701a75;
              border: 1px solid rgb(248 250 252);
            }
            .preview-label { color: #86198f; }
            .preview-link-title { color: #701a75; }
          `;
  }
  if (themeId === "air") {
    return `
            .preview-shell { color: #0f172a; }
            .preview-card {
              background: #ffffff;
              color: var(--color-primary, #1f33aa);
              border: 1px solid #e2e8f0;
            }
            .preview-label { color: #334155; }
            .preview-link-title { color: #0f172a; }
          `;
  }
  if (themeId === "indigo-mint") {
    return `
            .preview-shell { color: ${textColor}; }
            .preview-card {
              background: rgba(255,255,255,0.96);
              color: #1f33aa;
              border: 1px solid #e2e8f0;
            }
            .preview-label { color: #475569; }
            .preview-link-title { color: #0f172a; }
          `;
  }
  if (themeId === "sunset-glow") {
    return `
            .preview-shell { color: ${textColor}; }
            .preview-card {
              background: rgba(255,255,255,0.92);
              color: #c2410c;
              border: 1px solid #fed7aa;
            }
            .preview-label { color: #9a3412; }
            .preview-link-title { color: #431407; }
          `;
  }
  if (themeId === "midnight-oasis") {
    return `
            .preview-shell { color: ${textColor}; }
            .preview-card {
              background: rgba(255,255,255,0.08);
              color: #e2e8f0;
              border: 1px solid rgba(255,255,255,0.12);
            }
            .preview-label { color: #94a3b8; }
            .preview-link-title { color: #f1f5f9; }
          `;
  }
  if (themeId === "cloud-white") {
    return `
            .preview-shell { color: ${textColor}; }
            .preview-card {
              background: #f8fafc;
              color: #1f33aa;
              border: 1px solid #e2e8f0;
            }
            .preview-label { color: #64748b; }
            .preview-link-title { color: #0f172a; }
          `;
  }
  return `
            .preview-shell { color: ${textColor}; }
            .preview-card {
              background: rgba(255,255,255,0.95);
              color: var(--color-primary, #1f33aa);
              border: 1px solid rgb(248 250 252);
            }
            .preview-label { color: #334155; }
            .preview-link-title { color: #0f172a; }
          `;
}

export interface MobilePreviewProps {
  appearance: AppearanceState;
  /** URL shown in the share pill (e.g. linktr.ee/handle) */
  publicUrl?: string;
  profileImageUrl?: string;
  /** Material symbol name when `profileImageUrl` is not set */
  profileIcon?: string;
  /** Square avatar (e.g. Appearance screenshot) vs circle */
  profileAvatarShape?: "rounded" | "circle";
  linkRows?: PreviewLinkRow[];
  /** Linktree-style bar + “Live Preview” heading above the device */
  showHeaderChrome?: boolean;
  headerTitle?: string;
  headerSubtitle?: string;
  /** Pulsing status pill below the device */
  syncLabel?: string | null;
  /** Ambient glow behind the phone */
  showAmbientGlow?: boolean;
  /** Opens share / copy flow when the URL pill is used (e.g. user admin) */
  onShareBarClick?: () => void;
  /** Show the URL pill row (link icon + public URL + optional share + tune). Off on Preferences / Appearance. */
  showPublicUrlBar?: boolean;
  /** Show the trailing share glyph in the URL pill */
  showUrlBarShareIcon?: boolean;
  /** Show the tune/settings button beside the URL bar */
  showHeaderTuneButton?: boolean;
  className?: string;
  /** Extra vertical spacing for link rows inside the device (e.g. `/links` editor) */
  linkDensity?: "default" | "relaxed";
  /** Show the Report / Privacy / Join button at the bottom of the phone screen */
  showDeviceFooter?: boolean;
}

export const MobilePreview: React.FC<MobilePreviewProps> = ({
  appearance,
  publicUrl = "linktr.ee/blummify",
  profileImageUrl = "",
  profileIcon = "person",
  profileAvatarShape = "circle",
  linkRows = DEFAULT_LINK_ROWS,
  showHeaderChrome = true,
  headerTitle = "Live Preview",
  headerSubtitle = "Real-time profile updates",
  syncLabel = null,
  showAmbientGlow = true,
  onShareBarClick,
  showPublicUrlBar = true,
  showUrlBarShareIcon = true,
  showHeaderTuneButton = true,
  className = "",
  linkDensity = "default",
  showDeviceFooter = false,
}) => {
  const rows = linkRows.length ? linkRows : DEFAULT_LINK_ROWS;
  const slug = appearance.profileTitle.replace(/^@/, "") || "profile";
  const relaxed = linkDensity === "relaxed";
  const linkBtnStyle = normalizePreviewButtonStyle(appearance.buttonStyle);
  const linkCardRadius = linkBtnStyle === "rounded" ? "rounded-[1.75rem]" : "rounded-2xl";
  const linkCardShadow =
    linkBtnStyle === "outline"
      ? "shadow-none ring-0"
      : linkBtnStyle === "shadow"
        ? relaxed
          ? "shadow-2xl shadow-black/25 ring-0 dark:shadow-black/50"
          : "shadow-xl shadow-black/20 ring-0"
        : relaxed
          ? `shadow-md ring-1 ${
              appearance.themeId === "midnight-oasis"
                ? "ring-white/10"
                : "ring-slate-200/90 dark:ring-slate-600/50"
            }`
          : "shadow-sm";

  return (
    <div className={`flex flex-col items-center w-full min-w-0 ${className}`}>
      {showHeaderChrome && (
        <>
          {showPublicUrlBar && (
            <div className={`flex items-center gap-3 w-full max-w-[320px] ${relaxed ? "mb-7" : "mb-6"}`}>
              <div
                role={onShareBarClick ? "button" : undefined}
                tabIndex={onShareBarClick ? 0 : undefined}
                onClick={onShareBarClick}
                onKeyDown={
                  onShareBarClick
                    ? (e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          onShareBarClick();
                        }
                      }
                    : undefined
                }
                className={`flex-1 bg-surface-container-lowest border border-outline-variant/60 rounded-full py-3 px-5 flex items-center min-w-0 shadow-lg shadow-on-surface/5 ${
                  showUrlBarShareIcon ? "justify-between" : "justify-start gap-2"
                } ${onShareBarClick ? "cursor-pointer hover:border-primary/40 transition-colors" : ""}`}
              >
                <div className="flex items-center gap-2 overflow-hidden min-w-0">
                  <span className="material-symbols-outlined text-[18px] text-on-surface-variant/50 shrink-0">
                    link
                  </span>
                  <span className="text-[11px] font-bold text-on-surface-variant truncate">{publicUrl}</span>
                </div>
                {showUrlBarShareIcon && (
                  <span className="material-symbols-outlined text-[18px] text-on-surface-variant/60 shrink-0">ios_share</span>
                )}
              </div>
              {showHeaderTuneButton && (
                <button
                  type="button"
                  className="w-11 h-11 shrink-0 bg-surface-container-lowest border border-outline-variant/60 rounded-xl flex items-center justify-center shadow-lg shadow-on-surface/5 hover:bg-surface transition-all active:scale-95"
                  aria-label="Preview settings"
                >
                  <span className="material-symbols-outlined text-[20px] text-on-surface-variant">tune</span>
                </button>
              )}
            </div>
          )}

          {(headerTitle || headerSubtitle) && (
            <div
              className={`flex flex-col items-center text-center px-2 ${relaxed ? "mb-8" : "mb-6"}`}
            >
              <h2 className="text-base font-black text-on-surface tracking-tight">{headerTitle}</h2>
              <p className="text-[11px] text-on-surface-variant font-medium italic">{headerSubtitle}</p>
            </div>
          )}
        </>
      )}

      <div className={`relative w-full flex justify-center px-1 ${relaxed ? "py-1" : ""}`}>
        {showAmbientGlow && (
          <div className="pointer-events-none absolute -inset-10 bg-primary/10 blur-3xl rounded-full z-0 opacity-50" aria-hidden />
        )}

        <div
          className={`relative z-10 mx-auto w-full max-w-[320px] aspect-[320/560] sm:aspect-auto sm:h-[560px] sm:w-[320px] bg-slate-950 rounded-[2.5rem] sm:rounded-[3.5rem] p-2.5 ring-[8px] sm:ring-[10px] ring-slate-900 border border-slate-800/50 ${
            relaxed
              ? "shadow-[0px_50px_100px_-24px_rgba(0,0,0,0.35)] dark:shadow-[0px_50px_100px_-20px_rgba(0,0,0,0.6)]"
              : "shadow-[0px_60px_100px_-20px_rgba(0,0,0,0.2)]"
          }`}
        >
          <div className="absolute top-4 left-1/2 -translate-x-1/2 w-24 h-6 bg-slate-950 rounded-full z-20 border border-slate-800/30" />

          <div
            className={`w-full h-full rounded-[2.2rem] sm:rounded-[3rem] overflow-hidden relative flex flex-col min-h-0 pt-14 sm:pt-16 pb-4 sm:pb-5 transition-all duration-700 ${
              relaxed ? "px-5 sm:px-6" : "px-4 sm:px-5"
            }`}
            style={{ ...phoneFrameBackground(appearance), ...previewTypographyVars(appearance) }}
          >
            <style>{previewInjectedCss(appearance)}</style>
            <style>{previewCardButtonStyleCss(appearance)}</style>
            <style>{previewTypographyCss()}</style>

            {/* Scroll area sized to content (capped) so short profiles don’t leave a huge gap above the footer */}
            <div className="overflow-y-auto overflow-x-hidden scrollbar-hide pr-1 preview-shell min-h-0 w-full shrink-0 max-h-[calc(100%-6rem)]">
              <div className="flex flex-col items-center text-center pb-1">
                <div
                  className={`overflow-hidden shadow-xl flex items-center justify-center ${
                    appearance.themeId === "midnight-oasis"
                      ? "shadow-black/30 border border-white/10 ring-4 ring-white/10"
                      : "shadow-slate-200/50 border border-slate-50 ring-4 ring-white/50"
                  } ${
                    relaxed ? "mb-5 sm:mb-7" : "mb-4 sm:mb-6"
                  } ${
                    profileAvatarShape === "rounded" ? "w-20 h-20 rounded-3xl" : "w-20 h-20 rounded-full"
                  } ${
                    appearance.themeId === "air"
                      ? "bg-slate-100"
                      : appearance.themeId === "midnight-oasis"
                        ? "bg-slate-800/60"
                        : "bg-white"
                  }`}
                >
                  {profileImageUrl ? (
                    <img src={profileImageUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span
                      className={`material-symbols-outlined text-4xl ${
                        appearance.themeId === "bliss"
                          ? "text-fuchsia-600"
                          : appearance.themeId === "midnight-oasis"
                            ? "text-sky-400"
                            : "text-primary"
                      }`}
                    >
                      {profileIcon}
                    </span>
                  )}
                </div>
                <h3
                  className={`preview-headline font-black tracking-tight mb-1 ${appearance.titleSize === "large" ? "text-xl" : "text-lg sm:text-xl"}`}
                  style={{ color: appearance.titleColor }}
                >
                  {appearance.profileTitle}
                </h3>
                <p
                  className={`preview-body-text text-[10px] sm:text-[11px] font-medium leading-relaxed px-2 opacity-80 max-w-[220px] ${
                    relaxed ? "mb-5 sm:mb-7" : "mb-6 sm:mb-8"
                  }`}
                >
                  {appearance.profileBio}
                </p>

                <div className={`w-full text-left ${relaxed ? "space-y-2.5 sm:space-y-3" : "space-y-2"}`}>
                  {rows.map((row, idx) =>
                    row.kind === "label" ? (
                      <div
                        key={`${row.title}-${idx}`}
                        className={`flex items-center justify-center px-1.5 ${relaxed ? "py-0.5" : ""}`}
                      >
                        <span className="preview-label text-[11px] font-semibold tracking-tight">{row.title}</span>
                      </div>
                    ) : (
                      <a
                        key={`${row.title}-${idx}`}
                        href={row.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        data-preview-btn={linkBtnStyle}
                        className={`preview-card preview-card-btn w-full px-2.5 sm:px-3 ${linkCardRadius} flex items-center justify-start hover:translate-x-0.5 transition-all ${row.url ? 'cursor-pointer' : 'cursor-default'} ${
                          relaxed ? "py-2 sm:py-2.5" : "py-2"
                        } ${linkCardShadow} ${row.accent ? "border-l-[3px] border-l-primary" : ""}`}
                      >
                        <div className="flex items-center gap-1.5 min-w-0">
                          {row.icon ? (
                            <span className="material-symbols-outlined text-[14px] opacity-70 shrink-0">{row.icon}</span>
                          ) : (
                            <div className="w-4 shrink-0" />
                          )}
                          <span className="preview-link-title font-bold text-[11px] leading-snug truncate">{row.title}</span>
                        </div>
                      </a>
                    ),
                  )}
                </div>
              </div>
            </div>

            {showDeviceFooter && (
              <div
                className={`pt-3 sm:pt-4 border-t flex flex-col items-center gap-2.5 sm:gap-3 shrink-0 ${
                  appearance.themeId === "midnight-oasis" ? "border-white/10" : "border-slate-100/80"
                }`}
              >
                <button
                  type="button"
                  className={`px-3 py-1 rounded-full font-bold text-[8px] sm:text-[9px] shadow-sm ${
                    appearance.themeId === "midnight-oasis"
                      ? "bg-white text-slate-900"
                      : "bg-slate-900 text-white"
                  }`}
                >
                  Join {slug} on Linktree
                </button>
                <div
                  className={`flex gap-3 text-[8px] sm:text-[9px] font-bold uppercase tracking-widest ${
                    appearance.themeId === "midnight-oasis" ? "text-slate-500" : "text-slate-300"
                  }`}
                >
                  <span>Report</span>
                  <span>Privacy</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {syncLabel != null && syncLabel !== "" && (
        <div
          className={`flex items-center justify-center gap-3 bg-surface-container-highest/60 backdrop-blur-md px-5 sm:px-6 py-2.5 rounded-full shadow-sm border border-surface-container-highest/40 w-full max-w-[320px] mx-auto ${
            relaxed ? "mt-10 sm:mt-12" : "mt-8 sm:mt-10"
          }`}
        >
          <div className="flex gap-1 shrink-0">
            <div className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
          </div>
          <span className="text-xs font-bold text-on-surface-variant tracking-wide truncate">{syncLabel}</span>
        </div>
      )}
    </div>
  );
};

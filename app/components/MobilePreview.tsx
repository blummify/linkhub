"use client";

import React from "react";

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
  fontFamily: string;
  titleSize: "small" | "large";
  titleColor: string;
  footerStyle: "minimal" | "default" | "socials";
}

/** Demo defaults aligned with the Appearance / Links editor mock data */
export const DEFAULT_APPEARANCE: AppearanceState = {
  profileTitle: "Alex Rivers",
  profileBio:
    "Professional Photographer & Creative Director based in Seattle. Capturing the essence of modern living.",
  profileLayout: "classic",
  themeId: "custom",
  wallpaperStyle: "fill",
  bgColor: "#fcfaff",
  textColor: "#1e293b",
  buttonStyle: "solid",
  buttonShadow: "none",
  buttonRoundness: "full",
  fontFamily: "Inter",
  titleSize: "small",
  titleColor: "#0f172a",
  footerStyle: "minimal",
};

export type PreviewLinkRow =
  | { kind: "label"; title: string }
  | {
      kind: "button";
      title: string;
      icon?: string;
      accent?: boolean;
    };

const DEFAULT_LINK_ROWS: PreviewLinkRow[] = [
  { kind: "label", title: "WhatsApp" },
  { kind: "button", title: "Official Website", accent: true },
  { kind: "button", title: "Portfolio Drop", accent: true, icon: "grid_view" },
];

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
  /** Show the trailing share glyph in the URL pill (hidden on Preferences / Appearance) */
  showUrlBarShareIcon?: boolean;
  /** Show the tune/settings button beside the URL bar (hidden on Preferences / Appearance) */
  showHeaderTuneButton?: boolean;
  className?: string;
  /** Extra vertical spacing for link rows inside the device (e.g. `/links` editor) */
  linkDensity?: "default" | "relaxed";
}

export const MobilePreview: React.FC<MobilePreviewProps> = ({
  appearance,
  publicUrl = "linktr.ee/blummify",
  profileImageUrl = "https://lh3.googleusercontent.com/aida-public/AB6AXuA4PxtiCvvdChx5rltV1QWgJOqNq6piD1-6Ei7usvNa6vEqtcJS14LJjz75FSALFuRLCOo0PeWiYTCWQG62g3U-sBgKkkTS8YLKuLQ5VXhayVh9HApiK6p0t3dHTTdwJ7qIltKK80bBabeACJ56gyTzodT-BxvGcpFh7nbolhTp9SrlFS4DSC2EcM-M062HDKFztAej-R7GT47dJReQ0J2iH6aWyNKUSJEss688VsS89wBvuGXxVJrQT0Sf7ComxHaSCEFSk4u1SlQa",
  profileIcon = "eco",
  profileAvatarShape = "circle",
  linkRows = DEFAULT_LINK_ROWS,
  showHeaderChrome = true,
  headerTitle = "Live Preview",
  headerSubtitle = "Real-time profile updates",
  syncLabel = null,
  showAmbientGlow = true,
  onShareBarClick,
  showUrlBarShareIcon = true,
  showHeaderTuneButton = true,
  className = "",
  linkDensity = "default",
}) => {
  const rows = linkRows.length ? linkRows : DEFAULT_LINK_ROWS;
  const slug = appearance.profileTitle.replace(/^@/, "") || "profile";
  const relaxed = linkDensity === "relaxed";

  return (
    <div className={`flex flex-col items-center w-full min-w-0 ${className}`}>
      {showHeaderChrome && (
        <>
          <div className={`flex items-center gap-3 w-full max-w-[320px] ${relaxed ? "mb-7" : "mb-6"}`}
          >
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

          <div
            className={`flex flex-col items-center text-center px-2 ${relaxed ? "mb-8" : "mb-6"}`}
          >
            <h2 className="text-base font-black text-on-surface tracking-tight">{headerTitle}</h2>
            <p className="text-[11px] text-on-surface-variant font-medium italic">{headerSubtitle}</p>
          </div>
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
            style={{
              backgroundColor:
                appearance.themeId === "agate"
                  ? "#0ea5e9"
                  : appearance.themeId === "bliss"
                    ? undefined
                    : appearance.bgColor,
              backgroundImage:
                appearance.themeId === "agate"
                  ? "linear-gradient(to bottom right, #22d3ee, #2563eb)"
                  : appearance.themeId === "bliss"
                    ? "linear-gradient(to bottom right, #fbcfe8, #d8b4fe)"
                    : undefined,
            }}
          >
            <style>{`
            .preview-shell { color: ${appearance.themeId === "air" ? "#0f172a" : appearance.themeId === "bliss" ? "#701a75" : appearance.textColor}; }
            .preview-card {
              background: ${appearance.themeId === "air" ? "#ffffff" : "rgba(255,255,255,0.95)"};
              color: ${appearance.themeId === "bliss" ? "#701a75" : "var(--color-primary, #1f33aa)"};
              border: ${appearance.themeId === "air" ? "1px solid #e2e8f0" : "1px solid rgb(248 250 252)"};
            }
          `}</style>

            {/* Scroll area sized to content (capped) so short profiles don’t leave a huge gap above the footer */}
            <div className="overflow-y-auto overflow-x-hidden scrollbar-hide pr-1 preview-shell min-h-0 w-full shrink-0 max-h-[calc(100%-6rem)]">
              <div className="flex flex-col items-center text-center pb-1">
                <div
                  className={`overflow-hidden shadow-xl shadow-slate-200/50 border border-slate-50 ring-4 ring-white/50 flex items-center justify-center ${
                    relaxed ? "mb-5 sm:mb-7" : "mb-4 sm:mb-6"
                  } ${
                    profileAvatarShape === "rounded" ? "w-20 h-20 rounded-3xl" : "w-20 h-20 rounded-full"
                  } ${appearance.themeId === "air" ? "bg-slate-100" : "bg-white"}`}
                >
                  {profileImageUrl ? (
                    <img src={profileImageUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className={`material-symbols-outlined text-4xl ${appearance.themeId === "bliss" ? "text-fuchsia-600" : "text-emerald-500"}`}>
                      {profileIcon}
                    </span>
                  )}
                </div>
                <h3
                  className={`font-black text-slate-800 tracking-tight mb-1 ${appearance.titleSize === "large" ? "text-xl" : "text-lg sm:text-xl"}`}
                  style={{ color: appearance.titleColor }}
                >
                  {appearance.profileTitle}
                </h3>
                <p
                  className={`text-[10px] sm:text-[11px] font-medium leading-relaxed px-2 opacity-80 max-w-[220px] ${
                    relaxed ? "mb-5 sm:mb-7" : "mb-6 sm:mb-8"
                  }`}
                >
                  {appearance.profileBio}
                </p>

                <div className={`w-full text-left ${relaxed ? "space-y-4 sm:space-y-5" : "space-y-3"}`}>
                  {rows.map((row, idx) =>
                    row.kind === "label" ? (
                      <div
                        key={`${row.title}-${idx}`}
                        className={`flex items-center justify-between px-2 ${relaxed ? "py-0.5" : ""}`}
                      >
                        <div className="w-6 shrink-0" />
                        <span className="text-[13px] font-bold text-slate-700 tracking-tight">{row.title}</span>
                        <span className="material-symbols-outlined text-slate-300 text-sm">more_vert</span>
                      </div>
                    ) : (
                      <div
                        key={`${row.title}-${idx}`}
                        className={`preview-card w-full px-4 sm:px-6 rounded-2xl flex items-center justify-between hover:translate-x-0.5 transition-all cursor-default ${
                          relaxed
                            ? "py-4 sm:py-[18px] shadow-md ring-1 ring-slate-200/90 dark:ring-slate-600/50"
                            : "py-3.5 shadow-sm"
                        } ${row.accent ? "border-l-[6px] border-l-primary" : ""}`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {row.icon ? (
                            <span className="material-symbols-outlined text-[18px] opacity-70 shrink-0">{row.icon}</span>
                          ) : (
                            <div className="w-6 shrink-0" />
                          )}
                          <span className="font-black text-[13px] truncate">{row.title}</span>
                        </div>
                        <span className="material-symbols-outlined text-slate-200 text-sm shrink-0">more_vert</span>
                      </div>
                    ),
                  )}
                </div>
              </div>
            </div>

            <div className="pt-3 sm:pt-4 border-t border-slate-100/80 flex flex-col items-center gap-2.5 sm:gap-3 shrink-0">
              <button
                type="button"
                className="bg-slate-900 text-white px-5 py-2 rounded-full font-black text-[10px] sm:text-[11px] shadow-sm"
              >
                Join {slug} on Linktree
              </button>
              <div className="flex gap-4 text-[9px] sm:text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                <span>Report</span>
                <span>Privacy</span>
              </div>
            </div>
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

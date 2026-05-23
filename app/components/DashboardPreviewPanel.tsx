"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import type { ManagedLink } from "../user-admin/components/types";
import { previewLinkBorderRadiusPx } from "@/app/constants/brandingButtonShapes";
import { APP_DOMAIN } from "@/lib/appConfig";
import { useLinksStore } from "@/store/linksStore";
import { useBrandingStore } from "@/store/brandingStore";
import {
  brandingPublicUrl,
  brandingStateToPreviewAppearance,
  getBrandingThemeById,
} from "@/lib/brandingState";

// ── Icon bg/fg per link type ──────────────────────────────────────────────────
const ICON_CFG: Record<string, { bg: string; fg: string }> = {
  website:   { bg: "linear-gradient(135deg,#eef1ff,#dbe2ff)", fg: "#2a37c0" },
  instagram: { bg: "linear-gradient(135deg,#ffe9f1,#ffd9e6)", fg: "#d6336c" },
  youtube:   { bg: "linear-gradient(135deg,#fff1f0,#ffd9d6)", fg: "#c0392b" },
  twitter:   { bg: "linear-gradient(135deg,#e9f3ff,#d2e6ff)", fg: "#1565d8" },
  spotify:   { bg: "linear-gradient(135deg,#e9fff0,#d2f5e3)", fg: "#1db954" },
};

function PhoneLinkIcon({ iconKey }: { iconKey?: string }) {
  const cfg = ICON_CFG[iconKey ?? ""] ?? ICON_CFG.website;
  return (
    <div
      style={{
        width: 22, height: 22, borderRadius: 6, flexShrink: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
        background: cfg.bg, color: cfg.fg,
      }}
    >
      {iconKey === "instagram" ? (
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="2" y="2" width="20" height="20" rx="5"/>
          <circle cx="12" cy="12" r="4"/>
          <circle cx="17.5" cy="6.5" r=".5" fill="currentColor"/>
        </svg>
      ) : iconKey === "youtube" ? (
        <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
          <path d="M22.54 6.42a2.78 2.78 0 00-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 001.46 6.42 29 29 0 001 12a29 29 0 00.46 5.58 2.78 2.78 0 001.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 001.95-1.96A29 29 0 0023 12a29 29 0 00-.46-5.58zM9.75 15.02V8.98L15.5 12z"/>
        </svg>
      ) : iconKey === "twitter" ? (
        <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      ) : iconKey === "spotify" ? (
        <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
        </svg>
      ) : (
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10"/>
          <path strokeLinecap="round" d="M2 12h20M12 2a15.3 15.3 0 010 20"/>
        </svg>
      )}
    </div>
  );
}

// ── Static social icons shown in the phone preview ────────────────────────────
const SOCIAL_ICONS = [
  {
    label: "Instagram",
    svg: (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="2" y="2" width="20" height="20" rx="5"/>
        <circle cx="12" cy="12" r="4"/>
        <circle cx="17.5" cy="6.5" r=".5" fill="currentColor"/>
      </svg>
    ),
  },
  {
    label: "Twitter",
    svg: (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
      </svg>
    ),
  },
  {
    label: "LinkedIn",
    svg: (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-4 0v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z"/>
        <circle cx="4" cy="4" r="2"/>
      </svg>
    ),
  },
  {
    label: "GitHub",
    svg: (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 00-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0020 4.77 5.07 5.07 0 0019.91 1S18.73.65 16 2.48a13.38 13.38 0 00-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 005 4.77a5.44 5.44 0 00-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 009 18.13V22"/>
      </svg>
    ),
  },
];

// ── Share network definitions ─────────────────────────────────────────────────
const SHARE_NETWORKS = [
  { key: "twitter",  label: "X / Twitter", bg: "#0f1419" },
  { key: "facebook", label: "Facebook",    bg: "#1877f2" },
  { key: "whatsapp", label: "WhatsApp",    bg: "#25d366" },
  { key: "linkedin", label: "LinkedIn",    bg: "#0a66c2" },
];

type ShareNetwork = typeof SHARE_NETWORKS[number];

function buildShareUrl(network: string, fullUrl: string): string {
  const encoded = encodeURIComponent(fullUrl);
  const text = encodeURIComponent("Check out my linkhub!");
  switch (network) {
    case "twitter":  return `https://twitter.com/intent/tweet?url=${encoded}&text=${text}`;
    case "facebook": return `https://www.facebook.com/sharer/sharer.php?u=${encoded}`;
    case "whatsapp": return `https://wa.me/?text=${text}%20${encoded}`;
    case "linkedin": return `https://www.linkedin.com/sharing/share-offsite/?url=${encoded}`;
    default:         return fullUrl;
  }
}

function ShareNetIcon({ network }: { network: string }) {
  if (network === "twitter") return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  );
  if (network === "facebook") return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  );
  if (network === "whatsapp") return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  );
  if (network === "linkedin") return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
    </svg>
  );
  return null;
}

// ── Theme helpers ──────────────────────────────────────────────────────────────
function isDarkBg(hex: string): boolean {
  if (!hex.startsWith("#") || hex.length < 7) return false;
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 < 128;
}

export interface AppearanceTheme {
  bgColor?: string;
  bgStyle?: string;
  dark?: boolean;
  textColor?: string;
  titleColor?: string;
  buttonStyle?: string;
  headlineFont?: string;
}

// ── Phone screen content ──────────────────────────────────────────────────────
function PhoneScreenContent({
  displayName,
  bio,
  links,
  avatarSize = 70,
  appearance,
}: {
  displayName: string;
  bio?: string;
  links: ManagedLink[];
  avatarSize?: number;
  appearance?: AppearanceTheme;
}) {
  const initial = displayName.charAt(0).toUpperCase() || "?";
  const dark =
    appearance?.dark ??
    (appearance?.bgColor ? isDarkBg(appearance.bgColor) : false);
  const titleColor = appearance?.titleColor ?? "#0b1020";
  const subtitleColor = dark ? "rgba(255,255,255,0.5)" : "#6b75a3";
  const linkCardBg = dark ? "rgba(255,255,255,0.08)" : "white";
  const linkCardBorder = dark ? "rgba(255,255,255,0.10)" : "#eef0f7";
  const linkTextColor = dark ? "rgba(255,255,255,0.88)" : "#0b1020";
  const linkChevronColor = dark ? "rgba(255,255,255,0.3)" : "#a8aecb";
  const linkBorderRadius = previewLinkBorderRadiusPx(appearance?.buttonStyle ?? "rounded");
  const published = links.filter((l) => l.status === 1);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        height: "100%",
        minHeight: 0,
      }}
    >
      {/* Avatar */}
      <div style={{ position: "relative", marginBottom: 12 }}>
        <div
          style={{
            width: avatarSize, height: avatarSize,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #3b46e0, #7a85ff)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "white",
            fontFamily:
              appearance?.headlineFont ??
              'var(--branding-font-serif, var(--font-instrument-serif), "Instrument Serif", Georgia, serif)',
            fontSize: Math.round(avatarSize * 0.4), fontStyle: "italic",
            boxShadow: "0 10px 24px -8px rgba(59,70,224,0.45)",
            border: "3px solid white",
          }}
        >
          {initial}
        </div>
        <div
          style={{
            position: "absolute", bottom: 2, right: 2,
            width: 14, height: 14,
            background: "#16a34a",
            borderRadius: "50%",
            border: "2.5px solid white",
          }}
        />
      </div>

      {/* Name */}
      <div
        style={{
          fontFamily:
            appearance?.headlineFont ??
            'var(--branding-font-serif, var(--font-instrument-serif), "Instrument Serif", Georgia, serif)',
          fontStyle: "italic",
          fontSize: 19,
          color: titleColor,
          letterSpacing: "-0.01em",
          textAlign: "center",
          lineHeight: 1.1,
        }}
      >
        {displayName || "Your Name"}
      </div>

      {/* Bio */}
      {bio && (
        <div
          style={{
            fontSize: 11,
            color: subtitleColor,
            margin: "8px 12px 16px",
            textAlign: "center",
            lineHeight: 1.5,
          }}
        >
          {bio}
        </div>
      )}

      {/* Social icons row */}
      <div style={{ display: "flex", gap: 10, marginBottom: 18 }}>
        {SOCIAL_ICONS.map(({ label, svg }) => (
          <div
            key={label}
            title={label}
            style={{
              width: 26, height: 26,
              background: dark ? "rgba(255,255,255,0.1)" : "white",
              borderRadius: "50%",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: subtitleColor,
              boxShadow: dark ? "none" : "0 1px 2px rgba(15,23,42,0.04), 0 1px 1px rgba(15,23,42,0.03)",
            }}
          >
            {svg}
          </div>
        ))}
      </div>

      {/* Published links (scrollable) */}
      <div
        style={{
          width: "100%",
          display: "flex",
          flexDirection: "column",
          gap: 8,
          overflowY: "auto",
          flex: 1,
          minHeight: 0,
          scrollbarWidth: "none",
        }}
      >
        {published.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              color: subtitleColor,
              fontSize: 11,
              padding: "20px 0",
            }}
          >
            No published links yet
          </div>
        ) : (
          published.map((link, i) => (
            <div
              key={link.id ?? i}
              style={{
                background: linkCardBg,
                border: `1px solid ${linkCardBorder}`,
                borderRadius: linkBorderRadius,
                padding: "11px 14px",
                display: "flex",
                alignItems: "center",
                gap: 10,
                fontSize: 12.5,
                fontWeight: 500,
                color: linkTextColor,
                boxShadow: dark ? "none" : "0 2px 6px rgba(15,23,42,0.04)",
                animation: "scIn 0.22s cubic-bezier(0.16,1,0.3,1) both",
                animationDelay: `${i * 35}ms`,
              }}
            >
              <PhoneLinkIcon iconKey={link.icon} />
              <span
                style={{
                  flex: 1,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  fontSize: 12.5,
                }}
              >
                {link.title}
              </span>
              <span style={{ color: linkChevronColor, flexShrink: 0 }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 18l6-6-6-6"/>
                </svg>
              </span>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div
        style={{
          marginTop: "auto",
          paddingTop: 8,
          fontFamily: "var(--font-instrument-serif), Georgia, serif",
          fontStyle: "italic",
          fontSize: 10.5,
          color: "#6b75a3",
          flexShrink: 0,
        }}
      >
        made with{" "}
        <span style={{ color: "#3b46e0", fontWeight: 600 }}>linkhub</span>
        {" "}✦
      </div>
    </div>
  );
}

// ── Small action icon button ──────────────────────────────────────────────────
function PreviewActionBtn({
  children,
  title,
  onClick,
  href,
  active,
}: {
  children: React.ReactNode;
  title: string;
  onClick?: () => void;
  href?: string;
  active?: boolean;
}) {
  const style: React.CSSProperties = {
    width: 32, height: 32,
    borderRadius: 8,
    background: active ? "#eef0f7" : "white",
    color: active ? "#0b1020" : "#6b75a3",
    boxShadow: "0 1px 2px rgba(15,23,42,0.04), 0 1px 1px rgba(15,23,42,0.03)",
    display: "flex", alignItems: "center", justifyContent: "center",
    border: 0,
    cursor: "pointer",
    textDecoration: "none",
    flexShrink: 0,
    transition: "background 0.15s, color 0.15s",
  };

  const hoverHandlers = {
    onMouseEnter: (e: React.MouseEvent<HTMLElement>) => {
      (e.currentTarget as HTMLElement).style.background = "#eef0f7";
      (e.currentTarget as HTMLElement).style.color = "#0b1020";
    },
    onMouseLeave: (e: React.MouseEvent<HTMLElement>) => {
      (e.currentTarget as HTMLElement).style.background = active ? "#eef0f7" : "white";
      (e.currentTarget as HTMLElement).style.color = active ? "#0b1020" : "#6b75a3";
    },
  };

  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" title={title} style={style} {...hoverHandlers}>
        {children}
      </a>
    );
  }

  return (
    <button type="button" title={title} onClick={onClick} style={style} {...hoverHandlers}>
      {children}
    </button>
  );
}

// ── Phone shell (frame + notch + gradient screen) ─────────────────────────────
function PhoneShell({
  children,
  bgStyle,
  showGlow = false,
}: {
  children: React.ReactNode;
  bgStyle?: string;
  showGlow?: boolean;
}) {
  return (
    <div
      style={{
        position: "relative",
        width: 260, height: 530,
        background: "#0b1020",
        borderRadius: 42,
        padding: 8,
        flexShrink: 0,
        boxShadow: "0 40px 80px -20px rgba(30,42,138,0.25), 0 16px 32px -16px rgba(15,23,42,0.12)",
      }}
    >
      {/* Notch */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          top: 14, left: "50%",
          transform: "translateX(-50%)",
          width: 90, height: 22,
          background: "#0b1020",
          borderRadius: 99,
          zIndex: 20,
        }}
      />
      {/* Screen */}
      <div
        style={{
          width: "100%", height: "100%",
          borderRadius: 34,
          overflow: "hidden",
          position: "relative",
          background: bgStyle ?? "linear-gradient(180deg, #fafbff 0%, #f0f2fb 100%)",
          padding: "44px 22px 22px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {showGlow && (
          <div
            aria-hidden
            style={{
              position: "absolute",
              top: 0, left: 0, right: 0,
              height: 140,
              background: "radial-gradient(circle at 50% -20%, rgba(104,115,255,0.22), transparent 70%)",
              pointerEvents: "none",
              zIndex: 1,
            }}
          />
        )}
        <div style={{ position: "relative", zIndex: 2, display: "flex", flexDirection: "column", height: "100%", minHeight: 0 }}>
          {children}
        </div>
      </div>
    </div>
  );
}

// ── Browser shell (desktop mode) ──────────────────────────────────────────────
function BrowserShell({ children, bgStyle }: { children: React.ReactNode; bgStyle?: string }) {
  return (
    <div
      style={{
        position: "relative",
        width: 360, height: 480,
        background: "white",
        borderRadius: 10,
        border: "1px solid #d6dae9",
        overflow: "hidden",
        flexShrink: 0,
        boxShadow: "0 20px 40px -12px rgba(15,23,42,0.18), 0 8px 16px -8px rgba(15,23,42,0.10)",
        transition: "all 0.35s cubic-bezier(0.16,1,0.3,1)",
      }}
    >
      {/* Chrome bar */}
      <div
        style={{
          position: "absolute", top: 0, left: 0, right: 0,
          height: 32,
          background: "#f3f4f8",
          borderBottom: "1px solid #e2e5ef",
          borderRadius: "10px 10px 0 0",
          display: "flex", alignItems: "center",
          paddingLeft: 12,
        }}
      >
        {/* Traffic lights */}
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#ff5f56" }} />
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#ffbd2e" }} />
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#27c93f" }} />
        </div>
        {/* URL bar */}
        <div
          style={{
            flex: 1, margin: "0 12px", height: 18,
            background: "white", borderRadius: 4,
            border: "1px solid #e2e5ef",
            display: "flex", alignItems: "center", paddingLeft: 8,
            fontSize: 9, color: "#6b75a3",
            fontFamily: 'var(--branding-font-mono, "Geist Mono", ui-monospace, monospace)',
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}
        >
          {APP_DOMAIN}
        </div>
      </div>

      {/* Screen area */}
      <div
        style={{
          position: "absolute", top: 32, left: 0, right: 0, bottom: 0,
          background: bgStyle ?? "linear-gradient(180deg, #fafbff 0%, #f0f2fb 100%)",
          padding: "24px 28px 24px",
          display: "flex", flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <div style={{ position: "relative", zIndex: 2, display: "flex", flexDirection: "column", height: "100%", minHeight: 0 }}>
          {children}
        </div>
      </div>
    </div>
  );
}

// ── Social share confirm dialog ───────────────────────────────────────────────
function SocialConfirmDialog({
  network,
  shareUrl,
  onClose,
}: {
  network: ShareNetwork | null;
  shareUrl: string;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!network) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [network]);

  if (!network || typeof document === "undefined") return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* clipboard not available */ }
  };

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        boxSizing: "border-box",
        background: "rgba(11,16,32,0.55)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          width: "100%", maxWidth: 380,
          background: "white", borderRadius: 20,
          padding: "28px 28px 24px",
          boxShadow: "0 40px 80px -20px rgba(15,23,42,0.4), 0 16px 32px -16px rgba(15,23,42,0.2)",
          animation: "scIn 0.25s cubic-bezier(0.16,1,0.3,1)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Network icon */}
        <div
          style={{
            width: 44, height: 44, borderRadius: "50%",
            background: network.bg, color: "white",
            display: "flex", alignItems: "center", justifyContent: "center",
            marginBottom: 16,
          }}
        >
          <ShareNetIcon network={network.key} />
        </div>

        <h2 style={{ fontSize: 17, fontWeight: 700, color: "#0b1020", marginBottom: 6, letterSpacing: "-0.01em" }}>
          Share on {network.label}
        </h2>
        <p style={{ fontSize: 13.5, color: "#6b75a3", marginBottom: 16, lineHeight: 1.55 }}>
          Preview the link before opening it in a new tab.
        </p>

        {/* Share URL row */}
        <div
          style={{
            display: "flex", alignItems: "center", gap: 8,
            background: "#f7f8fc", borderRadius: 10,
            padding: "8px 10px 8px 12px",
            marginBottom: 20,
          }}
        >
          <span
            style={{
              flex: 1, fontSize: 11.5, color: "#3b46e0",
              fontFamily: 'var(--branding-font-mono, "Geist Mono", ui-monospace, monospace)',
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            }}
          >
            {shareUrl}
          </span>
          <button
            type="button"
            onClick={handleCopy}
            title={copied ? "Copied!" : "Copy link"}
            style={{
              width: 28, height: 28, borderRadius: 7, border: "1px solid #eef0f7",
              background: copied ? "#dcfce7" : "white",
              color: copied ? "#16a34a" : "#6b75a3",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", flexShrink: 0, transition: "all 0.15s",
            }}
          >
            {copied ? (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M20 6L9 17l-5-5"/>
              </svg>
            ) : (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="9" y="9" width="13" height="13" rx="2"/>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
              </svg>
            )}
          </button>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: 10 }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              flex: 1, padding: "10px 0", borderRadius: 99, border: 0,
              background: "#eef0f7", color: "#1a2244",
              fontSize: 13.5, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#d6dae9"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#eef0f7"; }}
          >
            Cancel
          </button>
          <a
            href={shareUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onClose}
            style={{
              flex: 1, padding: "10px 0", borderRadius: 99, border: 0,
              background: network.bg, color: "white",
              fontSize: 13.5, fontWeight: 600, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              textDecoration: "none",
            }}
          >
            Open in new tab
          </a>
        </div>
      </div>
    </div>,
    document.body
  );
}

// ── Main export ───────────────────────────────────────────────────────────────
export interface DashboardPreviewPanelProps {
  /** Panel width (default 420) */
  width?: number;
}

export function DashboardPreviewPanel({ width = 420 }: DashboardPreviewPanelProps) {
  const links = useLinksStore((s) => s.links);
  const displayName = useBrandingStore((s) => s.displayName);
  const bio = useBrandingStore((s) => s.bio);
  const publicUrl = useBrandingStore((s) => brandingPublicUrl(s.handle));
  const appearance = useBrandingStore(brandingStateToPreviewAppearance) as AppearanceTheme;
  const themeId = useBrandingStore((s) => s.themeId);
  const themeLabel = getBrandingThemeById(themeId).name;
  const onRandomTheme = useBrandingStore((s) => s.randomTheme);
  const [device, setDevice] = useState<"mobile" | "desktop">("mobile");
  const [showSharePop, setShowSharePop] = useState(false);
  const [copied, setCopied] = useState(false);
  const [shareConfirm, setShareConfirm] = useState<ShareNetwork | null>(null);
  const shareRef = useRef<HTMLDivElement>(null);

  const fullUrl = `https://${publicUrl}`;

  // Close share popover on outside click
  useEffect(() => {
    if (!showSharePop) return;
    const handler = (e: MouseEvent) => {
      if (shareRef.current && !shareRef.current.contains(e.target as Node)) {
        setShowSharePop(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showSharePop]);

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* clipboard not available */ }
  };

  const handleSocialClick = (net: ShareNetwork) => {
    setShowSharePop(false);
    setShareConfirm(net);
  };

  // Split publicUrl for coloured handle display
  const slashIdx = publicUrl.lastIndexOf("/");
  const domain = slashIdx >= 0 ? publicUrl.slice(0, slashIdx + 1) : publicUrl;
  const slug   = slashIdx >= 0 ? publicUrl.slice(slashIdx + 1)     : "";

  const screenBg =
    appearance?.bgStyle ??
    appearance?.bgColor ??
    "linear-gradient(180deg, #fafbff 0%, #f0f2fb 100%)";
  const screenDark =
    appearance?.dark ??
    (appearance?.bgColor ? isDarkBg(appearance.bgColor) : false);

  return (
    <div
      style={{
        width,
        background: "linear-gradient(180deg, #f0f2fb 0%, #e9ecf8 100%)",
        borderLeft: "1px solid #eef0f7",
        padding: "28px 24px",
        position: "sticky",
        top: 0,
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        flexShrink: 0,
      }}
    >
      {/* Radial glow overlays */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "radial-gradient(circle at 20% 10%, rgba(104,115,255,0.12), transparent 50%), radial-gradient(circle at 80% 80%, rgba(59,70,224,0.10), transparent 50%)",
          pointerEvents: "none",
        }}
      />

      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          marginBottom: 18,
          position: "relative",
          zIndex: 50,
        }}
      >
        <div>
          <div
            style={{
              fontFamily:
                'var(--branding-font-serif, var(--font-instrument-serif), "Instrument Serif", Georgia, serif)',
              fontStyle: "italic",
              fontSize: 22,
              letterSpacing: "-0.01em",
              color: "#0b1020",
            }}
          >
            Live preview
          </div>
          <div suppressHydrationWarning style={{ fontSize: 12, color: "#6b75a3", marginTop: 2 }}>
            {domain}
            <span suppressHydrationWarning style={{ color: "#3b46e0", fontWeight: 500 }}>{slug}</span>
          </div>
        </div>

        <div style={{ display: "flex", gap: 6 }}>
          {/* Share button + popover */}
          <div ref={shareRef} style={{ position: "relative" }}>
            <PreviewActionBtn
              title="Share"
              onClick={() => setShowSharePop((p) => !p)}
              active={showSharePop}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13"/>
              </svg>
            </PreviewActionBtn>

            {/* Share popover */}
            {showSharePop && (
              <div
                style={{
                  position: "absolute",
                  top: "calc(100% + 10px)", right: 0,
                  width: 260,
                  background: "white",
                  borderRadius: 16,
                  border: "1px solid #eef0f7",
                  boxShadow: "0 20px 40px -12px rgba(15,23,42,0.18), 0 8px 16px -8px rgba(15,23,42,0.10)",
                  zIndex: 100,
                  overflow: "visible",
                  animation: "popIn 0.18s cubic-bezier(0.16,1,0.3,1)",
                }}
              >
                {/* Upward caret arrow */}
                <div
                  style={{
                    position: "absolute", top: -6, right: 10,
                    width: 12, height: 12,
                    background: "white",
                    borderLeft: "1px solid #eef0f7",
                    borderTop: "1px solid #eef0f7",
                    transform: "rotate(45deg)",
                  }}
                />

                {/* Popover header */}
                <div
                  style={{
                    padding: "14px 16px 12px",
                    borderBottom: "1px solid #f2f4fb",
                    fontSize: 12, fontWeight: 600, color: "#0b1020",
                  }}
                >
                  Share your linkhub
                </div>

                {/* URL copy row */}
                <div
                  style={{
                    display: "flex", alignItems: "center", gap: 8,
                    padding: "12px 14px",
                  }}
                >
                  <span
                    style={{
                      flex: 1,
                      fontSize: 12,
                      color: "#3b46e0",
                      fontFamily: 'var(--branding-font-mono, "Geist Mono", ui-monospace, monospace)',
                      overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                      background: "#f7f8fc", borderRadius: 8,
                      padding: "6px 10px",
                    }}
                  >
                    {publicUrl}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyUrl}
                    title={copied ? "Copied!" : "Copy link"}
                    style={{
                      width: 32, height: 32, borderRadius: 8,
                      border: "1px solid #eef0f7",
                      background: copied ? "#dcfce7" : "white",
                      color: copied ? "#16a34a" : "#6b75a3",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      cursor: "pointer", flexShrink: 0, transition: "all 0.15s",
                    }}
                  >
                    {copied ? (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M20 6L9 17l-5-5"/>
                      </svg>
                    ) : (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="9" y="9" width="13" height="13" rx="2"/>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
                      </svg>
                    )}
                  </button>
                </div>

                {/* Divider */}
                <div style={{ height: 1, background: "#f2f4fb", margin: "0 14px" }} />

                {/* 2×2 social grid */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 8,
                    padding: "12px 14px 14px",
                  }}
                >
                  {SHARE_NETWORKS.map((net) => (
                    <button
                      key={net.key}
                      type="button"
                      onClick={() => handleSocialClick(net)}
                      style={{
                        display: "flex", alignItems: "center", gap: 8,
                        padding: "9px 10px", borderRadius: 10,
                        background: "#f7f8fc", border: "1px solid #eef0f7",
                        color: "#1a2244", fontSize: 12, fontWeight: 500,
                        cursor: "pointer", fontFamily: "inherit",
                        transition: "all 0.15s",
                        whiteSpace: "nowrap", overflow: "hidden",
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.background = "#eef0f7";
                        (e.currentTarget as HTMLButtonElement).style.borderColor = "#d6dae9";
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.background = "#f7f8fc";
                        (e.currentTarget as HTMLButtonElement).style.borderColor = "#eef0f7";
                      }}
                    >
                      <span
                        style={{
                          width: 22, height: 22, borderRadius: 6, flexShrink: 0,
                          background: net.bg, color: "white",
                          display: "flex", alignItems: "center", justifyContent: "center",
                        }}
                      >
                        <ShareNetIcon network={net.key} />
                      </span>
                      {net.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Open in new tab */}
          <PreviewActionBtn title="Open in new tab" href={fullUrl}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15">
              <path strokeLinecap="round" strokeLinejoin="round" d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3"/>
            </svg>
          </PreviewActionBtn>
        </div>
      </div>

      {/* Preview column — device toggle above phone/browser */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          minHeight: 0,
          position: "relative",
          zIndex: 10,
        }}
      >
        <div
          style={{
            background: "rgba(255,255,255,0.7)",
            border: "1px solid rgba(255,255,255,0.9)",
            backdropFilter: "blur(8px)",
            borderRadius: 99,
            padding: 3,
            marginBottom: 12,
            display: "inline-flex",
            flexShrink: 0,
            position: "relative",
            zIndex: 10,
          }}
        >
          {(["mobile", "desktop"] as const).map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setDevice(d)}
              style={{
                padding: "6px 14px",
                fontSize: 12,
                fontWeight: 500,
                color: device === d ? "#0b1020" : "#6b75a3",
                background: device === d ? "white" : "transparent",
                borderRadius: 99,
                border: 0,
                cursor: "pointer",
                boxShadow: device === d
                  ? "0 1px 2px rgba(15,23,42,0.04), 0 1px 1px rgba(15,23,42,0.03)"
                  : "none",
                fontFamily: "inherit",
                transition: "all 0.15s",
              }}
            >
              {d === "mobile" ? "📱 Mobile" : "💻 Desktop"}
            </button>
          ))}
        </div>

        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            minHeight: 0,
          }}
        >
          {device === "desktop" ? (
            <BrowserShell bgStyle={screenBg}>
              <PhoneScreenContent
                displayName={displayName}
                bio={bio}
                links={links}
                avatarSize={76}
                appearance={appearance}
              />
            </BrowserShell>
          ) : (
            <PhoneShell bgStyle={screenBg} showGlow={screenDark}>
              <PhoneScreenContent
                displayName={displayName}
                bio={bio}
                links={links}
                appearance={appearance}
              />
            </PhoneShell>
          )}
        </div>
      </div>

      {themeLabel ? (
        <div
          style={{
            marginTop: 10,
            background: "rgba(255,255,255,0.7)",
            backdropFilter: "blur(8px)",
            border: "1px solid rgba(255,255,255,0.9)",
            borderRadius: 12,
            padding: "12px 14px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            position: "relative",
            zIndex: 10,
          }}
        >
          <div>
            <div
              style={{
                fontSize: 11,
                color: "#6b75a3",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                fontWeight: 500,
              }}
            >
              Current theme
            </div>
            <div
              style={{
                fontFamily:
                  'var(--branding-font-serif, var(--font-instrument-serif), "Instrument Serif", Georgia, serif)',
                fontStyle: "italic",
                fontSize: 14,
                color: "#0b1020",
                marginTop: 2,
              }}
            >
              {themeLabel}
            </div>
          </div>
          {onRandomTheme && (
            <button
              type="button"
              title="Random theme"
              onClick={onRandomTheme}
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: "white",
                boxShadow: "0 1px 2px rgba(15,23,42,0.04), 0 1px 1px rgba(15,23,42,0.03)",
                border: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                color: "#6b75a3",
                transition: "color 0.15s",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.color = "#0b1020";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.color = "#6b75a3";
              }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
                <rect x="2" y="2" width="20" height="20" rx="2.18"/>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 8h.01M8 8h.01M16 16h.01M8 16h.01M12 12h.01"/>
              </svg>
            </button>
          )}
        </div>
      ) : null}

      {/* Social share confirm dialog */}
      {shareConfirm && (
        <SocialConfirmDialog
          network={shareConfirm}
          shareUrl={buildShareUrl(shareConfirm.key, fullUrl)}
          onClose={() => setShareConfirm(null)}
        />
      )}
    </div>
  );
}

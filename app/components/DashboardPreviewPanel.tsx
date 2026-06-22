"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import type { ManagedLink } from "../(dashboard)/user-admin/components/types";
import { previewLinkBorderRadiusPx } from "@/app/constants/brandingButtonShapes";
import { APP_DOMAIN } from "@/lib/appConfig";
import { useLinksStore } from "@/store/linksStore";
import { useBrandingStore } from "@/store/brandingStore";
import { useShallow } from "zustand/react/shallow";
import {
  brandingPublicUrl,
  brandingStateToPreviewAppearance,
  getBrandingThemeById,
} from "@/lib/brandingState";
import { getGradientById } from "@/app/constants/editorBackgroundGradients";
import { isLinkIconKey } from "@/app/constants/linkIconColors";

function PhoneLinkIcon({ iconKey, thumbnailUrl }: { iconKey?: string; thumbnailUrl?: string }) {
  if (thumbnailUrl) {
    return (
      <div className="w-[22px] h-[22px] rounded-md shrink-0 overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={thumbnailUrl} alt="" className="w-full h-full object-cover block" />
      </div>
    );
  }
  const key = isLinkIconKey(iconKey) ? iconKey : "website";
  return (
    <div className={`w-[22px] h-[22px] rounded-md shrink-0 flex items-center justify-center dp-link-icon--${key}`}>
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
  textColor?: string | null;
  titleColor?: string;
  buttonStyle?: string;
  headlineFont?: string;
  cardStyle?: string;
  bodyFont?: string;
  overlayColor?: string;
  overlayOpacity?: number;
  effects?: string[];
  profileLayout?: string;
  linkDensity?: string;
}

export function PhoneScreenContent({
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
  const cardStyle = appearance?.cardStyle ?? "filled";
  const bodyFontStack = appearance?.bodyFont
    ? `"${appearance.bodyFont}", ui-sans-serif, system-ui, sans-serif`
    : "inherit";

  const linkCardBg = (() => {
    if (cardStyle === "ghost") return "transparent";
    if (cardStyle === "soft") {
      const acc = appearance?.titleColor ?? "#3b46e0";
      return `color-mix(in srgb, ${acc} 12%, transparent)`;
    }
    return dark ? "rgba(255,255,255,0.08)" : "white";
  })();
  const linkCardBorder = (() => {
    if (cardStyle === "ghost") return `1.5px solid ${dark ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.18)"}`;
    if (cardStyle === "soft") return "1px solid transparent";
    return `1px solid ${dark ? "rgba(255,255,255,0.10)" : "#eef0f7"}`;
  })();
  const linkCardShadow = cardStyle === "shadow"
    ? "0 4px 12px rgba(0,0,0,0.12)"
    : dark ? "none" : "0 2px 6px rgba(15,23,42,0.04)";

  const linkTextColor = appearance?.textColor
    ?? (dark ? "rgba(255,255,255,0.88)" : "#0b1020");
  const linkChevronColor = dark ? "rgba(255,255,255,0.3)" : "#a8aecb";
  const linkBorderRadius = previewLinkBorderRadiusPx(appearance?.buttonStyle ?? "rounded");
  const activeEffects = appearance?.effects ?? [];
  const hasGlass       = activeEffects.includes("glassmorphism");
  const hasNeon        = activeEffects.includes("neonBorders");
  const hasGlow        = activeEffects.includes("textGlow");
  const hasGradBorder  = activeEffects.includes("gradientBorder");
  const hasShimmer     = activeEffects.includes("shimmer");
  const hasPulse       = activeEffects.includes("pulseRing");

  const glassStyle: React.CSSProperties = hasGlass
    ? { background: "rgba(255,255,255,0.12)", backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)" }
    : {};
  const neonAccent = appearance?.titleColor ?? "#3b46e0";
  const neonStyle: React.CSSProperties = hasNeon
    ? { boxShadow: `0 0 10px ${neonAccent}55, 0 0 2px ${neonAccent}99, inset 0 0 10px transparent`, borderColor: `${neonAccent}88` }
    : {};
  const glowStyle: React.CSSProperties = hasGlow
    ? { textShadow: dark ? "0 0 10px rgba(255,255,255,0.6)" : `0 0 8px ${neonAccent}88` }
    : {};

  const published = links.filter((l) => l.status === 1);
  const layout = appearance?.profileLayout ?? "classic";
  const density = appearance?.linkDensity ?? "default";

  const linkGap = density === "comfortable" ? 12 : density === "compact" ? 5 : 8;
  const linkPadding = density === "comfortable" ? "14px 16px" : density === "compact" ? "8px 11px" : "11px 14px";

  const headlineFont =
    appearance?.headlineFont ??
    'var(--branding-font-serif, var(--font-instrument-serif), "Instrument Serif", Georgia, serif)';

  const linksList = (
    <div
      style={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        gap: linkGap,
        overflowY: "auto",
        flex: 1,
        minHeight: 0,
        scrollbarWidth: "none",
      }}
    >
      {published.length === 0 ? (
        <div style={{ textAlign: "center", color: subtitleColor, fontSize: 11, padding: "20px 0" }}>
          No published links yet
        </div>
      ) : (
        published.map((link, i) => (
          <div
            key={link.id ?? i}
            style={{
              position: "relative",
              overflow: "hidden",
              background: linkCardBg,
              border: linkCardBorder,
              borderRadius: linkBorderRadius,
              padding: linkPadding,
              display: "flex",
              alignItems: "center",
              gap: 10,
              fontSize: 12.5,
              fontWeight: 500,
              color: linkTextColor,
              fontFamily: bodyFontStack,
              boxShadow: linkCardShadow,
              animation: hasGradBorder
                ? "lhGradBorder 2s linear infinite"
                : `scIn 0.22s cubic-bezier(0.16,1,0.3,1) ${i * 35}ms both`,
              ...glassStyle,
              ...neonStyle,
            }}
          >
            {hasShimmer && (
              <div
                aria-hidden
                style={{
                  position: "absolute",
                  top: 0, left: 0,
                  width: "40%", height: "100%",
                  background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.28) 50%, transparent 100%)",
                  animation: `lhShimmer var(--motion-shimmer) linear ${i * 0.2}s infinite`,
                  pointerEvents: "none",
                  zIndex: 1,
                }}
              />
            )}
            <PhoneLinkIcon iconKey={link.icon} thumbnailUrl={link.thumbnailUrl} />
            <span
              style={{
                flex: 1,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                fontSize: 12.5,
                position: "relative",
                zIndex: 2,
                ...glowStyle,
              }}
            >
              {link.title}
            </span>
            <span style={{ color: linkChevronColor, flexShrink: 0, position: "relative", zIndex: 2 }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 18l6-6-6-6"/>
              </svg>
            </span>
          </div>
        ))
      )}
    </div>
  );

  // ── Minimal layout: side-by-side avatar + text header, no social icons ──
  if (layout === "minimal") {
    return (
      <div style={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 11, marginBottom: 14 }}>
          <div
            style={{
              width: 44, height: 44, flexShrink: 0,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #3b46e0, #7a85ff)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "white",
              fontFamily: headlineFont,
              fontSize: 18, fontStyle: "italic",
              ...(hasPulse ? { ["--pc" as string]: `${neonAccent}66`, animation: "lhPulse 1.8s ease-out infinite" } : {}),
            }}
          >
            {initial}
          </div>
          <div style={{ minWidth: 0 }}>
            <div
              style={{
                fontFamily: headlineFont,
                fontSize: 14, fontWeight: 600,
                color: titleColor,
                letterSpacing: "-0.01em",
                lineHeight: 1.2,
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              }}
            >
              {displayName || "Your Name"}
            </div>
            {bio && (
              <div
                style={{
                  fontSize: 10, color: subtitleColor,
                  marginTop: 2, lineHeight: 1.4,
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                  fontFamily: bodyFontStack,
                }}
              >
                {bio}
              </div>
            )}
          </div>
        </div>
        {linksList}
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

  // ── Centered layout: same as classic but larger avatar ──
  const centeredSize = layout === "centered" ? 88 : avatarSize;

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
      <div style={{ position: "relative", marginBottom: 12 }}>
        <div
          style={{
            width: centeredSize, height: centeredSize,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #3b46e0, #7a85ff)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "white",
            fontFamily: headlineFont,
            fontSize: Math.round(centeredSize * 0.4), fontStyle: "italic",
            boxShadow: "0 10px 24px -8px rgba(59,70,224,0.45)",
            border: "3px solid white",
            ...(hasPulse ? {
              ["--pc" as string]: `${neonAccent}66`,
              animation: "lhPulse 1.8s ease-out infinite",
            } : {}),
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

      <div
        style={{
          fontFamily: headlineFont,
          fontStyle: "italic",
          fontSize: layout === "centered" ? 21 : 19,
          color: titleColor,
          letterSpacing: "-0.01em",
          textAlign: "center",
          lineHeight: 1.1,
        }}
      >
        {displayName || "Your Name"}
      </div>

      {bio && (
        <div
          style={{
            fontSize: 11,
            color: subtitleColor,
            margin: "8px 12px 16px",
            textAlign: "center",
            lineHeight: 1.5,
            fontFamily: bodyFontStack,
          }}
        >
          {bio}
        </div>
      )}

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

      {linksList}

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

function PreviewActionBtn({
  children,
  title,
  onClick,
  href,
  active,
  disabled,
}: {
  children: React.ReactNode;
  title: string;
  onClick?: () => void;
  href?: string;
  active?: boolean;
  disabled?: boolean;
}) {
  const style: React.CSSProperties = {
    width: 32, height: 32,
    borderRadius: 8,
    background: active ? "#eef0f7" : "white",
    color: active ? "#0b1020" : "#6b75a3",
    boxShadow: "0 1px 2px rgba(15,23,42,0.04), 0 1px 1px rgba(15,23,42,0.03)",
    display: "flex", alignItems: "center", justifyContent: "center",
    border: 0,
    cursor: disabled ? "not-allowed" : "pointer",
    textDecoration: "none",
    flexShrink: 0,
    transition: "background 0.15s, color 0.15s",
    opacity: disabled ? 0.4 : 1,
    pointerEvents: disabled ? "none" : undefined,
  };

  const hoverHandlers = disabled ? {} : {
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
      <a href={disabled ? undefined : href} target="_blank" rel="noopener noreferrer" title={title} style={style} {...hoverHandlers}>
        {children}
      </a>
    );
  }

  return (
    <button type="button" title={title} onClick={onClick} disabled={disabled} style={style} {...hoverHandlers}>
      {children}
    </button>
  );
}

function seeded(seed: number, mod: number) {
  return ((seed * 1664525 + 1013904223) & 0x7fffffff) % mod;
}

const EFFECT_KEYFRAMES = `
  @keyframes lhFloat {
    0%,100% { transform: translate(0,0); }
    50%      { transform: translate(var(--dx),var(--dy)); }
  }
  @keyframes lhTwinkle {
    0%,100% { opacity: var(--lo); }
    50%      { opacity: var(--hi); }
  }
  @keyframes lhSnow {
    0%   { transform: translateX(0) translateY(-20px); opacity: 0.9; }
    80%  { opacity: 0.7; }
    100% { transform: translateX(var(--sx)) translateY(660px); opacity: 0; }
  }
  @keyframes lhBokeh {
    0%   { transform: translateY(0) scale(1);   opacity: var(--op); }
    100% { transform: translateY(-680px) scale(0.4); opacity: 0; }
  }
  @keyframes lhRain {
    0%   { transform: translate(0,-30px); opacity: 0.6; }
    100% { transform: translate(-14px,680px); opacity: 0; }
  }
  @keyframes lhConfetti {
    0%   { transform: translateY(-10px) rotate(0deg) scale(1); opacity: 1; }
    80%  { opacity: 0.8; }
    100% { transform: translateY(680px) rotate(var(--r)); opacity: 0; }
  }
  @keyframes lhEmoji {
    0%   { transform: translateY(0) scale(1); opacity: 0.9; }
    20%  { opacity: 0.9; }
    100% { transform: translateY(-700px) scale(0.6); opacity: 0; }
  }
  @keyframes lhAurora1 {
    0%,100% { transform: translateX(-15%) scaleX(1);   opacity: 0.45; }
    50%     { transform: translateX(12%) scaleX(1.25); opacity: 0.75; }
  }
  @keyframes lhAurora2 {
    0%,100% { transform: translateX(10%) scaleX(1);    opacity: 0.35; }
    50%     { transform: translateX(-18%) scaleX(0.9); opacity: 0.65; }
  }
  @keyframes lhAurora3 {
    0%,100% { transform: translateX(-5%) scaleX(1.1);  opacity: 0.30; }
    50%     { transform: translateX(8%) scaleX(0.95);  opacity: 0.60; }
  }
  @keyframes lhShimmer {
    0%   { transform: translateX(-120%); }
    100% { transform: translateX(300%); }
  }
  @keyframes lhGradBorder {
    0%   { box-shadow: 0 0 0 2px #f43f5e, 0 2px 10px rgba(0,0,0,0.08); }
    16%  { box-shadow: 0 0 0 2px #f97316, 0 2px 10px rgba(0,0,0,0.08); }
    33%  { box-shadow: 0 0 0 2px #eab308, 0 2px 10px rgba(0,0,0,0.08); }
    50%  { box-shadow: 0 0 0 2px #22c55e, 0 2px 10px rgba(0,0,0,0.08); }
    66%  { box-shadow: 0 0 0 2px #3b82f6, 0 2px 10px rgba(0,0,0,0.08); }
    83%  { box-shadow: 0 0 0 2px #a855f7, 0 2px 10px rgba(0,0,0,0.08); }
    100% { box-shadow: 0 0 0 2px #f43f5e, 0 2px 10px rgba(0,0,0,0.08); }
  }
  @keyframes lhPulse {
    0%   { box-shadow: 0 0 0 0   var(--pc); }
    60%  { box-shadow: 0 0 0 12px transparent; }
    100% { box-shadow: 0 0 0 0   transparent; }
  }
`;

// Particle data is fully deterministic (seeded from index only), so it is computed
// once at module load and reused across all mounts and re-renders.
const STAR_DATA = Array.from({ length: 42 }, (_, i) => {
  const s = i * 7919;
  const tier = i % 7 === 0 ? "bright" : i % 3 === 0 ? "med" : "tiny";
  const size = tier === "bright" ? 7 : tier === "med" ? 4 : 2;
  return {
    x: seeded(s, 100), y: seeded(s + 1, 100), size, tier,
    floatDur:   3 + seeded(s + 2, 40) / 10,
    twinkleDur: 1.2 + seeded(s + 3, 30) / 10,
    delay:      -(seeded(s + 4, 80) / 10),
    driftX:     seeded(s + 5, 12) - 6,
    driftY:     seeded(s + 6, 10) - 5,
  };
});

const FLAKE_DATA = Array.from({ length: 24 }, (_, i) => {
  const s = i * 6271;
  return {
    x:    seeded(s, 95),
    size: i % 4 === 0 ? 10 : i % 2 === 0 ? 7 : 5,
    dur:  3 + seeded(s + 1, 40) / 10,
    delay:-(seeded(s + 2, 60) / 10),
    swayX:seeded(s + 3, 20) - 10,
  };
});

const BUBBLE_DATA = Array.from({ length: 22 }, (_, i) => {
  const s = i * 5381;
  return {
    x:    seeded(s, 90),
    size: 28 + seeded(s + 1, 60),
    dur:  5 + seeded(s + 2, 60) / 10,
    delay:-(seeded(s + 3, 90) / 10),
    op:   (15 + seeded(s + 4, 25)) / 100,
    hue:  seeded(s + 5, 360),
  };
});

const RAIN_DATA = Array.from({ length: 35 }, (_, i) => {
  const s = i * 4793;
  return {
    x:    seeded(s, 100),
    len:  14 + seeded(s + 1, 20),
    dur:  0.5 + seeded(s + 2, 8) / 10,
    delay:-(seeded(s + 3, 50) / 10),
    op:   (40 + seeded(s + 4, 40)) / 100,
  };
});

const CONFETTI_COLORS = ["#f43f5e","#f97316","#eab308","#22c55e","#3b82f6","#a855f7","#ec4899"];
const CONFETTI_DATA = Array.from({ length: 38 }, (_, i) => {
  const s = i * 3571;
  const isCircle = i % 3 === 0;
  return {
    x:     seeded(s, 98),
    size:  5 + seeded(s + 1, 8),
    dur:   3 + seeded(s + 2, 40) / 10,
    delay: -(seeded(s + 3, 70) / 10),
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    rot:   seeded(s + 4, 720) - 360,
    wide:  isCircle ? 1 : 0.45 + seeded(s + 5, 10) / 20,
    isCircle,
  };
});

const EMOJI_SET = ["✨","⭐","🔥","💫","🌟","💎","🎯","🚀"];
const EMOJI_DATA = Array.from({ length: 14 }, (_, i) => {
  const s = i * 2311;
  return {
    x:     seeded(s, 90),
    size:  14 + seeded(s + 1, 14),
    dur:   4 + seeded(s + 2, 40) / 10,
    delay: -(seeded(s + 3, 80) / 10),
    emoji: EMOJI_SET[i % EMOJI_SET.length],
  };
});

function EffectsOverlay({ effects }: { effects?: string[] }) {
  if (!effects?.length) return null;
  const has = (id: string) => effects.includes(id);

  const hasStars    = has("starParticles");
  const hasSnow     = has("snowfall");
  const hasAurora   = has("aurora");
  const hasBokeh    = has("bokeh");
  const hasRain     = has("rain");
  const hasConfetti = has("confetti");
  const hasEmoji    = has("floatingEmoji");

  if (!hasStars && !hasSnow && !hasAurora && !hasBokeh && !hasRain && !hasConfetti && !hasEmoji) {
    return null;
  }

  return (
    <div
      aria-hidden
      style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 3, overflow: "hidden" }}
    >
      <style>{EFFECT_KEYFRAMES}</style>

      {hasAurora && (
        <>
          <div style={{
            position: "absolute", top: "-10%", left: "-20%",
            width: "140%", height: "45%",
            background: "radial-gradient(ellipse at 50% 50%, rgba(16,185,129,0.55) 0%, rgba(59,130,246,0.35) 50%, transparent 80%)",
            animation: "lhAurora1 7s ease-in-out infinite",
            filter: "blur(18px)",
          }} />
          <div style={{
            position: "absolute", top: "5%", left: "-10%",
            width: "130%", height: "35%",
            background: "radial-gradient(ellipse at 50% 50%, rgba(139,92,246,0.50) 0%, rgba(236,72,153,0.30) 50%, transparent 80%)",
            animation: "lhAurora2 9s ease-in-out infinite",
            filter: "blur(22px)",
          }} />
          <div style={{
            position: "absolute", top: "15%", left: "10%",
            width: "120%", height: "30%",
            background: "radial-gradient(ellipse at 50% 50%, rgba(14,165,233,0.45) 0%, rgba(99,102,241,0.25) 50%, transparent 80%)",
            animation: "lhAurora3 11s ease-in-out infinite",
            filter: "blur(16px)",
          }} />
        </>
      )}

      {hasStars && STAR_DATA.map((s, i) => {
        const glow = s.tier === "bright"
          ? "0 0 12px 3px rgba(255,255,255,0.9), 0 0 24px 6px rgba(255,255,255,0.4)"
          : s.tier === "med"
          ? "0 0 6px 2px rgba(255,255,255,0.75)"
          : "0 0 3px 1px rgba(255,255,255,0.5)";
        const lo = s.tier === "bright" ? 0.5 : s.tier === "med" ? 0.3 : 0.15;
        const hi = s.tier === "bright" ? 1.0 : s.tier === "med" ? 0.85 : 0.6;
        return (
          <div key={`st-${i}`} style={{
            position: "absolute",
            left: `${s.x}%`, top: `${s.y}%`,
            width: s.size, height: s.size,
            borderRadius: "50%", background: "white",
            boxShadow: glow,
            ["--dx" as string]: `${s.driftX}px`,
            ["--dy" as string]: `${s.driftY}px`,
            ["--lo" as string]: lo,
            ["--hi" as string]: hi,
            animation: `lhFloat ${s.floatDur.toFixed(1)}s ${s.delay.toFixed(1)}s ease-in-out infinite, lhTwinkle ${s.twinkleDur.toFixed(1)}s ${s.delay.toFixed(1)}s ease-in-out infinite`,
          }} />
        );
      })}

      {hasSnow && FLAKE_DATA.map((f, i) => (
        <div key={`fl-${i}`} style={{
          position: "absolute",
          left: `${f.x}%`, top: 0,
          fontSize: f.size,
          color: "rgba(255,255,255,0.85)",
          ["--sx" as string]: `${f.swayX}px`,
          animation: `lhSnow ${f.dur.toFixed(1)}s ${f.delay.toFixed(1)}s linear infinite`,
          filter: "drop-shadow(0 0 3px rgba(255,255,255,0.5))",
        }}>❄</div>
      ))}

      {hasBokeh && BUBBLE_DATA.map((b, i) => (
        <div key={`bk-${i}`} style={{
          position: "absolute",
          left: `${b.x}%`, bottom: "-10%",
          width: b.size, height: b.size,
          borderRadius: "50%",
          border: `1.5px solid hsla(${b.hue},80%,80%,0.5)`,
          background: `hsla(${b.hue},70%,85%,0.08)`,
          ["--op" as string]: b.op,
          animation: `lhBokeh ${b.dur.toFixed(1)}s ${b.delay.toFixed(1)}s ease-in infinite`,
          backdropFilter: "blur(1px)",
        }} />
      ))}

      {hasRain && RAIN_DATA.map((r, i) => (
        <div key={`rn-${i}`} style={{
          position: "absolute",
          left: `${r.x}%`, top: 0,
          width: 1, height: r.len,
          background: `rgba(180,220,255,${r.op})`,
          borderRadius: 99,
          transform: "rotate(15deg)",
          transformOrigin: "top center",
          animation: `lhRain ${r.dur.toFixed(2)}s ${r.delay.toFixed(2)}s linear infinite`,
        }} />
      ))}

      {hasConfetti && CONFETTI_DATA.map((c, i) => (
        <div key={`cf-${i}`} style={{
          position: "absolute",
          left: `${c.x}%`, top: "-2%",
          width: c.size,
          height: c.isCircle ? c.size : c.size * c.wide,
          background: c.color,
          borderRadius: c.isCircle ? "50%" : 2,
          ["--r" as string]: `${c.rot}deg`,
          animation: `lhConfetti ${c.dur.toFixed(1)}s ${c.delay.toFixed(1)}s linear infinite`,
          opacity: 0.9,
        }} />
      ))}

      {hasEmoji && EMOJI_DATA.map((e, i) => (
        <div key={`em-${i}`} style={{
          position: "absolute",
          left: `${e.x}%`, bottom: "5%",
          fontSize: e.size,
          animation: `lhEmoji ${e.dur.toFixed(1)}s ${e.delay.toFixed(1)}s ease-out infinite`,
          filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.2))",
        }}>{e.emoji}</div>
      ))}
    </div>
  );
}

function PhoneScreenFrame({
  children,
  bgStyle,
  showGlow = false,
  effects,
  videoUrl,
  imageUrl,
  edgeToEdge = false,
}: {
  children: React.ReactNode;
  bgStyle?: string;
  showGlow?: boolean;
  effects?: string[];
  videoUrl?: string;
  imageUrl?: string;
  edgeToEdge?: boolean;
}) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        borderRadius: edgeToEdge ? 0 : 34,
        overflow: "hidden",
        position: "relative",
        background: (videoUrl || imageUrl) ? "#0b1020" : (bgStyle ?? "linear-gradient(180deg, #fafbff 0%, #f0f2fb 100%)"),
        padding: edgeToEdge
          ? "max(16px, env(safe-area-inset-top, 0px)) 16px calc(16px + env(safe-area-inset-bottom, 0px))"
          : "44px 22px 22px",
        display: "flex",
        flexDirection: "column",
        boxShadow: edgeToEdge ? "inset 0 0 0 1px #eef0f7" : undefined,
      }}
    >
      {imageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imageUrl}
          alt=""
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", zIndex: 0 }}
        />
      )}
      {videoUrl && (
        <video
          src={videoUrl}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", zIndex: 0 }}
        />
      )}
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
      <EffectsOverlay effects={effects} />
      <div style={{ position: "relative", zIndex: 2, display: "flex", flexDirection: "column", height: "100%", minHeight: 0 }}>
        {children}
      </div>
    </div>
  );
}

/** Edge-to-edge mobile preview — no device bezel (real phone is the frame). */
export function PhoneEdgeShell({
  children,
  bgStyle,
  showGlow = false,
  effects,
  videoUrl,
  imageUrl,
}: {
  children: React.ReactNode;
  bgStyle?: string;
  showGlow?: boolean;
  effects?: string[];
  videoUrl?: string;
  imageUrl?: string;
}) {
  return (
    <div
      data-preview-frame="edge"
      style={{
        position: "relative",
        flex: 1,
        width: "100%",
        minHeight: 0,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <PhoneScreenFrame
        bgStyle={bgStyle}
        showGlow={showGlow}
        effects={effects}
        videoUrl={videoUrl}
        imageUrl={imageUrl}
        edgeToEdge
      >
        {children}
      </PhoneScreenFrame>
    </div>
  );
}

export function PhoneShell({
  children,
  bgStyle,
  showGlow = false,
  effects,
  videoUrl,
  imageUrl,
}: {
  children: React.ReactNode;
  bgStyle?: string;
  showGlow?: boolean;
  effects?: string[];
  videoUrl?: string;
  imageUrl?: string;
}) {
  return (
    <div
      data-preview-frame="device"
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
      <div
        data-preview-notch
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
      <PhoneScreenFrame
        bgStyle={bgStyle}
        showGlow={showGlow}
        effects={effects}
        videoUrl={videoUrl}
        imageUrl={imageUrl}
      >
        {children}
      </PhoneScreenFrame>
    </div>
  );
}

export function BrowserShell({ children, bgStyle, effects, videoUrl, imageUrl }: { children: React.ReactNode; bgStyle?: string; effects?: string[]; videoUrl?: string; imageUrl?: string }) {
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
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#ff5f56" }} />
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#ffbd2e" }} />
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#27c93f" }} />
        </div>
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

      <div
        style={{
          position: "absolute", top: 32, left: 0, right: 0, bottom: 0,
          background: (videoUrl || imageUrl) ? "#0b1020" : (bgStyle ?? "linear-gradient(180deg, #fafbff 0%, #f0f2fb 100%)"),
          padding: "24px 28px 24px",
          display: "flex", flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt=""
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", zIndex: 0 }}
          />
        )}
        {videoUrl && (
          <video
            src={videoUrl}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", zIndex: 0 }}
          />
        )}
        <EffectsOverlay effects={effects} />
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

// ── Skeleton shown before the branding store hydrates from localStorage ────────
function DashboardPreviewPanelSkeleton({ width = 420 }: { width?: number | string }) {
  const shimmer: React.CSSProperties = {
    background: "linear-gradient(100deg, #e4e8f7 0%, #f0f3fc 50%, #e4e8f7 100%)",
    backgroundSize: "200% 100%",
    animation: "lhShimmer var(--motion-shimmer) linear infinite",
    borderRadius: 8,
  };
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
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div
          style={{
            width: 220,
            height: 440,
            borderRadius: 32,
            background: "#fff",
            border: "2px solid #e4e8f7",
            padding: "28px 18px 20px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 12,
          }}
        >
          <div style={{ ...shimmer, width: 52, height: 52, borderRadius: "50%", flexShrink: 0 }} />
          <div style={{ ...shimmer, width: 110, height: 13 }} />
          <div style={{ ...shimmer, width: 80, height: 10 }} />
          {[0, 1, 2].map((i) => (
            <div key={i} style={{ ...shimmer, width: "100%", height: 36, borderRadius: 10 }} />
          ))}
          <div style={{ ...shimmer, width: 90, height: 10, marginTop: 8 }} />
        </div>
      </div>
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────
export interface DashboardPreviewPanelProps {
  /** Panel width — number for px (default 420) or CSS string e.g. "100%" for sheet mode */
  width?: number | string;
  /** Show the "Current theme" footer with random-theme button (branding page only) */
  showThemeFooter?: boolean;
  /** Called when user clicks "Pick a handle" — only shown when handle is unset */
  onPickHandle?: () => void;
}

export function DashboardPreviewPanel({ width = 420, showThemeFooter = false, onPickHandle }: DashboardPreviewPanelProps) {
  const links = useLinksStore((s) => s.links);
  const {
    hydrated, displayName, bio, handle,
    backgroundType, backgroundValue, themeId, onRandomTheme,
  } = useBrandingStore(
    useShallow((s) => ({
      hydrated:        s.hydrated,
      displayName:     s.displayName,
      bio:             s.bio,
      handle:          s.handle,
      backgroundType:  s.backgroundType,
      backgroundValue: s.backgroundValue,
      themeId:         s.themeId,
      onRandomTheme:   s.randomTheme,
    }))
  );
  const appearance = useBrandingStore(useShallow(brandingStateToPreviewAppearance)) as AppearanceTheme;
  const publicUrl = brandingPublicUrl(handle);
  const themeLabel = getBrandingThemeById(themeId).name;
  const [device, setDevice] = useState<"mobile" | "desktop">("mobile");
  const [showSharePop, setShowSharePop] = useState(false);
  const [copied, setCopied] = useState(false);
  const [shareConfirm, setShareConfirm] = useState<ShareNetwork | null>(null);
  const shareRef = useRef<HTMLDivElement>(null);

  // Local dev serves plain HTTP (no TLS listener on localhost); production always serves HTTPS.
  const protocol = process.env.NODE_ENV === "production" ? "https" : "http";
  const fullUrl = `${protocol}://${publicUrl}`;

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

  const handleDownloadQr = () => {
    if (!handle) return;
    // The server derives the handle from the session and sets the filename via
    // Content-Disposition; `download` is just a client-side fallback hint.
    const a = document.createElement("a");
    a.href = "/api/qr";
    a.download = `linkhub-${handle}-qr.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const handleNativeShare = async () => {
    if (!handle) return;
    if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
      try {
        await navigator.share({ url: fullUrl, title: displayName || "My LinkHub" });
        return;
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") return;
      }
    }
    await handleCopyUrl();
  };

  const handleSocialClick = (net: ShareNetwork) => {
    setShowSharePop(false);
    setShareConfirm(net);
  };

  // Split publicUrl for coloured handle display
  const slashIdx = publicUrl.lastIndexOf("/");
  const domain = slashIdx >= 0 ? publicUrl.slice(0, slashIdx + 1) : publicUrl;
  const slug   = slashIdx >= 0 ? publicUrl.slice(slashIdx + 1)     : "";

  let screenBg =
    appearance?.bgStyle ??
    appearance?.bgColor ??
    "linear-gradient(180deg, #fafbff 0%, #f0f2fb 100%)";
  let screenDark =
    appearance?.dark ??
    (appearance?.bgColor ? isDarkBg(appearance.bgColor) : false);

  if (backgroundType === "gradient") {
    if (backgroundValue.startsWith("solid:")) {
      screenBg = backgroundValue.replace("solid:", "");
      screenDark = false;
    } else {
      const grad = getGradientById(backgroundValue);
      if (grad) { screenBg = grad.value; screenDark = grad.dark; }
    }
  } else if (backgroundType === "image" || backgroundType === "video") {
    screenBg = "#0b1020";
    screenDark = true;
  }

  const imageUrl = backgroundType === "image" && backgroundValue ? backgroundValue : undefined;
  const videoUrl = backgroundType === "video" && backgroundValue ? backgroundValue : undefined;

  if (!hydrated) return <DashboardPreviewPanelSkeleton width={width} />;

  const isSheet = typeof width === "string";
  const screenContent = (
    <PhoneScreenContent
      displayName={displayName}
      bio={bio}
      links={links}
      avatarSize={device === "desktop" ? 76 : undefined}
      appearance={appearance}
    />
  );

  return (
    <div
      style={{
        width,
        background: isSheet ? "white" : "linear-gradient(180deg, #f0f2fb 0%, #e9ecf8 100%)",
        borderLeft: isSheet ? "none" : "1px solid #eef0f7",
        padding: isSheet ? "52px 16px 0" : "28px 24px",
        position: isSheet ? "relative" : "sticky",
        top: 0,
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        flexShrink: 0,
      }}
    >
      {!isSheet ? (
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
      ) : null}

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
          <div suppressHydrationWarning style={{ fontSize: 12, color: "#6b75a3", marginTop: 2, display: "flex", alignItems: "center", gap: 4, flexWrap: "wrap" }}>
            <span suppressHydrationWarning>{domain}</span>
            {!handle && onPickHandle ? (
              <button
                type="button"
                onClick={onPickHandle}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                  fontSize: 11,
                  fontWeight: 500,
                  padding: "2px 8px 2px 6px",
                  borderRadius: 99,
                  border: "1.5px dashed #a8aecb",
                  background: "transparent",
                  color: "#6b75a3",
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 20h9M16.5 3.5a2.121 2.121 0 113 3L7 19l-4 1 1-4z"/>
                </svg>
                Pick a handle
              </button>
            ) : handle ? (
              <span suppressHydrationWarning style={{ color: "#3b46e0", fontWeight: 500 }}>{slug}</span>
            ) : null}
          </div>
        </div>

        {!isSheet ? (
        <div style={{ display: "flex", gap: 6 }}>
          <div ref={shareRef} style={{ position: "relative" }}>
            <PreviewActionBtn
              title="Share"
              onClick={() => setShowSharePop((p) => !p)}
              active={showSharePop}
              disabled={!handle}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13"/>
              </svg>
            </PreviewActionBtn>

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

                <div
                  style={{
                    padding: "14px 16px 12px",
                    borderBottom: "1px solid #f2f4fb",
                    fontSize: 12, fontWeight: 600, color: "#0b1020",
                  }}
                >
                  Share your linkhub
                </div>

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

                <div style={{ height: 1, background: "#f2f4fb", margin: "0 14px" }} />

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

                <div style={{ height: 1, background: "#f2f4fb", margin: "0 14px" }} />

                <div style={{ padding: "12px 14px 14px" }}>
                  <button
                    type="button"
                    onClick={handleDownloadQr}
                    style={{
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                      width: "100%", padding: "10px 12px", borderRadius: 10,
                      background: "#f7f8fc", border: "1px solid #eef0f7",
                      color: "#1a2244", fontSize: 12, fontWeight: 500,
                      cursor: "pointer", fontFamily: "inherit",
                      transition: "all 0.15s",
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
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15">
                      <rect x="3" y="3" width="7" height="7" rx="1" />
                      <rect x="14" y="3" width="7" height="7" rx="1" />
                      <rect x="3" y="14" width="7" height="7" rx="1" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14 14h3v3M21 14v.01M14 21h3M21 17v4" />
                    </svg>
                    Download QR code
                  </button>
                </div>
              </div>
            )}
          </div>

          <PreviewActionBtn title="Download QR code" onClick={handleDownloadQr} disabled={!handle}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15">
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M14 14h3v3M21 14v.01M14 21h3M21 17v4" />
            </svg>
          </PreviewActionBtn>

          <PreviewActionBtn title="Open in new tab" href={fullUrl} disabled={!handle}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15">
              <path strokeLinecap="round" strokeLinejoin="round" d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3"/>
            </svg>
          </PreviewActionBtn>
        </div>
        ) : null}
      </div>

      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: isSheet ? "stretch" : "center",
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
            alignSelf: isSheet ? "center" : undefined,
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
            alignItems: isSheet && device === "mobile" ? "stretch" : "center",
            justifyContent: "center",
            width: "100%",
            minHeight: 0,
            overflow: isSheet && device === "desktop" ? "auto" : undefined,
          }}
        >
          {device === "desktop" ? (
            <BrowserShell bgStyle={screenBg} imageUrl={imageUrl} videoUrl={videoUrl} effects={appearance?.effects}>
              {screenContent}
            </BrowserShell>
          ) : isSheet ? (
            <PhoneEdgeShell bgStyle={screenBg} showGlow={screenDark} imageUrl={imageUrl} videoUrl={videoUrl} effects={appearance?.effects}>
              {screenContent}
            </PhoneEdgeShell>
          ) : (
            <PhoneShell bgStyle={screenBg} showGlow={screenDark} imageUrl={imageUrl} videoUrl={videoUrl} effects={appearance?.effects}>
              {screenContent}
            </PhoneShell>
          )}
        </div>
      </div>

      {showThemeFooter && themeLabel && !isSheet ? (
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

      {isSheet ? (
        <div
          style={{
            flexShrink: 0,
            padding: "12px 0",
            paddingBottom: "calc(12px + env(safe-area-inset-bottom, 0px))",
            position: "relative",
            zIndex: 50,
          }}
        >
          <div style={{ display: "flex", gap: 8 }}>
            <button
              type="button"
              onClick={() => void handleNativeShare()}
              disabled={!handle}
              style={{
                flex: 1,
                minHeight: 44,
                background: copied ? "#16a34a" : "#3b46e0",
                color: "white",
                borderRadius: 12,
                fontWeight: 600,
                fontSize: 14,
                border: 0,
                cursor: handle ? "pointer" : "not-allowed",
                opacity: handle ? 1 : 0.5,
                fontFamily: "inherit",
                transition: "background 0.15s",
              }}
            >
              {copied ? "Link copied!" : "Share my page"}
            </button>
            <button
              type="button"
              onClick={handleDownloadQr}
              disabled={!handle}
              title="Download QR code"
              aria-label="Download QR code"
              style={{
                flexShrink: 0,
                width: 44,
                minHeight: 44,
                background: "white",
                color: "#3b46e0",
                borderRadius: 12,
                border: "1px solid #eef0f7",
                cursor: handle ? "pointer" : "not-allowed",
                opacity: handle ? 1 : 0.5,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                <rect x="3" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M14 14h3v3M21 14v.01M14 21h3M21 17v4" />
              </svg>
            </button>
          </div>
        </div>
      ) : null}

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

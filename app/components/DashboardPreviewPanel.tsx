"use client";

import { useState } from "react";
import type { ManagedLink } from "../user-admin/components/types";

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

// ── Phone screen content (avatar, bio, social icons, links, footer) ────────────
function PhoneScreenContent({
  displayName,
  handle,
  links,
}: {
  displayName: string;
  handle: string;
  links: ManagedLink[];
}) {
  const initial = displayName.charAt(0).toUpperCase() || "?";
  const published = links.filter((l) => !l.draft);

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
            width: 70, height: 70,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #3b46e0, #7a85ff)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "white",
            fontFamily: "var(--font-instrument-serif), Georgia, serif",
            fontSize: 28, fontStyle: "italic",
            boxShadow: "0 10px 24px -8px rgba(59,70,224,0.45)",
            border: "3px solid white",
          }}
        >
          {initial}
        </div>
        {/* Online dot */}
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
          fontFamily: "var(--font-instrument-serif), Georgia, serif",
          fontStyle: "italic",
          fontSize: 19,
          color: "#0b1020",
          letterSpacing: "-0.01em",
          textAlign: "center",
          lineHeight: 1.1,
        }}
      >
        {displayName || "Your Name"}
      </div>

      {/* Handle */}
      {handle && (
        <div
          style={{
            fontSize: 11.5,
            fontFamily: "'Geist Mono', ui-monospace, 'Courier New', monospace",
            color: "#3b46e0",
            marginTop: 3,
          }}
        >
          @{handle}
        </div>
      )}

      {/* Bio */}
      <div
        style={{
          fontSize: 11,
          color: "#6b75a3",
          margin: "8px 12px 16px",
          textAlign: "center",
          lineHeight: 1.5,
        }}
      >
        Connecting with your community &mdash; one link at a time.
      </div>

      {/* Social icons row */}
      <div style={{ display: "flex", gap: 10, marginBottom: 18 }}>
        {SOCIAL_ICONS.map(({ label, svg }) => (
          <div
            key={label}
            title={label}
            style={{
              width: 26, height: 26,
              background: "white",
              borderRadius: "50%",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#6b75a3",
              boxShadow: "0 1px 2px rgba(15,23,42,0.04), 0 1px 1px rgba(15,23,42,0.03)",
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
              color: "#6b75a3",
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
                background: "white",
                border: "1px solid #eef0f7",
                borderRadius: 12,
                padding: "11px 14px",
                display: "flex",
                alignItems: "center",
                gap: 10,
                fontSize: 12.5,
                fontWeight: 500,
                color: "#0b1020",
                boxShadow: "0 2px 6px rgba(15,23,42,0.04)",
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
              <span style={{ color: "#a8aecb", flexShrink: 0 }}>
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

// ── Small action icon button (share / open-in-new-tab) ────────────────────────
function PreviewActionBtn({
  children,
  title,
  onClick,
  href,
}: {
  children: React.ReactNode;
  title: string;
  onClick?: () => void;
  href?: string;
}) {
  const style: React.CSSProperties = {
    width: 32, height: 32,
    borderRadius: 8,
    background: "white",
    color: "#6b75a3",
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
      (e.currentTarget as HTMLElement).style.background = "white";
      (e.currentTarget as HTMLElement).style.color = "#6b75a3";
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
function PhoneShell({ children }: { children: React.ReactNode }) {
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
          background: "linear-gradient(180deg, #fafbff 0%, #f0f2fb 100%)",
          padding: "44px 22px 22px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Radial glow */}
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
        <div style={{ position: "relative", zIndex: 2, display: "flex", flexDirection: "column", height: "100%", minHeight: 0 }}>
          {children}
        </div>
      </div>
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────
export interface DashboardPreviewPanelProps {
  links: ManagedLink[];
  displayName: string;
  /** URL slug after the slash, e.g. "joelosei" */
  handle?: string;
  /** Full public URL without protocol, e.g. "linkhub.co/joelosei" */
  publicUrl: string;
  onShareClick?: () => void;
  /** Panel width (default 420) */
  width?: number;
}

export function DashboardPreviewPanel({
  links,
  displayName,
  handle = "",
  publicUrl,
  onShareClick,
  width = 420,
}: DashboardPreviewPanelProps) {
  const [device, setDevice] = useState<"mobile" | "desktop">("mobile");
  const [theme, setTheme] = useState<"light" | "dark">("light");

  // Split publicUrl into domain and slug for the coloured handle display
  const slashIdx = publicUrl.lastIndexOf("/");
  const domain = slashIdx >= 0 ? publicUrl.slice(0, slashIdx + 1) : publicUrl;
  const slug   = slashIdx >= 0 ? publicUrl.slice(slashIdx + 1)     : "";

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
          zIndex: 10,
        }}
      >
        <div>
          <div
            style={{
              fontFamily: "var(--font-instrument-serif), Georgia, serif",
              fontStyle: "italic",
              fontSize: 22,
              letterSpacing: "-0.01em",
              color: "#0b1020",
            }}
          >
            Live preview
          </div>
          <div style={{ fontSize: 12, color: "#6b75a3", marginTop: 2 }}>
            {domain}
            <span style={{ color: "#3b46e0", fontWeight: 500 }}>{slug}</span>
          </div>
        </div>

        <div style={{ display: "flex", gap: 6 }}>
          {onShareClick && (
            <PreviewActionBtn title="Share" onClick={onShareClick}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13"/>
              </svg>
            </PreviewActionBtn>
          )}
          <PreviewActionBtn title="Open in new tab" href={`https://${publicUrl}`}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15">
              <path strokeLinecap="round" strokeLinejoin="round" d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3"/>
            </svg>
          </PreviewActionBtn>
        </div>
      </div>

      {/* Device tabs */}
      <div
        style={{
          background: "rgba(255,255,255,0.7)",
          border: "1px solid rgba(255,255,255,0.9)",
          backdropFilter: "blur(8px)",
          borderRadius: 99,
          padding: 3,
          marginBottom: 18,
          display: "inline-flex",
          alignSelf: "center",
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

      {/* Phone + content */}
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          zIndex: 10,
          minHeight: 0,
        }}
      >
        <PhoneShell>
          <PhoneScreenContent
            displayName={displayName}
            handle={handle}
            links={links}
          />
        </PhoneShell>
      </div>

      {/* Theme switch */}
      <div
        style={{
          marginTop: 16,
          display: "inline-flex",
          background: "rgba(255,255,255,0.7)",
          backdropFilter: "blur(8px)",
          borderRadius: 99,
          padding: 3,
          alignSelf: "center",
          position: "relative",
          zIndex: 10,
          border: "1px solid rgba(255,255,255,0.9)",
        }}
      >
        {/* Sun */}
        <button
          type="button"
          aria-label="Light mode"
          onClick={() => setTheme("light")}
          style={{
            width: 30, height: 30,
            borderRadius: "50%",
            background: theme === "light" ? "white" : "transparent",
            border: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
            color: theme === "light" ? "#3b46e0" : "#6b75a3",
            cursor: "pointer",
            boxShadow: theme === "light"
              ? "0 1px 2px rgba(15,23,42,0.04), 0 1px 1px rgba(15,23,42,0.03)"
              : "none",
            transition: "all 0.15s",
          }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
            <circle cx="12" cy="12" r="5"/>
            <path strokeLinecap="round" d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
          </svg>
        </button>

        {/* Moon */}
        <button
          type="button"
          aria-label="Dark mode"
          onClick={() => setTheme("dark")}
          style={{
            width: 30, height: 30,
            borderRadius: "50%",
            background: theme === "dark" ? "white" : "transparent",
            border: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
            color: theme === "dark" ? "#3b46e0" : "#6b75a3",
            cursor: "pointer",
            boxShadow: theme === "dark"
              ? "0 1px 2px rgba(15,23,42,0.04), 0 1px 1px rgba(15,23,42,0.03)"
              : "none",
            transition: "all 0.15s",
          }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
          </svg>
        </button>
      </div>
    </div>
  );
}

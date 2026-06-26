"use client";

import { useState, useEffect } from "react";
import { useBrandingStore } from "@/store/brandingStore";
import { useLinksStore } from "@/store/linksStore";
import { useShallow } from "zustand/react/shallow";
import { loadGoogleFont } from "@/lib/fontLoader";
import { brandingStateToPreviewAppearance, brandingPublicUrl } from "@/lib/brandingState";
import { getGradientById } from "@/app/constants/editorBackgroundGradients";
import { BRANDING_FONT_SERIF } from "@/app/constants/brandingFonts";
import {
  PhoneShell,
  BrowserShell,
  PhoneScreenContent,
  type AppearanceTheme,
} from "@/app/components/DashboardPreviewPanel";
import type { ManagedLink } from "@/app/(dashboard)/user-admin/components/types";

const SAMPLE_LINKS: ManagedLink[] = [
  { id: "s1", title: "My Website",      url: "#", icon: "website",   clicks: "0", status: 1 },
  { id: "s2", title: "Instagram",       url: "#", icon: "instagram", clicks: "0", status: 1 },
  { id: "s3", title: "YouTube Channel", url: "#", icon: "youtube",   clicks: "0", status: 1 },
  { id: "s4", title: "Twitter / X",     url: "#", icon: "twitter",   clicks: "0", status: 1 },
  { id: "s5", title: "Spotify",         url: "#", icon: "spotify",   clicks: "0", status: 1 },
];

export function EditorPreviewCenter() {
  const [device, setDevice] = useState<"mobile" | "desktop">("mobile");
  const rawLinks = useLinksStore((s) => s.links);
  const published = rawLinks.filter((l) => l.status === 1);
  // Show sample links so users can see how effects + card styles will look
  const links = published.length > 0 ? rawLinks : SAMPLE_LINKS;

  // Load selected fonts into the document so the preview renders them correctly
  const fontFamily = useBrandingStore((s) => s.fontFamily);
  const bodyFont   = useBrandingStore((s) => s.bodyFont);
  useEffect(() => { if (fontFamily) loadGoogleFont(fontFamily); }, [fontFamily]);
  useEffect(() => { if (bodyFont)   loadGoogleFont(bodyFont);   }, [bodyFont]);

  const store = useBrandingStore(
    useShallow((s) => ({
      themeId: s.themeId,
      displayName: s.displayName,
      handle: s.handle,
      bio: s.bio,
      accentColor: s.accentColor,
      buttonStyle: s.buttonStyle,
      fontFamily: s.fontFamily,
      userPickedTheme: s.userPickedTheme,
      backgroundType: s.backgroundType,
      backgroundValue: s.backgroundValue,
      backgroundKey: s.backgroundKey,
      effects: s.effects,
      textColor: s.textColor,
      cardStyle: s.cardStyle,
      bodyFont: s.bodyFont,
      overlayColor: s.overlayColor,
      overlayOpacity: s.overlayOpacity,
      profileLayout: s.profileLayout,
      linkDensity: s.linkDensity,
      customThemeName: s.customThemeName,
    }))
  );

  // Derive base appearance from theme, then override with editor state
  const base = brandingStateToPreviewAppearance(store) as AppearanceTheme;
  let bgStyle = base.bgStyle ?? "linear-gradient(180deg, #fafbff, #f0f2fb)";
  let dark = base.dark ?? false;

  if (store.backgroundType === "gradient") {
    if (store.backgroundValue.startsWith("solid:")) {
      bgStyle = store.backgroundValue.replace("solid:", "");
      dark = false;
    } else {
      const grad = getGradientById(store.backgroundValue);
      if (grad) {
        bgStyle = grad.value;
        dark = grad.dark;
      }
    }
  } else if (store.backgroundType === "image" && store.backgroundValue) {
    bgStyle = "#0b1020";
    dark = true;
  } else if (store.backgroundType === "video") {
    bgStyle = "#0b1020";
    dark = true;
  }

  const imageUrl = store.backgroundType === "image" && store.backgroundValue
    ? store.backgroundValue
    : undefined;

  const videoUrl = store.backgroundType === "video" && store.backgroundValue
    ? store.backgroundValue
    : undefined;

  const appearance: AppearanceTheme = {
    ...base,
    bgStyle,
    dark,
    textColor: store.textColor,
    cardStyle: store.cardStyle,
    bodyFont: store.bodyFont,
    effects: store.effects,
  };

  const publicUrl = brandingPublicUrl(store.handle);
  const slashIdx = publicUrl.lastIndexOf("/");
  const domain = slashIdx >= 0 ? publicUrl.slice(0, slashIdx + 1) : publicUrl;
  const slug = slashIdx >= 0 ? publicUrl.slice(slashIdx + 1) : "";

  const overlayStyle: React.CSSProperties | null =
    store.overlayOpacity > 0
      ? {
          position: "absolute",
          inset: 0,
          background: store.overlayColor,
          opacity: store.overlayOpacity / 100,
          pointerEvents: "none",
          zIndex: 1,
        }
      : null;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        flex: 1,
        width: "100%",
        height: "100%",
        padding: "24px",
        background: "linear-gradient(180deg, #f0f2fb 0%, #e9ecf8 100%)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Ambient glow */}
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
          marginBottom: 16,
          position: "relative",
          zIndex: 10,
          flexShrink: 0,
        }}
      >
        <div>
          <div
            style={{
              fontFamily: BRANDING_FONT_SERIF,
              fontStyle: "italic",
              fontSize: 22,
              letterSpacing: "-0.01em",
              color: "#0b1020",
            }}
          >
            Live preview 
          </div>
          <div
            suppressHydrationWarning
            style={{ fontSize: 12, color: "#6b75a3", marginTop: 2, display: "flex", gap: 2 }}
          >
            <span suppressHydrationWarning>{domain}</span>
            {slug && (
              <span style={{ color: "#3b46e0", fontWeight: 500 }}>{slug}</span>
            )}
          </div>
        </div>
      </div>

      {/* Device toggle */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          marginBottom: 16,
          position: "relative",
          zIndex: 10,
          flexShrink: 0,
        }}
      >
        <div
          style={{
            background: "rgba(255,255,255,0.7)",
            border: "1px solid rgba(255,255,255,0.9)",
            backdropFilter: "blur(8px)",
            borderRadius: 99,
            padding: 3,
            display: "inline-flex",
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
                boxShadow:
                  device === d
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
      </div>

      {/* Phone / Browser frame */}
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: 0,
          position: "relative",
          zIndex: 10,
        }}
      >
        {device === "desktop" ? (
          <BrowserShell bgStyle={bgStyle} effects={store.effects} videoUrl={videoUrl} imageUrl={imageUrl}>
            {overlayStyle && <div style={overlayStyle} />}
            <PhoneScreenContent
              displayName={store.displayName}
              bio={store.bio}
              links={links}
              avatarSize={76}
              appearance={appearance}
            />
          </BrowserShell>
        ) : (
          <PhoneShell bgStyle={bgStyle} showGlow={dark} effects={store.effects} videoUrl={videoUrl} imageUrl={imageUrl}>
            {overlayStyle && <div style={overlayStyle} />}
            <PhoneScreenContent
              displayName={store.displayName}
              bio={store.bio}
              links={links}
              appearance={appearance}
            />
          </PhoneShell>
        )}
      </div>
    </div>
  );
}

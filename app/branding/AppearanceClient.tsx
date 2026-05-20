"use client";

import { useState } from "react";
import CollapsibleSidebar from "../components/CollapsibleSidebar";
import { useSidebar } from "../components/SidebarContext";
import { DashboardPreviewPanel } from "../components/DashboardPreviewPanel";
import { DashboardTopBar } from "../user-admin/components/DashboardTopBar";
import { THEME_PRESETS, type ThemePreset } from "../constants/themePresets";
import { PROFILE_PUBLIC_URL } from "../constants/profile";
import { DEMO_MANAGED_LINKS } from "@/lib/demoManagedLinks";
import { ProfileSection } from "./components/ProfileSection";
import { ThemesSection } from "./components/ThemesSection";
import { QuickTuneSection } from "./components/QuickTuneSection";
import type { AppearanceState } from "../components/MobilePreview";

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p
      style={{
        fontSize: 10.5,
        fontWeight: 600,
        color: "#6b75a3",
        letterSpacing: "0.12em",
        textTransform: "uppercase",
      }}
    >
      {children}
    </p>
  );
}

export default function AppearanceClient() {
  const { isCollapsed } = useSidebar();

  const [appearance, setAppearance] = useState<AppearanceState>(
    THEME_PRESETS[0].appearance
  );
  const [displayName, setDisplayName] = useState("Your Name");
  const [bio, setBio] = useState("Connecting with your community.");

  const handleSelectTheme = (preset: ThemePreset) => {
    setAppearance((prev) => ({
      ...preset.appearance,
      profileTitle: prev.profileTitle,
      profileBio: prev.profileBio,
    }));
  };

  const handle = PROFILE_PUBLIC_URL.split("/").pop() ?? "";

  return (
    <div className="bg-[#f7f8fc] text-on-surface min-h-screen antialiased font-sans flex overflow-hidden">
      <CollapsibleSidebar>
        <main
          className={`flex-1 transition-all duration-500 ease-in-out ${
            isCollapsed ? "lg:ml-[80px]" : "lg:ml-[256px]"
          } ml-0 overflow-y-auto bg-[#f7f8fc] h-screen`}
        >
          <div className="flex flex-col lg:flex-row min-h-screen">
            {/* Left: editor */}
            <div
              className="flex-1 animate-fade-in-up"
              style={{ padding: "22px 32px 60px", minWidth: 0 }}
            >
              <DashboardTopBar />

              {/* Page heading */}
              <div style={{ marginBottom: 28 }}>
                <h1
                  style={{
                    fontSize: 38,
                    fontWeight: 400,
                    letterSpacing: "-0.02em",
                    color: "#0b1020",
                    fontFamily:
                      "var(--font-instrument-serif), Georgia, serif",
                    lineHeight: 1.05,
                  }}
                >
                  <em style={{ fontStyle: "italic" }}>Your</em>{" "}
                  <em style={{ fontStyle: "italic", color: "#3b46e0" }}>
                    branding.
                  </em>
                </h1>
                <p style={{ fontSize: 13.5, color: "#6b75a3", marginTop: 6 }}>
                  Customize your public profile to reflect your brand&apos;s unique style.
                </p>
              </div>

              {/* Sections */}
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                <SectionLabel>Profile</SectionLabel>
                <ProfileSection
                  displayName={displayName}
                  bio={bio}
                  onDisplayNameChange={setDisplayName}
                  onBioChange={setBio}
                />

                <SectionLabel>Theme</SectionLabel>
                <ThemesSection
                  selectedThemeId={appearance.themeId}
                  onSelect={handleSelectTheme}
                />

                <SectionLabel>Quick tune</SectionLabel>
                <QuickTuneSection
                  accentColor={appearance.titleColor}
                  buttonStyle={appearance.buttonStyle}
                  fontFamily={appearance.fontFamily}
                  onAccentColorChange={(v) =>
                    setAppearance((prev) => ({ ...prev, titleColor: v }))
                  }
                  onButtonStyleChange={(v) =>
                    setAppearance((prev) => ({ ...prev, buttonStyle: v }))
                  }
                  onFontFamilyChange={(v) =>
                    setAppearance((prev) => ({ ...prev, fontFamily: v }))
                  }
                />

                {/* Save */}
                <div style={{ display: "flex", justifyContent: "flex-end", paddingTop: 4 }}>
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 text-white cursor-pointer transition-all duration-150 active:scale-[0.98]"
                    style={{
                      borderRadius: 99,
                      padding: "11px 22px",
                      fontSize: 13.5,
                      fontWeight: 600,
                      border: 0,
                      background: "linear-gradient(180deg, #3b46e0, #2a37c0)",
                      boxShadow:
                        "0 6px 18px -6px rgba(59,70,224,0.55), inset 0 1px 0 rgba(255,255,255,0.15)",
                      fontFamily: "inherit",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.transform =
                        "translateY(-1px)";
                      (e.currentTarget as HTMLButtonElement).style.boxShadow =
                        "0 10px 22px -6px rgba(59,70,224,0.55), inset 0 1px 0 rgba(255,255,255,0.15)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.transform =
                        "translateY(0)";
                      (e.currentTarget as HTMLButtonElement).style.boxShadow =
                        "0 6px 18px -6px rgba(59,70,224,0.55), inset 0 1px 0 rgba(255,255,255,0.15)";
                    }}
                  >
                    Save changes
                  </button>
                </div>
              </div>
            </div>

            {/* Right: live preview */}
            <div className="hidden lg:block">
              <DashboardPreviewPanel
                links={DEMO_MANAGED_LINKS}
                displayName={displayName}
                handle={handle}
                publicUrl={PROFILE_PUBLIC_URL}
                appearance={{
                  bgColor: appearance.bgColor,
                  textColor: appearance.textColor,
                  titleColor: appearance.titleColor,
                  buttonStyle: appearance.buttonStyle,
                }}
              />
            </div>
          </div>
        </main>
      </CollapsibleSidebar>
    </div>
  );
}

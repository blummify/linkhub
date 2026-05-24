"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import Link from "next/link";
import CollapsibleSidebar from "../components/CollapsibleSidebar";
import { CommandPalette } from "../components/CommandPalette";
import { DashboardPreviewPanel } from "../components/DashboardPreviewPanel";
import { DashboardTopBar } from "../user-admin/components/DashboardTopBar";
import { BRANDING_THEMES } from "../constants/brandingThemes";
import { getBrandingThemeById } from "@/lib/brandingState";
import { BRANDING_FONT_SERIF } from "../constants/brandingFonts";
import { ProfileSection } from "./components/ProfileSection";
import { ThemesSection } from "./components/ThemesSection";
import { QuickTuneSection } from "./components/QuickTuneSection";
import { useFileUpload } from "@/lib/hooks/useFileUpload";
import { updateAvatarUrl, removeAvatar } from "@/app/actions/profile";
import { getProfile } from "@/app/actions/links";
import { deleteOrphanedUpload } from "@/app/actions/upload";
import { useBrandingStore } from "@/store/brandingStore";
import { useProfileStore } from "@/store/profileStore";
import { useSidebarStore } from "@/store/sidebarStore";

function SectionHead({
  title,
  sub,
  actions,
}: {
  title: string;
  sub: string;
  actions?: React.ReactNode;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "end",
        justifyContent: "space-between",
        marginBottom: 16,
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
          {title}
        </div>
        <div style={{ fontSize: 12.5, color: "#6b75a3", marginTop: 2 }}>{sub}</div>
      </div>
      {actions}
    </div>
  );
}

export default function AppearanceClient() {
  const isCollapsed = useSidebarStore((s) => s.isCollapsed);

  const displayName = useBrandingStore((s) => s.displayName);
  const handle = useBrandingStore((s) => s.handle);
  const bio = useBrandingStore((s) => s.bio);
  const accentColor = useBrandingStore((s) => s.accentColor);
  const buttonStyle = useBrandingStore((s) => s.buttonStyle);
  const fontFamily = useBrandingStore((s) => s.fontFamily);
  const themeId = useBrandingStore((s) => s.themeId);
  const isDirty = useBrandingStore((s) => s.isDirty);
  const setDisplayName = useBrandingStore((s) => s.setDisplayName);
  const setHandle = useBrandingStore((s) => s.setHandle);
  const setBio = useBrandingStore((s) => s.setBio);
  const setAccentColor = useBrandingStore((s) => s.setAccentColor);
  const setButtonStyle = useBrandingStore((s) => s.setButtonStyle);
  const setFontFamily = useBrandingStore((s) => s.setFontFamily);
  const selectTheme = useBrandingStore((s) => s.selectTheme);
  const randomTheme = useBrandingStore((s) => s.randomTheme);
  const reset = useBrandingStore((s) => s.reset);
  const markSaved = useBrandingStore((s) => s.markSaved);

  const theme = getBrandingThemeById(themeId);

  // Avatar — read from profileStore if already fetched, otherwise fetch once
  const avatarUrl = useProfileStore((s) => s.avatarUrl);
  const profileFetched = useProfileStore((s) => s.fetched);

  const [showPalette, setShowPalette] = useState(false);

  useEffect(() => {
    if (profileFetched) return;
    getProfile().then((p) => {
      const url = (p as { avatarUrl?: string | null } | null)?.avatarUrl ?? null;
      useProfileStore.getState().markFetched({ avatarUrl: url });
    }).catch(() => {});
  }, [profileFetched]);

  const { upload, isUploading: isUploadingAvatar } = useFileUpload({
    folder: "avatars",
    maxSizeMB: 5,
    onSuccess: async (publicUrl, key) => {
      const result = await updateAvatarUrl(publicUrl, key);
      if ("error" in result) {
        await deleteOrphanedUpload(key);
        return;
      }
      useProfileStore.getState().setAvatarUrl(publicUrl);
    },
  });

  const handleRemoveAvatar = useCallback(async () => {
    const result = await removeAvatar();
    if ("error" in result) return;
    useProfileStore.getState().setAvatarUrl(null);
  }, []);

  const themeOptions = useMemo(
    () => BRANDING_THEMES.map((t) => ({ id: t.id, name: t.name, tag: t.tag })),
    []
  );

  return (
    <>
    <div className="bg-[#f7f8fc] min-h-screen antialiased flex overflow-hidden">
      <CollapsibleSidebar>
        <main
          className={`flex-1 transition-all duration-500 ease-in-out ${
            isCollapsed ? "lg:ml-[80px]" : "lg:ml-[256px]"
          } ml-0 overflow-y-auto bg-[#f7f8fc] h-screen`}
        >
          <div className="flex flex-col lg:flex-row min-h-screen">
            <div
              className="flex-1 min-w-0 px-4 pt-[22px] pb-14 sm:px-6 lg:px-8"
            >
              <DashboardTopBar
                searchPlaceholder="Search themes, fonts, colors…"
                onSearchClick={() => setShowPalette(true)}
              />

              <div
                style={{
                  display: "flex",
                  alignItems: "end",
                  justifyContent: "space-between",
                  gap: 24,
                  marginBottom: 28,
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: 12.5,
                      color: "#6b75a3",
                      marginBottom: 6,
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <Link
                      href="/user-dashboard"
                      style={{ color: "#6b75a3", textDecoration: "none" }}
                    >
                      Dashboard
                    </Link>
                    <span style={{ color: "#d6dae9" }}>/</span>
                    <span style={{ color: "#0b1020", fontWeight: 500 }}>
                      Branding
                    </span>
                  </div>
                  <h1
                    style={{
                      fontSize: 38,
                      fontWeight: 400,
                      letterSpacing: "-0.02em",
                      color: "#0b1020",
                      fontFamily: BRANDING_FONT_SERIF,
                      fontStyle: "italic",
                      lineHeight: 1.05,
                    }}
                  >
                    Make it <em style={{ color: "#3b46e0" }}>yours</em>.
                  </h1>
                  <p
                    style={{
                      fontSize: 13.5,
                      color: "#6b75a3",
                      marginTop: 6,
                      maxWidth: 480,
                    }}
                  >
                    Pick a theme that matches your vibe. Each one is fully
                    customizable — change colors, fonts, and buttons after you
                    select.
                  </p>
                </div>

                <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                  <button
                    type="button"
                    onClick={reset}
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
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 12a9 9 0 0115-6.7l3-3v9h-9l3.7-3.7M21 12a9 9 0 01-15 6.7l-3 3v-9h9l-3.7 3.7"/>
                    </svg>
                    Reset
                  </button>
                  <button
                    type="button"
                    onClick={markSaved}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 8,
                      background: "linear-gradient(180deg, #3b46e0, #2a37c0)",
                      color: "white",
                      border: 0,
                      padding: "11px 18px",
                      borderRadius: 99,
                      fontFamily: "inherit",
                      fontSize: 13.5,
                      fontWeight: 600,
                      cursor: "pointer",
                      boxShadow:
                        "0 6px 18px -6px rgba(59,70,224,0.55), inset 0 1px 0 rgba(255,255,255,0.15)",
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                    </svg>
                    Save changes
                    <span
                      style={{
                        width: 6,
                        height: 6,
                        background: "#f59e0b",
                        borderRadius: "50%",
                        opacity: isDirty ? 1 : 0,
                        transition: "opacity 0.2s ease",
                      }}
                    />
                  </button>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
                <section>
                  <SectionHead
                    title="Your profile"
                    sub="The first thing people see when they land on your page"
                  />
                  <ProfileSection
                    displayName={displayName}
                    handle={handle}
                    bio={bio}
                    onDisplayNameChange={setDisplayName}
                    onHandleChange={setHandle}
                    onBioChange={setBio}
                    avatarUrl={avatarUrl}
                    isUploadingAvatar={isUploadingAvatar}
                    onFileSelected={upload}
                    onRemoveAvatar={handleRemoveAvatar}
                  />
                </section>

                <section>
                  <SectionHead
                    title="Themes & templates"
                    sub={`${BRANDING_THEMES.length} themes · curated by the linkhub team`}
                  />
                  <ThemesSection
                    selectedThemeId={theme.id}
                    displayName={displayName}
                    handle={handle}
                    onSelect={selectTheme}
                  />
                </section>

                <section>
                  <SectionHead
                    title="Quick tune"
                    sub="Tweak the core elements without leaving this page"
                  />
                  <QuickTuneSection
                    accentColor={accentColor}
                    buttonStyle={buttonStyle}
                    fontFamily={fontFamily}
                    onAccentColorChange={setAccentColor}
                    onButtonStyleChange={setButtonStyle}
                    onFontFamilyChange={setFontFamily}
                  />
                </section>
              </div>
            </div>

            <div className="hidden lg:block">
              <DashboardPreviewPanel showThemeFooter />
            </div>
          </div>
        </main>
      </CollapsibleSidebar>
    </div>

    <CommandPalette
      open={showPalette}
      onClose={() => setShowPalette(false)}
      variant="branding"
      brandingThemes={themeOptions}
      onSelectTheme={(themeId) => selectTheme(getBrandingThemeById(themeId))}
      onRandomTheme={randomTheme}
      searchPlaceholder="Search themes, fonts, colors…"
    />
    </>
  );
}

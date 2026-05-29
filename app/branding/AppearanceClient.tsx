"use client";

import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import Link from "next/link";
import CollapsibleSidebar from "../components/CollapsibleSidebar";
import { CommandPalette } from "../components/CommandPalette";
import { ClaimHandleModal } from "../components/ClaimHandleModal";
import { DashboardPreviewPanel } from "../components/DashboardPreviewPanel";
import { DashboardTopBar } from "../user-admin/components/DashboardTopBar";
import { BRANDING_THEMES } from "../constants/brandingThemes";
import { getBrandingThemeById } from "@/lib/brandingState";
import { BRANDING_FONT_SERIF } from "../constants/brandingFonts";
import { ProfileSection } from "./components/ProfileSection";
import { ThemesSection } from "./components/ThemesSection";
import { QuickTuneSection } from "./components/QuickTuneSection";
import { AvatarCropModal } from "./components/AvatarCropModal";
import { useFileUpload } from "@/lib/hooks/useFileUpload";
import { updateAvatarUrl, removeAvatar, updateBranding } from "@/app/actions/profile";
import { getProfile, claimHandle, checkHandleAvailability } from "@/app/actions/links";
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

  const router = useRouter();

  const [showPalette, setShowPalette] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [pendingNavUrl, setPendingNavUrl] = useState<string | null>(null);
  const [showClaimModal, setShowClaimModal] = useState(false);

  // Deferred avatar upload state
  const [cropFile, setCropFile] = useState<File | null>(null);
  const [pendingAvatarBlob, setPendingAvatarBlob] = useState<Blob | null>(null);
  const [pendingAvatarPreview, setPendingAvatarPreview] = useState<string | null>(null);

  useEffect(() => {
    queueMicrotask(() => setMounted(true));
  }, []);

  useEffect(() => {
    if (profileFetched) return;
    getProfile().then((p) => {
      if (!p) {
        useProfileStore.getState().markFetched({ avatarUrl: null });
        return;
      }
      const profile = p as { avatarUrl?: string | null; handle?: string | null; displayName?: string | null; bio?: string | null };
      useProfileStore.getState().markFetched({ avatarUrl: profile.avatarUrl ?? null });
      // Sync profile fields from DB without marking dirty
      const patch: Record<string, string> = {};
      if (profile.displayName) patch.displayName = profile.displayName;
      if (profile.handle) patch.handle = profile.handle;
      if (profile.bio) patch.bio = profile.bio;
      if (Object.keys(patch).length) useBrandingStore.setState(patch);
    }).catch(() => {});
  }, [profileFetched]);

  const isDirtyOrPending = isDirty || !!pendingAvatarBlob;

  // Guard 1 — browser refresh / tab close
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => { if (isDirtyOrPending) e.preventDefault(); };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirtyOrPending]);

  // Guard 2 — browser back / forward buttons
  useEffect(() => {
    history.pushState(null, "", location.href);
    const handler = () => {
      if (!isDirtyOrPending) return;
      history.pushState(null, "", location.href);
      setPendingNavUrl(null);
      setShowLeaveModal(true);
    };
    window.addEventListener("popstate", handler);
    return () => window.removeEventListener("popstate", handler);
  }, [isDirtyOrPending]);

  // Guard 3 — in-app <Link> clicks (sidebar, breadcrumbs, etc.)
  useEffect(() => {
    if (!isDirtyOrPending) return;
    const handler = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement).closest("a[href]") as HTMLAnchorElement | null;
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#") || href.startsWith("mailto:")) return;
      e.preventDefault();
      e.stopPropagation();
      setPendingNavUrl(href);
      setShowLeaveModal(true);
    };
    document.addEventListener("click", handler, true);
    return () => document.removeEventListener("click", handler, true);
  }, [isDirtyOrPending]);

  // Revoke the preview object URL when it changes or on unmount
  useEffect(() => {
    return () => { if (pendingAvatarPreview) URL.revokeObjectURL(pendingAvatarPreview); };
  }, [pendingAvatarPreview]);

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
    // Also discard any pending crop that hasn't been saved yet
    setPendingAvatarBlob(null);
    setPendingAvatarPreview(null);
    const result = await removeAvatar();
    if ("error" in result) return;
    useProfileStore.getState().setAvatarUrl(null);
  }, []);

  const handleSave = useCallback(async () => {
    if (pendingAvatarBlob) {
      const file = new File([pendingAvatarBlob], "avatar.jpg", { type: "image/jpeg" });
      await upload(file);
      setPendingAvatarBlob(null);
      setPendingAvatarPreview(null);
    }
    await updateBranding({ displayName, bio });
    markSaved();
  }, [pendingAvatarBlob, upload, displayName, bio, markSaved]);

  const handleLeaveAnyway = useCallback(() => {
    setShowLeaveModal(false);
    useBrandingStore.getState().reset();
    setPendingAvatarBlob(null);
    setPendingAvatarPreview(null);
    if (pendingNavUrl) router.push(pendingNavUrl);
    else history.go(-1);
  }, [pendingNavUrl, router]);

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
                    onClick={handleSave}
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
                        width: 8,
                        height: 8,
                        background: "#f59e0b",
                        borderRadius: "50%",
                        opacity: isDirty || pendingAvatarBlob ? 1 : 0,
                        transition: "opacity 0.2s ease",
                        animation: isDirty || pendingAvatarBlob ? "dot-blink 1.2s ease-in-out infinite" : "none",
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
                    avatarUrl={pendingAvatarPreview ?? avatarUrl}
                    isUploadingAvatar={isUploadingAvatar}
                    onFileSelected={(file) => setCropFile(file)}
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
              <DashboardPreviewPanel showThemeFooter onPickHandle={() => setShowClaimModal(true)} />
            </div>
          </div>
        </main>
      </CollapsibleSidebar>
    </div>

    {cropFile && (
      <AvatarCropModal
        file={cropFile}
        name={displayName || undefined}
        onConfirm={(blob) => {
          setCropFile(null);
          setPendingAvatarBlob(blob);
          if (pendingAvatarPreview) URL.revokeObjectURL(pendingAvatarPreview);
          setPendingAvatarPreview(URL.createObjectURL(blob));
        }}
        onCancel={() => setCropFile(null)}
      />
    )}

    <ClaimHandleModal
      open={showClaimModal}
      onClose={() => setShowClaimModal(false)}
      currentHandle={handle}
      onCheckAvailability={checkHandleAvailability}
      submitLabel="Claim handle"
      onClaim={async (h) => {
        const result = await claimHandle(h);
        if (result.success) {
          setShowClaimModal(false);
          setHandle(h);
        }
        return result;
      }}
    />

    <CommandPalette
      open={showPalette}
      onClose={() => setShowPalette(false)}
      variant="branding"
      brandingThemes={themeOptions}
      onSelectTheme={(themeId) => selectTheme(getBrandingThemeById(themeId))}
      onRandomTheme={randomTheme}
      searchPlaceholder="Search themes, fonts, colors…"
    />

    {mounted && showLeaveModal && createPortal(
      <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4">
        <div
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={() => setShowLeaveModal(false)}
        />
        <div className="relative bg-white dark:bg-surface-container rounded-3xl p-8 max-w-sm w-full shadow-2xl text-center space-y-5">
          <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mx-auto">
            <span className="material-symbols-outlined text-3xl text-amber-600 dark:text-amber-400">warning</span>
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-on-surface mb-2">Unsaved changes</h3>
            <p className="text-sm text-gray-500 dark:text-on-surface-variant leading-relaxed">
              You have unsaved changes. If you leave now your edits will be lost.
            </p>
          </div>
          <div className="space-y-3">
            <button
              onClick={() => setShowLeaveModal(false)}
              className="w-full bg-primary text-white py-3 px-4 rounded-xl font-semibold hover:bg-primary/90 transition-colors cursor-pointer"
            >
              Stay and save
            </button>
            <button
              onClick={handleLeaveAnyway}
              className="w-full border border-gray-300 dark:border-outline-variant text-gray-700 dark:text-on-surface py-3 px-4 rounded-xl font-semibold hover:bg-gray-50 dark:hover:bg-surface-container-high transition-colors cursor-pointer"
            >
              Leave anyway
            </button>
          </div>
        </div>
      </div>,
      document.body
    )}
    </>
  );
}

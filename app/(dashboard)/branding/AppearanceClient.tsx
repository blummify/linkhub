"use client";

import { useState, useMemo, useEffect, useRef, useCallback, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { DashboardPageTransition } from "../../components/DashboardPageTransition";
import { DirtyStateSaveBar } from "../../components/DirtyStateSaveBar";
import { DirtyStateSaveToolbar } from "../../components/DirtyStateSaveToolbar";
import { BrandingConfirmModal } from "./components/BrandingConfirmModal";
import { CommandPalette } from "../../components/CommandPalette";
import { ClaimHandleModal } from "../../components/ClaimHandleModal";
import { DashboardPreviewPanel } from "../../components/DashboardPreviewPanel";
import { DashboardTopBar } from "../user-admin/components/DashboardTopBar";
import { BRANDING_THEMES } from "../../constants/brandingThemes";
import { getBrandingThemeById, type BrandingAppearanceState } from "@/lib/brandingState";
import { BRANDING_FONT_SERIF } from "../../constants/brandingFonts";
import { ProfileSection } from "./components/ProfileSection";
import { ThemesSection } from "./components/ThemesSection";
import { QuickTuneSection } from "./components/QuickTuneSection";
import dynamic from "next/dynamic";
const AvatarCropModal = dynamic(
  () => import("./components/AvatarCropModal").then((m) => ({ default: m.AvatarCropModal })),
  { ssr: false }
);
import { useFileUpload } from "@/lib/hooks/useFileUpload";
import { updateAvatarUrl, removeAvatar, updateBranding, applyCustomTheme, deleteCustomTheme } from "@/app/actions/profile";
import { claimHandle, checkHandleAvailability } from "@/app/actions/links";
import { deleteOrphanedUpload } from "@/app/actions/upload";
import { useBrandingStore } from "@/store/brandingStore";
import { useProfileStore } from "@/store/profileStore";
import { useSidebarStore } from "@/store/sidebarStore";
import type { CustomTheme as CustomThemeRecord } from "@prisma/client";

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

export default function AppearanceClient({
  initialState,
  initialAvatarUrl,
  initialActiveCustomThemeId,
  initialCustomThemes = [],
}: {
  initialState?: Partial<BrandingAppearanceState> | null;
  initialAvatarUrl?: string | null;
  initialActiveCustomThemeId?: string | null;
  initialCustomThemes?: CustomThemeRecord[];
}) {
  const isCollapsed = useSidebarStore((s) => s.isCollapsed);

  const displayName = useBrandingStore((s) => s.displayName);
  const handle = useBrandingStore((s) => s.handle);
  const bio = useBrandingStore((s) => s.bio);
  const accentColor = useBrandingStore((s) => s.accentColor);
  const buttonStyle = useBrandingStore((s) => s.buttonStyle);
  const fontFamily = useBrandingStore((s) => s.fontFamily);
  const themeId = useBrandingStore((s) => s.themeId);
  // Compute dirty by comparing live state to the last-saved baseline — this way
  // reverting a change (e.g. typing "s" then deleting it) correctly clears the flag.
  const isDirty = useBrandingStore((s) => {
    const b = s._baseline;
    return (
      s.displayName !== b.displayName ||
      s.bio         !== b.bio         ||
      s.handle      !== b.handle      ||
      s.themeId     !== b.themeId     ||
      s.accentColor !== b.accentColor ||
      s.buttonStyle !== b.buttonStyle ||
      s.fontFamily  !== b.fontFamily
    );
  });
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

  // Avatar — seeded from server, kept in profileStore for other pages
  const avatarUrl = useProfileStore((s) => s.avatarUrl ?? initialAvatarUrl);
  const profileFetched = useProfileStore((s) => s.fetched);

  const router = useRouter();

  const [customThemes, setCustomThemes] = useState<CustomThemeRecord[]>(initialCustomThemes);
  const [activeCustomThemeId, setActiveCustomThemeId] = useState<string | null>(initialActiveCustomThemeId ?? null);
  const [applyingThemeId, setApplyingThemeId] = useState<string | null>(null);

  const [isSaving, setIsSaving] = useState(false);
  const [showPalette, setShowPalette] = useState(false);
  const mounted = useSyncExternalStore(() => () => {}, () => true, () => false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [pendingNavUrl, setPendingNavUrl] = useState<string | null>(null);
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Deferred avatar upload state
  const [cropFile, setCropFile] = useState<File | null>(null);
  const [pendingAvatarBlob, setPendingAvatarBlob] = useState<Blob | null>(null);
  const [pendingAvatarPreview, setPendingAvatarPreview] = useState<string | null>(null);

  useEffect(() => {
    document.documentElement.toggleAttribute("data-mobile-preview-open", previewOpen);
    return () => document.documentElement.removeAttribute("data-mobile-preview-open");
  }, [previewOpen]);

  // Track whether we've applied the server-provided initial state yet.
  // We wait for the Zustand store to finish its localStorage hydration (hydrated===true)
  // before overriding, so server data always wins over stale localStorage.
  const hydrated = useBrandingStore((s) => s.hydrated);
  const serverSyncedRef = useRef(false);

  useEffect(() => {
    if (!hydrated || serverSyncedRef.current) return;
    serverSyncedRef.current = true;

    // Seed the profileStore so other pages don't re-fetch
    if (!profileFetched) {
      useProfileStore.getState().markFetched({ avatarUrl: initialAvatarUrl ?? null });
    }

    // Override stale localStorage with fresh server data
    if (initialState && Object.keys(initialState).length > 0) {
      useBrandingStore.getState().syncFromDb(initialState);
    }
  }, [hydrated, profileFetched, initialState, initialAvatarUrl]);

  const isDirtyOrPending = isDirty || !!pendingAvatarBlob;

  useEffect(() => {
    document.documentElement.toggleAttribute("data-dirty-save-visible", isDirtyOrPending);
    return () => document.documentElement.removeAttribute("data-dirty-save-visible");
  }, [isDirtyOrPending]);

  // Guard 1 — browser refresh / tab close
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => { if (isDirtyOrPending) e.preventDefault(); };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirtyOrPending]);

  // Guard 2 — browser back / forward buttons
  // Push one extra history entry on mount so pressing back triggers popstate here.
  useEffect(() => { history.pushState(null, "", location.href); }, []);
  useEffect(() => {
    const handler = () => {
      if (!isDirtyOrPending) return;
      history.pushState(null, "", location.href); // keep URL stable
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

  const handleApplyCustomTheme = useCallback(async (id: string) => {
    setApplyingThemeId(id);
    try {
      const result = await applyCustomTheme(id);
      if ("error" in result) return;
      const t = result.theme;
      useBrandingStore.getState().syncFromDb({
        themeId:        t.themeId,
        accentColor:    t.accentColor,
        buttonStyle:    t.buttonStyle,
        fontFamily:     t.fontFamily,
        backgroundType: t.backgroundType as "gradient" | "image" | "video",
        backgroundValue: t.backgroundValue,
        backgroundKey:  t.backgroundKey,
        effects:        t.effects.split(",").filter(Boolean),
        textColor:      t.textColor,
        cardStyle:      t.cardStyle,
        bodyFont:       t.bodyFont,
        overlayColor:   t.overlayColor,
        overlayOpacity: t.overlayOpacity,
        profileLayout:  t.profileLayout,
        linkDensity:    t.linkDensity,
        customThemeName: t.name,
      });
      setActiveCustomThemeId(id);
    } finally {
      setApplyingThemeId(null);
    }
  }, []);

  const handleDeleteCustomTheme = useCallback(async (id: string) => {
    const result = await deleteCustomTheme(id);
    if ("error" in result) return;
    setCustomThemes((prev) => prev.filter((t) => t.id !== id));
    if (activeCustomThemeId === id) setActiveCustomThemeId(null);
  }, [activeCustomThemeId]);

  const handleEditCustomTheme = useCallback((theme: CustomThemeRecord) => {
    useBrandingStore.getState().syncFromDb({
      themeId:         theme.themeId,
      accentColor:     theme.accentColor,
      buttonStyle:     theme.buttonStyle,
      fontFamily:      theme.fontFamily,
      backgroundType:  theme.backgroundType as "gradient" | "image" | "video",
      backgroundValue: theme.backgroundValue,
      backgroundKey:   theme.backgroundKey,
      effects:         theme.effects.split(",").filter(Boolean),
      textColor:       theme.textColor,
      cardStyle:       theme.cardStyle,
      bodyFont:        theme.bodyFont,
      overlayColor:    theme.overlayColor,
      overlayOpacity:  theme.overlayOpacity,
      profileLayout:   theme.profileLayout,
      linkDensity:     theme.linkDensity,
      customThemeName: theme.name,
    });
    router.push("/branding/editor");
  }, [router]);

  const handleSave = useCallback(async () => {
    if (isSaving) return;
    setIsSaving(true);
    try {
      if (pendingAvatarBlob) {
        const file = new File([pendingAvatarBlob], "avatar.jpg", { type: "image/jpeg" });
        await upload(file);
        setPendingAvatarBlob(null);
        setPendingAvatarPreview(null);
      }
      const result = await updateBranding({ displayName, bio, themeId, accentColor, buttonStyle, fontFamily });
      if ("error" in result) {
        console.error("[handleSave] updateBranding error:", result.error);
        return;
      }
      markSaved();
    } finally {
      setIsSaving(false);
    }
  }, [isSaving, pendingAvatarBlob, upload, displayName, bio, themeId, accentColor, buttonStyle, fontFamily, markSaved]);

  const handleResetRequest = useCallback(() => {
    setShowResetConfirm(true);
  }, []);

  const handleResetConfirm = useCallback(() => {
    reset();
    setPendingAvatarBlob(null);
    setPendingAvatarPreview(null);
    setShowResetConfirm(false);
  }, [reset]);

  const handleLeaveAnyway = useCallback(() => {
    setShowLeaveModal(false);
    useBrandingStore.getState().reset();
    setPendingAvatarBlob(null);
    setPendingAvatarPreview(null);
    const target = pendingNavUrl;
    setPendingNavUrl(null);
    if (target) router.push(target);
    else router.back();
  }, [pendingNavUrl, router]);

  const themeOptions = useMemo(
    () => BRANDING_THEMES.map((t) => ({ id: t.id, name: t.name, tag: t.tag })),
    []
  );

  return (
    <>
      <main
          className={`flex-1 ml-0 overflow-y-auto bg-[#f7f8fc] h-screen ${
            isCollapsed ? "lg:ml-[80px]" : "lg:ml-[256px]"
          }`}
          style={{ transition: "margin-left var(--motion-base) var(--ease-standard)" }}
        >
          <div className="flex flex-col lg:flex-row min-h-screen">
            <div
              className="flex-1 min-w-0 px-4 pt-[22px] pb-24 lg:pb-14 sm:px-6 lg:px-8"
            >
              <DashboardPageTransition>
              <div className="mb-7 lg:sticky lg:top-0 lg:z-40 lg:-mx-8 lg:px-8 lg:-mt-[22px] lg:pt-[22px] lg:pb-3 lg:mb-7 lg:bg-[#f7f8fc]">
                <div className="max-lg:sticky max-lg:top-0 max-lg:z-40 max-lg:-mx-4 max-lg:px-4 max-lg:sm:-mx-6 max-lg:sm:px-6 max-lg:-mt-[22px] max-lg:pt-[22px] max-lg:pb-3 max-lg:mb-7 max-lg:bg-[#f7f8fc]">
                  <DashboardTopBar
                    sticky={false}
                    searchPlaceholder="Search themes, fonts, colors…"
                    onSearchClick={() => setShowPalette(true)}
                  />
                </div>

                <div
                  className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between lg:gap-6"
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

                  <DirtyStateSaveToolbar
                    dirty={isDirtyOrPending}
                    onReset={handleResetRequest}
                    onSave={handleSave}
                    saving={isSaving}
                  />
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
                    onSelect={(t) => {
                      selectTheme(t);
                      setActiveCustomThemeId(null);
                    }}
                    customThemes={customThemes}
                    activeCustomThemeId={activeCustomThemeId}
                    onApplyCustomTheme={handleApplyCustomTheme}
                    onDeleteCustomTheme={handleDeleteCustomTheme}
                    onEditCustomTheme={handleEditCustomTheme}
                    applyingThemeId={applyingThemeId}
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
              </DashboardPageTransition>
            </div>

            <div className={previewOpen ? "fixed inset-0 z-[90] overflow-y-auto bg-white p-0 lg:relative lg:inset-auto lg:z-auto lg:overflow-visible lg:bg-transparent lg:p-0 lg:block" : "hidden lg:block"}>
                <DashboardPreviewPanel width={previewOpen ? "100%" : 420} showThemeFooter onPickHandle={() => setShowClaimModal(true)} />
            </div>
          </div>
        </main>

    {!previewOpen && (
      <button
        type="button"
        onClick={() => setPreviewOpen(true)}
        className="fixed flex items-center gap-2 text-white text-sm font-semibold rounded-[24px] lg:hidden"
        style={{
          right: 16,
          bottom: isDirtyOrPending ? "max(78px, calc(72px + env(safe-area-inset-bottom, 0px)))" : "78px",
          zIndex: 85,
          background: "#3b46e0",
          padding: "11px 18px",
          boxShadow: "0 4px 20px rgba(59,70,224,0.4)",
          transition: "bottom var(--motion-base) var(--ease-out)",
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
          <circle cx="12" cy="12" r="3"/>
        </svg>
        Preview
      </button>
    )}

    {previewOpen && (
      <button
        type="button"
        onClick={() => setPreviewOpen(false)}
        className="fixed flex items-center gap-1.5 bg-white rounded-[22px] text-[13px] font-semibold lg:hidden"
        style={{ top: 12, right: 16, zIndex: 95, color: "#3a4474", padding: "8px 14px 8px 12px", boxShadow: "0 2px 8px rgba(0,0,0,0.12)" }}
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 6L6 18M6 6l12 12"/>
        </svg>
        Close
      </button>
    )}

    <DirtyStateSaveBar
      visible={isDirtyOrPending}
      onReset={handleResetRequest}
      onSave={handleSave}
      saving={isSaving}
      saveLabel="Save"
      className="fixed left-0 right-0 lg:hidden"
      style={{ bottom: 0, paddingBottom: "calc(10px + env(safe-area-inset-bottom, 0px))" }}
    />

    <BrandingConfirmModal
      open={showResetConfirm}
      onClose={() => setShowResetConfirm(false)}
      title="Discard changes?"
      body="This will restore your branding to the last saved version. Unsaved edits will be lost."
      confirmText="Discard changes"
      confirmStyle="danger"
      onConfirm={handleResetConfirm}
    />

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
      key={String(showClaimModal)}
      open={showClaimModal}
      onClose={() => setShowClaimModal(false)}
      currentHandle={handle}
      onCheckAvailability={checkHandleAvailability}
      submitLabel="Claim handle"
      onClaim={async (h) => {
        const result = await claimHandle(h);
        if (result.success) {
          setShowClaimModal(false);
          useBrandingStore.getState().syncFromDb({ handle: h });
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

"use client";

import { useState, useRef, useEffect } from "react";
import CollapsibleSidebar from "../components/CollapsibleSidebar";
import { DashboardPreviewPanel } from "../components/DashboardPreviewPanel";
import { ManageLinksSection } from "./components/ManageLinksSection";
import { AddEditLinkModal } from "./components/AddEditLinkModal";
import type { LinkRow } from "@/lib/linkRow";
import type { ManagedLink } from "./components/types";
import { getLinks, addLink, updateLink, deleteLink, getProfile, claimHandle, checkHandleAvailability, reorderLinks } from "../actions/links";
import { toast } from "sonner";
import { getBrandingThemeById, type BrandingAppearanceState } from "@/lib/brandingState";
import { ClaimHandleModal } from "../components/ClaimHandleModal";
import { DeleteConfirmDialog } from "../components/DeleteConfirmDialog";
import { CommandPalette } from "../components/CommandPalette";
import { LinkStatusValue } from "../constants/linkStatus";
import { useLinksStore } from "@/store/linksStore";
import { useBrandingStore } from "@/store/brandingStore";
import { useProfileStore } from "@/store/profileStore";
import { useUIStore } from "@/store/uiStore";
import { useSidebarStore } from "@/store/sidebarStore";

const dateFormatter = new Intl.DateTimeFormat("en-GH", {
  month: "short",
  day: "numeric",
});

export default function UserAdminClient() {
  const isCollapsed = useSidebarStore((s) => s.isCollapsed);

  const links = useLinksStore((s) => s.links);
  const isLoadingLinks = useLinksStore((s) => s.isLoading);

  const showLinkModal = useUIStore((s) => s.showLinkModal);
  const editingLink = useUIStore((s) => s.editingLink);
  const pendingDelete = useUIStore((s) => s.pendingDelete);
  const showPalette = useUIStore((s) => s.showPalette);
  const openAddLink = useUIStore((s) => s.openAddLink);
  const openEditLink = useUIStore((s) => s.openEditLink);
  const closeLinkModal = useUIStore((s) => s.closeLinkModal);
  const setPendingDelete = useUIStore((s) => s.setPendingDelete);
  const closePalette = useUIStore((s) => s.closePalette);

  const hydrated = useBrandingStore((s) => s.hydrated);
  const patchState = useBrandingStore((s) => s.patchState);

  const [isFirstTimeUser, setIsFirstTimeUser] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [claimOpen, setClaimOpen] = useState(false);
  const [profileReady, setProfileReady] = useState(() => useProfileStore.getState().fetched);
  const [profileDataReady, setProfileDataReady] = useState(false);
  const isSavingRef = useRef(false);
  const profileMergedRef = useRef(false);
  const pendingProfileRef = useRef<Awaited<ReturnType<typeof getProfile>>>(null);

  useEffect(() => {
    // If we already fetched during this session (e.g. navigated away and back),
    // skip the round-trip and render immediately from the store.
    // profileReady and isLoading are already correct from prior loadData() run.
    if (useProfileStore.getState().fetched) return;

    async function loadData() {
      try {
        const [dbLinks, dbProfile] = await Promise.all([getLinks(), getProfile()]);
        const fromDb = dbLinks.map((l: LinkRow) => ({
          id: l.id,
          title: l.title,
          url: l.url,
          clicks: String(l.clicks),
          status: l.status as LinkStatusValue,
          icon: l.icon || undefined,
          thumbnailUrl: l.thumbnailUrl || undefined,
          thumbnailKey: l.thumbnailKey || undefined,
          createdAt: dateFormatter.format(new Date(l.createdAt)),
        }));
        useLinksStore.getState().setLinks(fromDb);
        if (dbProfile) {
          pendingProfileRef.current = dbProfile;
          setProfileDataReady(true);
          useProfileStore.getState().markFetched({
            hasClaimedHandle: dbProfile.hasClaimedHandle,
          });
          if (!dbProfile.handle && !sessionStorage.getItem('handlePromptSnoozed')) {
            setIsFirstTimeUser(true);
          }
        }
      } catch (error) {
        console.error("Failed to load data:", error);
      } finally {
        useLinksStore.getState().setLoading(false);
        setProfileReady(true);
      }
    }
    loadData();
  }, []);

  useEffect(() => {
    const dbProfile = pendingProfileRef.current;
    if (!hydrated || profileMergedRef.current || !dbProfile) return;
    profileMergedRef.current = true;
    const patch: Partial<BrandingAppearanceState> = {};
    const name = dbProfile.displayName || dbProfile.user?.name || dbProfile.user?.email;
    if (name) patch.displayName = name;
    if (dbProfile.handle) patch.handle = dbProfile.handle;
    if (dbProfile.bio) patch.bio = dbProfile.bio;
    if (dbProfile.themeId && dbProfile.themeId !== "default") {
      const theme = getBrandingThemeById(dbProfile.themeId);
      patch.themeId = theme.id;
      patch.accentColor = (dbProfile.accentColor as string | null) ?? theme.screen.titleColor;
      patch.userPickedTheme = true;
    } else if (dbProfile.accentColor) {
      patch.accentColor = dbProfile.accentColor as string;
    }
    if (dbProfile.buttonStyle) patch.buttonStyle = dbProfile.buttonStyle as string;
    if (dbProfile.fontFamily)  patch.fontFamily  = dbProfile.fontFamily  as string;
    // Use syncFromDb so baseline is updated too — keeps isDirty false after load
    if (Object.keys(patch).length > 0) useBrandingStore.getState().syncFromDb(patch);
  }, [hydrated, profileDataReady, patchState]);

  // Auto-show the claim modal 1s after load for first-time users (no handle yet)
  useEffect(() => {
    if (!profileReady || !isFirstTimeUser) return;
    const timer = setTimeout(() => setClaimOpen(true), 1000);
    return () => clearTimeout(timer);
  }, [profileReady, isFirstTimeUser]);

  // Ref lets the keydown handler read claimOpen without re-binding.
  const claimOpenRef = useRef(claimOpen);
  useEffect(() => {
    claimOpenRef.current = claimOpen;
  }, [claimOpen]);

  // Press "N" to open the add-link modal.
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() !== "n") return;
      if (e.ctrlKey || e.metaKey || e.altKey || e.repeat || e.shiftKey) return;

      // Skip when typing in a field.
      const el = document.activeElement as HTMLElement | null;
      if (
        el &&
        (el.tagName === "INPUT" ||
          el.tagName === "TEXTAREA" ||
          el.tagName === "SELECT" ||
          el.isContentEditable)
      ) {
        return;
      }

      // Skip while an overlay is open.
      const { showLinkModal: linkOpen, showPalette: paletteOpen, pendingDelete: deletePending } =
        useUIStore.getState();
      if (linkOpen || paletteOpen || claimOpenRef.current || deletePending !== null) return;

      e.preventDefault();
      openAddLink();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [openAddLink]);

  const handleClaimHandle = async (handle: string) => {
    const result = await claimHandle(handle);
    if (result.success) {
      setClaimOpen(false);
      setIsFirstTimeUser(false);
      useBrandingStore.getState().syncFromDb({ handle });
    }
    return result;
  };

  const handleDismissClaim = () => {
    setClaimOpen(false);
    if (isFirstTimeUser) {
      sessionStorage.setItem('handlePromptSnoozed', '1');
      setIsFirstTimeUser(false);
    }
  };

  const handleSaveLink = async (newLink: ManagedLink) => {
    if (isSavingRef.current) return;
    isSavingRef.current = true;
    try {
      if (editingLink !== null && editingLink.link.id) {
        const previous = useLinksStore.getState().optimisticUpdate(
          editingLink.link.id,
          { ...newLink, id: editingLink.link.id },
        );
        try {
          await updateLink(editingLink.link.id, {
            title: newLink.title,
            url: newLink.url,
            icon: newLink.icon,
            status: newLink.status,
            thumbnailUrl: newLink.thumbnailUrl ?? null,
            thumbnailKey: newLink.thumbnailKey ?? null,
          });
        } catch {
          if (previous) useLinksStore.getState().revertUpdate(editingLink.link.id, previous);
        }
      } else {
        const tempId = `__temp_${Date.now()}`;
        const tempEntry: ManagedLink = {
          ...newLink,
          id: tempId,
          clicks: "0",
          createdAt: dateFormatter.format(new Date()),
        };
        useLinksStore.getState().optimisticAdd(tempEntry);
        try {
          const result = await addLink({
            title: newLink.title,
            url: newLink.url,
            icon: newLink.icon,
            status: newLink.status,
            thumbnailUrl: newLink.thumbnailUrl,
            thumbnailKey: newLink.thumbnailKey,
          });
          if (result.success && result.link) {
            useLinksStore.getState().confirmAdd(tempId, {
              ...newLink,
              id: result.link.id,
              clicks: String(result.link.clicks),
              createdAt: dateFormatter.format(new Date(result.link.createdAt)),
            });
          } else {
            useLinksStore.getState().revertAdd(tempId);
            toast.error(result.error ?? "Failed to add link. Please try again.");
          }
        } catch {
          useLinksStore.getState().revertAdd(tempId);
        }
      }
    } finally {
      isSavingRef.current = false;
    }
  };

  const handleDeleteLink = async (link: ManagedLink) => {
    if (!link.id) return;
    const snapshot = useLinksStore.getState().links;
    setPendingDelete(null);
    useLinksStore.getState().removeLink(link.id);
    try {
      const result = await deleteLink(link.id);
      if (result.error) {
        useLinksStore.getState().setLinks(snapshot);
        toast.error("Failed to delete link. Please try again.");
      }
    } catch (err) {
      console.error("Failed to delete link:", err);
      useLinksStore.getState().setLinks(snapshot);
      toast.error("Failed to delete link. Please try again.");
    }
  };

  const handleToggleLink = async (link: ManagedLink) => {
    if (!link.id) return;
    const newStatus = link.status !== 1 ? 1 : 2;
    const previous = useLinksStore.getState().optimisticUpdate(link.id, { status: newStatus });
    try {
      await updateLink(link.id, { status: newStatus });
    } catch (error) {
      console.error("Failed to toggle link:", error);
      if (previous) useLinksStore.getState().revertUpdate(link.id, previous);
    }
  };

  const handleUpdateLink = async (link: ManagedLink, _index: number, updates: Partial<ManagedLink>) => {
    if (!link.id) return;
    const previous = useLinksStore.getState().optimisticUpdate(link.id, updates);
    try {
      await updateLink(link.id, {
        title: updates.title,
        url: updates.url,
        icon: updates.icon,
        status: updates.status,
      });
    } catch (error) {
      console.error("Failed to update link:", error);
      if (previous) useLinksStore.getState().revertUpdate(link.id, previous);
    }
  };

  return (
    <>
      <div className="bg-[#f7f8fc] text-on-surface min-h-screen antialiased font-sans flex overflow-hidden">
        <CollapsibleSidebar isAdmin={true}>
          <div className="flex-1 flex flex-col min-h-screen relative">
            <main
              id="mainContent"
              className={`flex-1 transition-all duration-500 ease-in-out ${
                isCollapsed ? "lg:ml-[80px]" : "lg:ml-[256px]"
              } ml-0 overflow-y-auto bg-[#f7f8fc] h-screen`}
            >
              <div className="flex flex-col lg:flex-row min-h-screen">
                <div className="flex-1 min-w-0 px-4 pt-[22px] pb-24 lg:pb-10 sm:px-6 lg:px-8">
                  <ManageLinksSection
                    links={links}
                    isLoadingLinks={isLoadingLinks}
                    onAddLink={openAddLink}
                    onEditLink={openEditLink}
                    onRequestDelete={(link, index) => setPendingDelete({ link, index })}
                    onDeleteLink={handleDeleteLink}
                    onToggleLink={handleToggleLink}
                    onUpdateLink={handleUpdateLink}
                    onReorderLinks={(newLinks) => {
                      useLinksStore.getState().reorderLinks(newLinks);
                      const ids = newLinks.map((l) => l.id).filter((id): id is string => !!id);
                      void reorderLinks(ids);
                    }}
                  />
                </div>

                <div className={previewOpen ? "fixed inset-0 z-[90] overflow-y-auto lg:relative lg:inset-auto lg:z-auto lg:overflow-visible lg:block" : "hidden lg:block"}>
                  <DashboardPreviewPanel width={previewOpen ? "100%" : 420} onPickHandle={() => setClaimOpen(true)} />
                </div>
              </div>
            </main>
          </div>
        </CollapsibleSidebar>
      </div>

      {!previewOpen && (
        <button
          type="button"
          onClick={() => setPreviewOpen(true)}
          className="fixed flex items-center gap-2 text-white text-sm font-semibold rounded-[24px] lg:hidden"
          style={{ right: 16, bottom: 78, zIndex: 85, background: "#3b46e0", padding: "11px 18px", boxShadow: "0 4px 20px rgba(59,70,224,0.4)" }}
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

      <AddEditLinkModal
        key={`${editingLink?.link.id ?? "new"}-${showLinkModal}`}
        open={showLinkModal}
        onClose={closeLinkModal}
        onSave={handleSaveLink}
        initialLink={editingLink?.link}
      />

      <ClaimHandleModal
        key={String(claimOpen)}
        open={claimOpen}
        onClose={handleDismissClaim}
        onClaim={handleClaimHandle}
        onCheckAvailability={checkHandleAvailability}
      />

      <DeleteConfirmDialog
        open={pendingDelete !== null}
        link={pendingDelete?.link}
        onClose={() => setPendingDelete(null)}
        onConfirm={() => {
          if (pendingDelete) handleDeleteLink(pendingDelete.link);
        }}
      />

      <CommandPalette
        open={showPalette}
        onClose={closePalette}
        links={links}
        onAddLink={openAddLink}
      />
    </>
  );
}

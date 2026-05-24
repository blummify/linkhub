"use client";

import { useState, useRef, useEffect } from "react";
import CollapsibleSidebar from "../components/CollapsibleSidebar";
import { DashboardPreviewPanel } from "../components/DashboardPreviewPanel";
import { ManageLinksSection } from "./components/ManageLinksSection";
import { AddEditLinkModal } from "./components/AddEditLinkModal";
import type { LinkRow } from "@/lib/linkRow";
import type { ManagedLink } from "./components/types";
import { getLinks, addLink, updateLink, deleteLink, getProfile, claimHandle, dismissHandleClaim, checkHandleAvailability } from "../actions/links";
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
  const [claimOpen, setClaimOpen] = useState(false);
  const [profileReady, setProfileReady] = useState(() => useProfileStore.getState().fetched);
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
          useProfileStore.getState().markFetched({
            hasClaimedHandle: dbProfile.hasClaimedHandle,
          });
          if (!dbProfile.hasClaimedHandle) {
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
    const name = dbProfile.user?.name || dbProfile.user?.email;
    if (name) patch.displayName = name;
    if (dbProfile.handle) patch.handle = dbProfile.handle;
    if (dbProfile.bio) patch.bio = dbProfile.bio;
    if (dbProfile.themeId && dbProfile.themeId !== "default") {
      const theme = getBrandingThemeById(dbProfile.themeId);
      patch.themeId = theme.id;
      patch.accentColor = theme.screen.titleColor;
      patch.userPickedTheme = true;
    }
    if (Object.keys(patch).length > 0) patchState(patch);
  }, [hydrated, patchState]);

  // Auto-show the claim modal 1s after load for first-time users (no handle yet)
  useEffect(() => {
    if (!profileReady || !isFirstTimeUser) return;
    const timer = setTimeout(() => setClaimOpen(true), 1000);
    return () => clearTimeout(timer);
  }, [profileReady, isFirstTimeUser]);

  const handleClaimHandle = async (handle: string) => {
    const result = await claimHandle(handle);
    if (result.success) {
      setClaimOpen(false);
      setIsFirstTimeUser(false);
      useBrandingStore.getState().setHandle(handle);
    }
    return result;
  };

  const handleDismissClaim = async () => {
    setClaimOpen(false);
    if (isFirstTimeUser) {
      await dismissHandleClaim();
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
    try {
      await deleteLink(link.id);
      useLinksStore.getState().removeLink(link.id);
    } catch (error) {
      console.error("Failed to delete link:", error);
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
                <div className="flex-1 min-w-0 px-4 pt-[22px] pb-10 sm:px-6 lg:px-8">
                  <ManageLinksSection
                    links={links}
                    isLoadingLinks={isLoadingLinks}
                    onAddLink={openAddLink}
                    onEditLink={openEditLink}
                    onRequestDelete={(link, index) => setPendingDelete({ link, index })}
                    onDeleteLink={handleDeleteLink}
                    onToggleLink={handleToggleLink}
                    onUpdateLink={handleUpdateLink}
                    onReorderLinks={useLinksStore.getState().reorderLinks}
                  />
                </div>

                <div className="hidden lg:block">
                  <DashboardPreviewPanel onPickHandle={() => setClaimOpen(true)} />
                </div>
              </div>
            </main>
          </div>
        </CollapsibleSidebar>
      </div>

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
          setPendingDelete(null);
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

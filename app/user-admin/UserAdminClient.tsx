"use client";

import { useState, useRef } from "react";
import CollapsibleSidebar from "../components/CollapsibleSidebar";
import { useSidebar } from "../components/SidebarContext";
import { DashboardPreviewPanel } from "../components/DashboardPreviewPanel";
import { useBrandingAppearance } from "../components/BrandingAppearanceContext";
import { ManageLinksSection } from "./components/ManageLinksSection";
import { AddEditLinkModal } from "./components/AddEditLinkModal";
import type { LinkRow } from "@/lib/linkRow";
import type { ManagedLink } from "./components/types";
import { getLinks, addLink, updateLink, deleteLink, getProfile, claimHandle, dismissHandleClaim } from "../actions/links";
import { getBrandingThemeById } from "@/lib/brandingState";
import { ClaimHandleModal } from "../components/ClaimHandleModal";
import { DeleteConfirmDialog } from "../components/DeleteConfirmDialog";
import { CommandPalette } from "../components/CommandPalette";
import { useEffect } from "react";
import { DEMO_MANAGED_LINKS, isDemoManagedLink } from "@/lib/demoManagedLinks";

export default function UserAdminClient() {
  const { isCollapsed } = useSidebar();
  const [isFirstTimeUser, setIsFirstTimeUser] = useState(false);
  const [claimTimerFired, setClaimTimerFired] = useState(false);
  const [links, setLinks] = useState<ManagedLink[]>([]);
  
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [editingLink, setEditingLink] = useState<{ link: ManagedLink; index: number } | null>(null);
  const [pendingDelete, setPendingDelete] = useState<{ link: ManagedLink; index: number } | null>(null);
  const [showPalette, setShowPalette] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const profileMergedRef = useRef(false);
  const pendingProfileRef = useRef<Awaited<ReturnType<typeof getProfile>>>(null);

  const {
    state: branding,
    previewAppearance,
    publicUrl,
    patchState,
    randomTheme,
    hydrated,
  } = useBrandingAppearance();

  useEffect(() => {
    async function loadData() {
      try {
        const [dbLinks, dbProfile] = await Promise.all([getLinks(), getProfile()]);

        const fromDb = dbLinks.map((l: LinkRow) => ({
          id: l.id,
          title: l.title,
          url: l.url,
          clicks: String(l.clicks),
          draft: l.draft,
          icon: l.icon || undefined,
        }));
        setLinks([...DEMO_MANAGED_LINKS, ...fromDb]);
        if (dbProfile) {
          pendingProfileRef.current = dbProfile;
          if (!dbProfile.hasClaimedHandle) {
            setIsFirstTimeUser(true);
          }
        }
      } catch (error) {
        console.error("Failed to load data:", error);
        setLinks([...DEMO_MANAGED_LINKS]);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  useEffect(() => {
    const dbProfile = pendingProfileRef.current;
    if (!hydrated || profileMergedRef.current || !dbProfile) return;
    profileMergedRef.current = true;
    const patch: Partial<typeof branding> = {};
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

  useEffect(() => {
    const timer = setTimeout(() => setClaimTimerFired(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  const showClaimModal = claimTimerFired && !isLoading && isFirstTimeUser;

  const handleClaimHandle = async (handle: string) => {
    const result = await claimHandle(handle);
    if (result.success) {
      setIsFirstTimeUser(false);
    }
    return result;
  };

  const handleDismissClaim = async () => {
    await dismissHandleClaim();
    setIsFirstTimeUser(false);
  };

  const handleAddLink = () => {
    setEditingLink(null);
    setShowLinkModal(true);
  };

  const handleEditLink = (link: ManagedLink, index: number) => {
    setEditingLink({ link, index });
    setShowLinkModal(true);
  };

  const handleSaveLink = async (newLink: ManagedLink) => {
    setIsLoading(true);
    try {
      if (editingLink !== null && isDemoManagedLink(editingLink.link) && editingLink.link.id) {
        const updatedLinks = [...links];
        updatedLinks[editingLink.index] = {
          ...editingLink.link,
          ...newLink,
          id: editingLink.link.id,
          clicks: newLink.clicks || editingLink.link.clicks,
          trendLabel: editingLink.link.trendLabel,
        };
        setLinks(updatedLinks);
        setShowLinkModal(false);
        return;
      }
      if (editingLink !== null && editingLink.link.id) {
        await updateLink(editingLink.link.id, {
          title: newLink.title,
          url: newLink.url,
          icon: newLink.icon,
        });
        const updatedLinks = [...links];
        updatedLinks[editingLink.index] = { ...newLink, id: editingLink.link.id };
        setLinks(updatedLinks);
      } else {
        const result = await addLink({
          title: newLink.title,
          url: newLink.url,
          icon: newLink.icon,
        });
        if (result.success && result.link) {
          const entry: ManagedLink = {
            ...newLink,
            id: result.link.id,
            clicks: String(result.link.clicks),
          };
          const demos = links.filter(isDemoManagedLink);
          const real = links.filter((l) => !isDemoManagedLink(l));
          setLinks([...demos, entry, ...real]);
        }
      }
      setShowLinkModal(false);
    } catch (error) {
      console.error("Failed to save link:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteLink = async (link: ManagedLink, index: number) => {
    if (isDemoManagedLink(link)) {
      setLinks(links.filter((_, i) => i !== index));
      return;
    }
    if (!link.id) return;
    try {
      await deleteLink(link.id);
      setLinks(links.filter((_, i) => i !== index));
    } catch (error) {
      console.error("Failed to delete link:", error);
    }
  };

  const handleToggleLink = async (link: ManagedLink, index: number) => {
    const currentStatus = link.status ?? (link.draft ? "unpublished" : "published");
    const willBePublished = currentStatus !== "published";
    const newStatus = willBePublished ? "published" : "unpublished";

    if (isDemoManagedLink(link)) {
      const updatedLinks = [...links];
      updatedLinks[index] = { ...link, draft: !willBePublished, status: newStatus };
      setLinks(updatedLinks);
      return;
    }
    if (!link.id) return;
    try {
      await updateLink(link.id, { draft: !willBePublished });
      const updatedLinks = [...links];
      updatedLinks[index] = { ...link, draft: !willBePublished, status: newStatus };
      setLinks(updatedLinks);
    } catch (error) {
      console.error("Failed to toggle link:", error);
    }
  };

  const handleUpdateLink = async (link: ManagedLink, index: number, updates: Partial<ManagedLink>) => {
    if (isDemoManagedLink(link)) {
      const updatedLinks = [...links];
      updatedLinks[index] = { ...link, ...updates };
      setLinks(updatedLinks);
      return;
    }
    if (!link.id) return;
    try {
      await updateLink(link.id, {
        title: updates.title,
        url: updates.url,
        icon: updates.icon,
        draft: updates.draft,
      });
      const updatedLinks = [...links];
      updatedLinks[index] = { ...link, ...updates };
      setLinks(updatedLinks);
    } catch (error) {
      console.error("Failed to update link:", error);
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
                {/* Center section */}
                <div
                  className="flex-1 animate-fade-in-up min-w-0 px-4 pt-[22px] pb-10 sm:px-6 lg:px-8"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center h-64">
                      <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                    </div>
                  ) : (
                    <ManageLinksSection
                      links={links}
                      onAddLink={handleAddLink}
                      onEditLink={handleEditLink}
                      onRequestDelete={(link, index) => setPendingDelete({ link, index })}
                      onDeleteLink={handleDeleteLink}
                      onToggleLink={handleToggleLink}
                      onUpdateLink={handleUpdateLink}
                      onReorderLinks={setLinks}
                      onSearchOpen={() => setShowPalette(true)}
                    />
                  )}
                </div>

                {/* Preview panel */}
                <div className="hidden lg:block">
                  <DashboardPreviewPanel
                    links={links}
                    displayName={branding.displayName || "Your Name"}
                    handle={branding.handle}
                    bio={branding.bio}
                    publicUrl={publicUrl}
                    appearance={previewAppearance}
                    onRandomTheme={randomTheme}
                  />
                </div>
              </div>
            </main>
          </div>
        </CollapsibleSidebar>
      </div>

      {/* Modals rendered at root level — never inside a transformed ancestor */}
      <AddEditLinkModal
        key={`${editingLink?.link.id ?? "new"}-${showLinkModal}`}
        open={showLinkModal}
        onClose={() => setShowLinkModal(false)}
        onSave={handleSaveLink}
        initialLink={editingLink?.link}
      />

      <ClaimHandleModal
        open={showClaimModal}
        onClose={handleDismissClaim}
        onClaim={handleClaimHandle}
      />

      <DeleteConfirmDialog
        open={pendingDelete !== null}
        link={pendingDelete?.link}
        onClose={() => setPendingDelete(null)}
        onConfirm={() => {
          if (pendingDelete) handleDeleteLink(pendingDelete.link, pendingDelete.index);
          setPendingDelete(null);
        }}
      />

      <CommandPalette
        open={showPalette}
        onClose={() => setShowPalette(false)}
        links={links}
        onAddLink={handleAddLink}
      />
    </>
  );
}
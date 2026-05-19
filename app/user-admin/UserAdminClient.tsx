"use client";

import { useState } from "react";
import CollapsibleSidebar from "../components/CollapsibleSidebar";
import { useSidebar } from "../components/SidebarContext";
import { type AppearanceState } from "../components/MobilePreview";
import { ShareProfileModal } from "../components/ShareProfileModal";
import { DashboardPreviewPanel } from "../components/DashboardPreviewPanel";
import { ManageLinksSection } from "./components/ManageLinksSection";
import { AddEditLinkModal } from "./components/AddEditLinkModal";
import type { LinkRow } from "@/lib/linkRow";
import type { ManagedLink } from "./components/types";
import { PROFILE_PUBLIC_URL } from "../constants/profile";

import { getLinks, addLink, updateLink, deleteLink, getProfile, claimHandle, dismissHandleClaim } from "../actions/links";
import { ClaimHandleModal } from "../components/ClaimHandleModal";
import { useEffect } from "react";
import { DEMO_MANAGED_LINKS, isDemoManagedLink } from "@/lib/demoManagedLinks";

export default function UserAdminClient() {
  const { isCollapsed } = useSidebar();
  const [showShareModal, setShowShareModal] = useState(false);
  const [isFirstTimeUser, setIsFirstTimeUser] = useState(false);
  const [claimTimerFired, setClaimTimerFired] = useState(false);
  const [links, setLinks] = useState<ManagedLink[]>([]);
  
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [editingLink, setEditingLink] = useState<{ link: ManagedLink; index: number } | null>(null);

  const [isLoading, setIsLoading] = useState(true);

  const [appearance, setAppearance] = useState<AppearanceState>({
    profileTitle: "",
    profileBio: "Connecting with your community.",
    profileLayout: "classic",
    themeId: "custom",
    wallpaperStyle: "fill",
    bgColor: "#ffffff",
    textColor: "#1a1a1a",
    buttonStyle: "solid",
    buttonShadow: "none",
    buttonRoundness: "full",
    fontFamily: "Inter",
    bodyFontFamily: "Inter",
    titleSize: "small",
    titleColor: "#000000",
    footerStyle: "minimal",
  });

  useEffect(() => {
    async function loadData() {
      try {
        const [dbLinks, dbProfile] = await Promise.all([getLinks(), getProfile()]);
        
        console.log("Profile data:", dbProfile); // ← debugging line

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
          setAppearance(prev => ({
            ...prev,
            profileTitle: dbProfile.user?.name || dbProfile.user?.email || "My Profile",
            profileBio: dbProfile.bio || prev.profileBio,
            profileLayout: dbProfile.layout || prev.profileLayout,
            themeId: dbProfile.themeId || prev.themeId,
          }));
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
                className="flex-1 animate-fade-in-up"
                style={{ padding: "22px 32px 40px", minWidth: 0 }}
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
                    onDeleteLink={handleDeleteLink}
                    onToggleLink={handleToggleLink}
                    onUpdateLink={handleUpdateLink}
                    onReorderLinks={setLinks}
                  />
                )}
              </div>

              {/* Preview panel */}
              <div className="hidden lg:block">
                <DashboardPreviewPanel
                  links={links}
                  displayName={appearance.profileTitle || "Your Name"}
                  handle={PROFILE_PUBLIC_URL.split("/").pop() ?? ""}
                  publicUrl={PROFILE_PUBLIC_URL}
                  onShareClick={() => setShowShareModal(true)}
                />
              </div>
            </div>
          </main>

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

          <ShareProfileModal
            open={showShareModal}
            onClose={() => setShowShareModal(false)}
            profileUrl={PROFILE_PUBLIC_URL}
          />
        </div>
      </CollapsibleSidebar>
    </div>
  );
}
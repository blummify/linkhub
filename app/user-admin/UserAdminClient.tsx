"use client";

import { useState } from "react";
import CollapsibleSidebar from "../components/CollapsibleSidebar";
import AppHeader from "../components/AppHeader";
import { useSidebar } from "../components/SidebarContext";
import { MobilePreview, type AppearanceState } from "../components/MobilePreview";
import { ShareProfileModal } from "../components/ShareProfileModal";
import { LinksStyleTwoColumnLayout } from "../components/LinksStyleTwoColumnLayout";
import { LinksPreviewPanel } from "../components/LinksPreviewPanel";
import { ManageLinksSection } from "./components/ManageLinksSection";
import { AddEditLinkModal } from "./components/AddEditLinkModal";
import type { LinkRow } from "@/lib/linkRow";
import type { ManagedLink } from "./components/types";
import { EDITOR_MOBILE_PREVIEW_SHARED } from "../constants/editorMobilePreview";
import { PROFILE_PUBLIC_URL } from "../constants/profile";

import { getLinks, addLink, updateLink, deleteLink, getProfile } from "../actions/links";
import { useEffect } from "react";

const DEMO_LINKS: ManagedLink[] = [];

export default function UserAdminClient() {
  const { isCollapsed } = useSidebar();
  const [showShareModal, setShowShareModal] = useState(false);
  const [links, setLinks] = useState<ManagedLink[]>(DEMO_LINKS);
  
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [editingLink, setEditingLink] = useState<{ link: ManagedLink; index: number } | null>(null);

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [dbLinks, dbProfile] = await Promise.all([getLinks(), getProfile()]);
        setLinks(dbLinks.map((l: LinkRow) => ({
          id: l.id,
          title: l.title,
          url: l.url,
          clicks: String(l.clicks),
          draft: l.draft,
          icon: l.icon || undefined
        })));
        if (dbProfile) {
          setAppearance(prev => ({
            ...prev,
            profileTitle: `@${dbProfile.userId}`, // Basic implementation
            profileBio: dbProfile.bio || prev.profileBio,
            profileLayout: dbProfile.layout || prev.profileLayout,
            themeId: dbProfile.themeId || prev.themeId,
          }));
        }
      } catch (error) {
        console.error("Failed to load data:", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

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
          setLinks([{
            ...newLink,
            id: result.link.id,
            clicks: String(result.link.clicks)
          }, ...links]);
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
    if (!link.id) return;
    try {
      await deleteLink(link.id);
      setLinks(links.filter((_, i) => i !== index));
    } catch (error) {
      console.error("Failed to delete link:", error);
    }
  };

  const handleToggleLink = async (link: ManagedLink, index: number) => {
    if (!link.id) return;
    try {
      const newDraftState = !link.draft;
      await updateLink(link.id, { draft: newDraftState });
      const updatedLinks = [...links];
      updatedLinks[index] = { ...link, draft: newDraftState };
      setLinks(updatedLinks);
    } catch (error) {
      console.error("Failed to toggle link:", error);
    }
  };

  const handleUpdateLink = async (link: ManagedLink, index: number, updates: Partial<ManagedLink>) => {
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

  const [appearance, setAppearance] = useState<AppearanceState>({
    profileTitle: "@oseijoel6111",
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

  return (
    <div className="bg-surface text-on-surface min-h-screen antialiased font-sans flex overflow-hidden">
      <CollapsibleSidebar isAdmin={true}>
        <div className="flex-1 flex flex-col min-h-screen relative">
          <AppHeader isAdmin={true} />

          <main
            id="mainContent"
            className={`flex-1 pt-16 transition-all duration-500 ease-in-out ${
              isCollapsed ? "lg:ml-[80px]" : "lg:ml-[256px]"
            } ml-0 overflow-y-auto bg-surface`}
          >
            <div className="min-h-[calc(100vh-4rem)] flex flex-col lg:flex-row">
              <div className="flex-1 px-4 py-8 sm:px-8 lg:px-12 lg:py-12">
                <div className="max-w-2xl mx-auto lg:mx-0 animate-fade-in-up">
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
                    />
                  )}
                </div>
              </div>

              {/* Right Column - Preview Panel */}
              <div className="w-full lg:w-[460px] xl:w-[540px] bg-surface-container-low/50 border-t lg:border-t-0 lg:border-l border-outline-variant/30 relative py-12 lg:py-8 px-4 sm:px-6 flex flex-col items-center">
                <div className="sticky top-24 lg:top-8 w-full flex flex-col items-center animate-fade-in-up delay-100">
                  <LinksPreviewPanel>
                    <MobilePreview
                      {...EDITOR_MOBILE_PREVIEW_SHARED}
                      appearance={appearance}
                      linkRows={links
                        .filter(l => !l.draft)
                        .map(l => ({ kind: 'button', title: l.title, url: l.url, icon: l.icon, accent: true }))
                      }
                      linkDensity="relaxed"
                      headerTitle=""
                      headerSubtitle=""
                      showHeaderTuneButton={false}
                      syncLabel={null}
                      showDeviceFooter={false}
                      onShareBarClick={() => setShowShareModal(true)}
                    />
                  </LinksPreviewPanel>
                </div>
              </div>
            </div>
          </main>

          <AddEditLinkModal
            open={showLinkModal}
            onClose={() => setShowLinkModal(false)}
            onSave={handleSaveLink}
            initialLink={editingLink?.link}
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

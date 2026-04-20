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
import type { ManagedLink } from "./components/types";
import { EDITOR_MOBILE_PREVIEW_SHARED } from "../constants/editorMobilePreview";
import { PROFILE_PUBLIC_URL } from "../constants/profile";

const DEMO_LINKS: ManagedLink[] = [
  { title: "Official Website", url: "https://johndoe.design", clicks: "1.2K" },
  { title: "Latest Portfolio Drop", url: "https://behance.net/johndoe", clicks: "856" },
  { title: "Instagram Profile", url: "https://instagram.com/johndoe", clicks: "0", draft: true },
];

export default function UserAdminClient() {
  const { isCollapsed } = useSidebar();
  const [showShareModal, setShowShareModal] = useState(false);
  const [links, setLinks] = useState<ManagedLink[]>(DEMO_LINKS);
  
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [editingLink, setEditingLink] = useState<{ link: ManagedLink; index: number } | null>(null);

  const handleAddLink = () => {
    setEditingLink(null);
    setShowLinkModal(true);
  };

  const handleSaveLink = (newLink: ManagedLink) => {
    if (editingLink !== null) {
      const updatedLinks = [...links];
      updatedLinks[editingLink.index] = newLink;
      setLinks(updatedLinks);
    } else {
      setLinks([newLink, ...links]);
    }
  };

  const handleDeleteLink = (link: ManagedLink, index: number) => {
    setLinks(links.filter((_, i) => i !== index));
  };

  const handleEditLink = (link: ManagedLink, index: number) => {
    setEditingLink({ link, index });
    setShowLinkModal(true);
  };

  const handleToggleLink = (link: ManagedLink, index: number) => {
    const updatedLinks = [...links];
    updatedLinks[index] = { ...link, draft: !link.draft };
    setLinks(updatedLinks);
  };

  const handleUpdateLink = (link: ManagedLink, index: number, updates: Partial<ManagedLink>) => {
    const updatedLinks = [...links];
    updatedLinks[index] = { ...link, ...updates };
    setLinks(updatedLinks);
  };

  const [appearance] = useState<AppearanceState>({
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
              {/* Left Column - Main Content */}
              <div className="flex-1 px-4 py-8 sm:px-8 lg:px-12 lg:py-12">
                <div className="max-w-2xl mx-auto lg:mx-0 animate-fade-in-up">
                  <ManageLinksSection 
                    links={links} 
                    onAddLink={handleAddLink}
                    onEditLink={handleEditLink}
                    onDeleteLink={handleDeleteLink}
                    onToggleLink={handleToggleLink}
                    onUpdateLink={handleUpdateLink}
                  />
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
                        .map(l => ({ kind: 'button', title: l.title, accent: true }))
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

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
import type { ManagedLink } from "./components/types";
import { EDITOR_MOBILE_PREVIEW_SHARED, EDITOR_PREVIEW_COLUMN_CLASS } from "../constants/editorMobilePreview";
import { PROFILE_PUBLIC_URL } from "../constants/profile";

const DEMO_LINKS: ManagedLink[] = [
  { title: "Official Website", url: "https://johndoe.design", clicks: "1.2K" },
  { title: "Latest Portfolio Drop", url: "https://behance.net/johndoe", clicks: "856" },
  { title: "Instagram Profile", url: "https://instagram.com/johndoe", clicks: "0", draft: true },
];

export default function UserAdminClient() {
  const { isCollapsed } = useSidebar();
  const [showShareModal, setShowShareModal] = useState(false);

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
    <div className="bg-background text-on-surface min-h-screen antialiased font-sans">
      <CollapsibleSidebar isAdmin={true}>
        <AppHeader isAdmin={true} />

        <main
          id="mainContent"
          className={`min-h-screen bg-surface-container-low transition-all duration-500 ease-in-out ${
            isCollapsed ? "ml-0" : "ml-0 lg:ml-64"
          }`}
        >
          <LinksStyleTwoColumnLayout
            className="!p-0 !gap-0"
            previewColumnClassName={EDITOR_PREVIEW_COLUMN_CLASS}
            left={<ManageLinksSection links={DEMO_LINKS} />}
            preview={
              <LinksPreviewPanel>
                <MobilePreview
                  {...EDITOR_MOBILE_PREVIEW_SHARED}
                  appearance={appearance}
                  linkDensity="relaxed"
                  onShareBarClick={() => setShowShareModal(true)}
                />
              </LinksPreviewPanel>
            }
          />
        </main>

        <ShareProfileModal
          open={showShareModal}
          onClose={() => setShowShareModal(false)}
          profileUrl={PROFILE_PUBLIC_URL}
        />
      </CollapsibleSidebar>
    </div>
  );
}

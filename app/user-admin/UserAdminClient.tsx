"use client";

import { useState } from "react";
import CollapsibleSidebar from "../components/CollapsibleSidebar";
import AppHeader from "../components/AppHeader";
import { ThemeToggle } from "../ThemeToggle";
import { useSidebar } from "../components/SidebarContext";
import { MobilePreview, type AppearanceState } from "../components/MobilePreview";
import { ShareProfileModal } from "./components/ShareProfileModal";
import { ManageLinksSection } from "./components/ManageLinksSection";
import { UserAdminTwoColumnLayout } from "./components/UserAdminTwoColumnLayout";
import type { ManagedLink } from "./components/types";

const PROFILE_PUBLIC_URL = "linktr.ee/blummify";

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
          className={`pt-16 min-h-screen transition-all duration-500 ease-in-out ${
            isCollapsed ? "ml-0" : "ml-64"
          }`}
        >
          <UserAdminTwoColumnLayout
            className={isCollapsed ? "px-12 md:px-20" : ""}
            left={<ManageLinksSection links={DEMO_LINKS} />}
            preview={
              <MobilePreview
                appearance={appearance}
                publicUrl={PROFILE_PUBLIC_URL}
                onShareBarClick={() => setShowShareModal(true)}
              />
            }
          />
        </main>

        <div className="fixed bottom-8 right-8 z-50">
          <ThemeToggle />
        </div>

        <ShareProfileModal
          open={showShareModal}
          onClose={() => setShowShareModal(false)}
          profileUrl={PROFILE_PUBLIC_URL}
        />
      </CollapsibleSidebar>
    </div>
  );
}

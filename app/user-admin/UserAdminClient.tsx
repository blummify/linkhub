"use client";

import { useState } from "react";
import CollapsibleSidebar from "../components/CollapsibleSidebar";
import { useSidebar } from "../components/SidebarContext";
import { MobilePreview, type AppearanceState } from "../components/MobilePreview";
import { ShareProfileModal } from "../components/ShareProfileModal";
import { PhoneFrame } from "../components/PhoneFrame";
import { ManageLinksSection } from "./components/ManageLinksSection";
import { AddEditLinkModal } from "./components/AddEditLinkModal";
import type { LinkRow } from "@/lib/linkRow";
import type { ManagedLink } from "./components/types";
import { EDITOR_MOBILE_PREVIEW_SHARED } from "../constants/editorMobilePreview";
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
    if (isDemoManagedLink(link)) {
      const newDraftState = !link.draft;
      const updatedLinks = [...links];
      updatedLinks[index] = { ...link, draft: newDraftState };
      setLinks(updatedLinks);
      return;
    }
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
    <div className="bg-surface text-on-surface min-h-screen antialiased font-sans flex overflow-hidden">
      <CollapsibleSidebar isAdmin={true}>
        <div className="flex-1 flex flex-col min-h-screen relative">
          <main
            id="mainContent"
            className={`flex-1 transition-all duration-500 ease-in-out ${
              isCollapsed ? "lg:ml-[80px]" : "lg:ml-[256px]"
            } ml-0 overflow-y-auto bg-surface h-screen`}
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
              <div
                className="hidden lg:flex shrink-0 flex-col items-center relative border-l"
                style={{
                  width: 420,
                  background: "linear-gradient(180deg, #f0f2fb 0%, #e9ecf8 100%)",
                  borderColor: "#eef0f7",
                  padding: "28px 24px",
                  position: "sticky",
                  top: 0,
                  height: "100vh",
                  overflow: "hidden",
                }}
              >
                {/* Radial glow overlays */}
                <div
                  className="pointer-events-none absolute inset-0"
                  aria-hidden
                  style={{
                    backgroundImage:
                      "radial-gradient(circle at 20% 10%, rgba(104,115,255,0.12), transparent 50%), radial-gradient(circle at 80% 80%, rgba(59,70,224,0.10), transparent 50%)",
                  }}
                />

                {/* Preview header */}
                <div className="relative z-10 flex items-start justify-between w-full shrink-0" style={{ marginBottom: 18 }}>
                  <div>
                    <div style={{
                      fontFamily: "Georgia, 'Times New Roman', serif",
                      fontStyle: "italic",
                      fontWeight: 400,
                      fontSize: 22,
                      letterSpacing: "-0.01em",
                      color: "#0b1020",
                    }}>
                      Live preview
                    </div>
                    <div style={{ fontSize: 12, color: "#6b75a3", marginTop: 2 }}>
                      {PROFILE_PUBLIC_URL.split("/")[0]}/<span style={{ color: "#3b46e0", fontWeight: 500 }}>{PROFILE_PUBLIC_URL.split("/")[1]}</span>
                    </div>
                  </div>
                  <div className="flex items-center" style={{ gap: 6 }}>
                    <button
                      type="button"
                      title="Share"
                      onClick={() => setShowShareModal(true)}
                      className="flex items-center justify-center transition-all cursor-pointer"
                      style={{ width: 32, height: 32, borderRadius: 8, border: 0, background: "white", color: "#6b75a3", boxShadow: "0 1px 2px rgba(15,23,42,0.04), 0 1px 1px rgba(15,23,42,0.03)" }}
                      onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "#eef0f7"; (e.currentTarget as HTMLButtonElement).style.color = "#0b1020"; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "white"; (e.currentTarget as HTMLButtonElement).style.color = "#6b75a3"; }}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13"/>
                      </svg>
                    </button>
                    <a
                      href={`https://${PROFILE_PUBLIC_URL}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Open in new tab"
                      className="flex items-center justify-center transition-all cursor-pointer"
                      style={{ width: 32, height: 32, borderRadius: 8, background: "white", color: "#6b75a3", boxShadow: "0 1px 2px rgba(15,23,42,0.04), 0 1px 1px rgba(15,23,42,0.03)", textDecoration: "none" }}
                      onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = "#eef0f7"; (e.currentTarget as HTMLAnchorElement).style.color = "#0b1020"; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = "white"; (e.currentTarget as HTMLAnchorElement).style.color = "#6b75a3"; }}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3"/>
                      </svg>
                    </a>
                  </div>
                </div>

                {/* Device tabs */}
                <div
                  className="relative z-10 flex self-center shrink-0"
                  style={{
                    background: "rgba(255,255,255,0.7)",
                    border: "1px solid rgba(255,255,255,0.9)",
                    backdropFilter: "blur(8px)",
                    borderRadius: 99,
                    padding: 3,
                    marginBottom: 18,
                  }}
                >
                  <div style={{ padding: "6px 14px", fontSize: 12, fontWeight: 500, color: "#0b1020", background: "white", borderRadius: 99, boxShadow: "0 1px 2px rgba(15,23,42,0.04), 0 1px 1px rgba(15,23,42,0.03)", cursor: "default" }}>
                    📱 Mobile
                  </div>
                  <div style={{ padding: "6px 14px", fontSize: 12, fontWeight: 500, color: "#6b75a3", borderRadius: 99, cursor: "default" }}>
                    💻 Desktop
                  </div>
                </div>

                <div className="relative z-10 animate-fade-in-up delay-100">
                  <PhoneFrame>
                    <MobilePreview
                      {...EDITOR_MOBILE_PREVIEW_SHARED}
                      appearance={appearance}
                      linkRows={links
                        .filter(l => !l.draft)
                        .map(l => ({ kind: 'button', title: l.title, url: l.url, icon: l.icon, accent: true }))
                      }
                      linkDensity="relaxed"
                      syncLabel={null}
                      showDeviceFooter={false}
                      onShareBarClick={() => setShowShareModal(true)}
                      bare={true}
                    />
                  </PhoneFrame>
                </div>
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
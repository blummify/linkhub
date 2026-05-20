"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { useSidebar } from "./SidebarContext";
import { LinksIcon, BrandingIcon, AnalyticsIcon, ChevronDownIcon, HelpIcon, LogoutIcon} from "./icons/SidebarIcons";
import { getLinksCount } from "@/app/actions/links";
import { useState, useEffect } from "react";
import UpgradeCard from "./UpgradeCard";

export default function CollapsibleSidebar({ children }: { children: React.ReactNode; isAdmin?: boolean }) {
  const { isCollapsed, toggleSidebar } = useSidebar();
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const user = session?.user;

 const [linkCount, setLinkCount] = useState<number>(0);
  const [isLoadingCount, setIsLoadingCount] = useState(true);
  
  const displayName =
    user?.name?.trim() ||
    user?.email?.split("@")[0] ||
    (status === "loading" ? "…" : "Account");
  const displayEmail = user?.email ?? "";

  const linksHubHref = "/user-dashboard";

  useEffect(() => {
    async function fetchLinkCount() {
      if (status === "authenticated" && user?.id) {
        try {
          const result = await getLinksCount();
          setLinkCount(result.count);
        } catch (error) {
          console.error("Failed to fetch link count:", error);
          setLinkCount(0);
        } finally {
          setIsLoadingCount(false);
        }
      }
    }
    
    fetchLinkCount();
  }, [status, user?.id]);

  const isActiveLink = (href: string) => {
    if (href === linksHubHref) {
      return pathname === linksHubHref || pathname === "/user-admin";
    }
    return pathname === href;
  };

  const getLinkClasses = (href: string) => {
    const baseClasses = `flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} ${isCollapsed ? 'px-1' : 'px-4'} py-3 rounded-xl transition-all active:scale-95 duration-200 ease-in-out relative`;
    if (isActiveLink(href)) {
      return `${baseClasses} bg-gradient-to-r from-primary/10 to-primary-container/20 text-primary font-semibold shadow-sm border border-primary/20`;
    }
    return `${baseClasses} text-on-surface-variant hover:bg-surface-container-highest`;
  };

  return (
    <>
      {/* Mobile Overlay */}
      {!isCollapsed && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          onClick={toggleSidebar}
        />
      )}

      {/* SideNavBar Component */}
      <aside 
        id="sidebar"
        className={`h-screen bg-surface border-r border-outline-variant/50 z-50 transition-all duration-300 ease-in-out fixed left-0 top-0 flex flex-col ${
          isCollapsed 
            ? 'w-20 p-3 -translate-x-full lg:translate-x-0' 
            : 'w-64 p-4 translate-x-0'
        }`}
      >
        {/* Logo Section */}
        <div className={`${isCollapsed ? 'mb-6' : 'mb-10'} flex justify-center ${isCollapsed ? 'pt-1' : 'pt-2'}`}>
          <Image
            src="/link_hub_logo.png"
            alt="LinkHub Logo"
            width={256}
            height={256}
            className={`object-contain ${isCollapsed ? "h-8 w-8" : "h-auto w-32"}`}
          />
        </div>
        
        <nav className="flex-1 space-y-1">
          <div className="text-xs font-semibold text-ink-400 tracking-wider uppercase px-3 pb-2.5">
            Workspace
          </div>
          <Link className={getLinkClasses(linksHubHref)} href={linksHubHref}>
            {isActiveLink(linksHubHref) && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full"></div>
            )}
            <LinksIcon className="w-5 h-5 text-gray-500"/>
            {!isCollapsed && (
              <>
              <span className="text-[13px]">Links</span>
              {isLoadingCount ? (
                <span className="ml-auto text-[10px] font-semibold px-2 py-0.5 rounded-full 
                bg-primary/10 text-primary">
                {linkCount}
              </span>
              ) : (
                <span className="ml-auto text-[10px] font-semibold px-2 py-0.5 rounded-full 
                bg-primary/10 text-primary">
                {linkCount}
              </span>
              )}
              </>
            )}

          </Link>
          <Link className={getLinkClasses('/branding')} href="/branding">
            {isActiveLink('/branding') && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full"></div>
            )}
            <BrandingIcon className="w-5 h-5 text-gray-500"/>
            {!isCollapsed && <span className="text-[13px]">Branding</span>}
          </Link>
          
          <Link className={getLinkClasses('/analytics')} href="/analytics">
            {isActiveLink('/analytics') && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full"></div>
            )}
            <AnalyticsIcon className="w-5 h-5 text-gray-500"/>
            {!isCollapsed && <span className="text-[13px]">Analytics</span>}
          </Link>
        </nav>

        <UpgradeCard isCollapsed={isCollapsed} />

        {/* Bottom Section */}
        <div className={`mt-auto ${isCollapsed ? 'p-1' : 'p-4'} space-y-2 pb-4`}>
          {/* User Profile */}
          <div className={`${isCollapsed ? 'p-1' : ''} cursor-pointer`}>
            <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} 
              p-2.5 rounded-xl border border-ink-100 bg-white hover:border-ink-200 
              transition-all`}>
    
          {/* Avatar */}
            <div className="w-8.5 h-8.5 rounded-full bg-gradient-to-br from-indigo-500 to-[#7a85ff] 
              flex items-center justify-center text-white font-semibold text-sm shrink-0">
              {displayName.charAt(0).toUpperCase()}
            </div>
    
            {!isCollapsed && (
              <>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-ink-900 truncate">{displayName}</p>
                  <p className="text-[11.5px] text-ink-400 truncate">{displayEmail || " "}</p>
                </div>
                <ChevronDownIcon className="w-5 h-5 text-gray-500"/>

              </>
            )}
          </div>
        </div>
          
          {/* Bottom Links */}
          <div className={`flex gap-2 mt-2.5 ${isCollapsed ? 'flex-col' : ''}`}>
            <Link href="/help" 
              className={`flex-1 flex items-center ${isCollapsed ? 'justify-center p-2' : 'gap-2 p-2.5'} 
                rounded-xl text-ink-500 hover:bg-ink-100 hover:text-ink-900 transition-all cursor-pointer`}>
              <HelpIcon className="w-5 h-5 text-gray-500" />
              {!isCollapsed && <span className="text-[12.5px]">Help</span>}
            </Link>
  
              <button onClick={() => signOut()}
              className={`flex-1 flex items-center ${isCollapsed ? 'justify-center p-2' : 'gap-2 p-2.5'} 
                rounded-xl text-ink-500 hover:bg-ink-100 hover:text-ink-900 transition-all cursor-pointer`}>
              <LogoutIcon className="w-5 h-5 text-gray-500" />
              {!isCollapsed && <span className="text-[12.5px]">Log out</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 h-screen overflow-hidden relative flex flex-col">
        {children}
      </div>
    </>
  );
}

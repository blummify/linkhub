"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { useSidebar } from "./SidebarContext";
import UserAvatar from "./UserAvatar";

export default function CollapsibleSidebar({ children, isAdmin = false }: { children: React.ReactNode; isAdmin?: boolean }) {
  const { isCollapsed, toggleSidebar } = useSidebar();
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const user = session?.user;
  const displayName =
    user?.name?.trim() ||
    user?.email?.split("@")[0] ||
    (status === "loading" ? "…" : "Account");
  const displayEmail = user?.email ?? "";

  const isActiveLink = (href: string) => {
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
          <img
            src="/link_hub_logo.png"
            alt="LinkHub Logo"
            className={`object-contain ${isCollapsed ? "h-8 w-8" : "h-auto w-32"}`}
          />
        </div>
        
        <nav className="flex-1 space-y-1">
          <Link className={getLinkClasses('/user-admin')} href="/user-admin">
            {isActiveLink('/user-admin') && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full"></div>
            )}
            <span className="material-symbols-outlined">link</span>
            {!isCollapsed && <span className="text-[13px]">Links</span>}
          </Link>
          <Link className={getLinkClasses('/appearance')} href="/appearance">
            {isActiveLink('/appearance') && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full"></div>
            )}
            <span className="material-symbols-outlined">palette</span>
            {!isCollapsed && <span className="text-[13px]">Appearance</span>}
          </Link>
          
          <Link className={getLinkClasses('/analytics')} href="/analytics">
            {isActiveLink('/analytics') && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full"></div>
            )}
            <span className="material-symbols-outlined">analytics</span>
            {!isCollapsed && <span className="text-[13px]">Analytics</span>}
          </Link>
          
          <Link className={getLinkClasses('/admin/users')} href="/admin/users">
            {isActiveLink('/admin/users') && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full"></div>
            )}
            <span className="material-symbols-outlined">groups</span>
            {!isCollapsed && <span className="text-[13px]">Users</span>}
          </Link>
          
          <Link className={getLinkClasses('/admin/settings')} href="/admin/settings">
            {isActiveLink('/admin/settings') && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full"></div>
            )}
            <span className="material-symbols-outlined">settings</span>
            {!isCollapsed && <span className="text-[13px]">Settings</span>}
          </Link>
        </nav>
        
        {/* Bottom Section */}
        <div className={`mt-auto ${isCollapsed ? 'p-1' : 'p-4'} space-y-2 pb-4`}>
          {/* User Profile */}
          <div className={`${isCollapsed ? 'justify-center' : 'flex items-center gap-3'} ${isCollapsed ? 'p-2' : 'p-3'} bg-surface-container-highest rounded-xl`}>
            <div className={`${isCollapsed ? 'w-8 h-8' : 'w-10 h-10'} rounded-full overflow-hidden shrink-0`}>
              <UserAvatar
                src={user?.image}
                name={user?.name}
                email={user?.email}
                className="w-full h-full object-cover"
              />
            </div>
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-on-surface truncate">{displayName}</p>
                <p className="text-[11px] text-on-surface-variant truncate">{displayEmail || " "}</p>
              </div>
            )}
          </div>
          
          {/* Bottom Links */}
          <div className="space-y-1">
            <Link className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} ${isCollapsed ? 'px-1 py-2' : 'px-3 py-2'} text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest rounded-lg transition-all`} href="/help">
              <span className={`material-symbols-outlined ${isCollapsed ? 'text-base' : 'text-lg'}`}>help</span>
              {!isCollapsed && <span className="text-[13px]">Help Center</span>}
            </Link>
            <button
              type="button"
              className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} ${isCollapsed ? 'px-1 py-2' : 'px-3 py-2'} text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest rounded-lg transition-all text-left`}
              onClick={() => void signOut({ callbackUrl: "/login" })}
            >
              <span className={`material-symbols-outlined ${isCollapsed ? 'text-base' : 'text-lg'}`}>logout</span>
              {!isCollapsed && <span className="text-[13px]">Log Out</span>}
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

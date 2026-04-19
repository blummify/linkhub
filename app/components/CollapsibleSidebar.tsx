"use client";

import { usePathname } from "next/navigation";
import { useSidebar } from "./SidebarContext";

export default function CollapsibleSidebar({ children, isAdmin = false }: { children: React.ReactNode; isAdmin?: boolean }) {
  const { isCollapsed, toggleSidebar } = useSidebar();
  const pathname = usePathname();

  const isActiveLink = (href: string) => {
    return pathname === href;
  };

  const getLinkClasses = (href: string) => {
    const baseClasses = "flex items-center gap-3 px-4 py-3 rounded-xl transition-all active:scale-95 duration-200 ease-in-out relative";
    if (isActiveLink(href)) {
      return `${baseClasses} bg-gradient-to-r from-primary/10 to-primary-container/20 text-primary font-semibold shadow-sm border border-primary/20`;
    }
    return `${baseClasses} text-on-surface-variant hover:bg-surface-container-highest`;
  };

  return (
    <>
      {/* SideNavBar Component */}
      <aside 
        id="sidebar"
        className={`h-screen bg-surface border-r border-outline-variant/50 z-50 transition-all duration-300 ease-in-out fixed left-0 top-0 flex flex-col ${
          isCollapsed ? 'w-0 p-0 overflow-hidden' : 'w-64 p-4'
        }`}
      >
        {/* Logo Section */}
        <div className="mb-8 px-4">
          <div className="flex items-center gap-3">
            <img 
              src="/link_hub_logo.png" 
              alt="CreatorHub Logo" 
              className="w-32 h-32"
            />
            <span className="text-xl font-bold tracking-tight text-primary">CreatorHub</span>
          </div>
        </div>
        
        <nav className="flex-1 space-y-1">
          <a className={getLinkClasses('/user-admin')} href="/user-admin">
            {isActiveLink('/user-admin') && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full"></div>
            )}
            <span className="material-symbols-outlined">link</span>
            <span className="text-[13px]">Links</span>
          </a>
          <a className={getLinkClasses('/appearance')} href="/appearance">
            {isActiveLink('/appearance') && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full"></div>
            )}
            <span className="material-symbols-outlined">palette</span>
            <span className="text-[13px]">Appearance</span>
          </a>
          
          <a className={getLinkClasses('/analytics')} href="/analytics">
            {isActiveLink('/analytics') && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full"></div>
            )}
            <span className="material-symbols-outlined">analytics</span>
            <span className="text-[13px]">Analytics</span>
          </a>
          
          <a className={getLinkClasses('/admin/users')} href="/admin/users">
            {isActiveLink('/admin/users') && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full"></div>
            )}
            <span className="material-symbols-outlined">groups</span>
            <span className="text-[13px]">Users</span>
          </a>
          
          <a className={getLinkClasses('/admin/settings')} href="/admin/settings">
            {isActiveLink('/admin/settings') && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full"></div>
            )}
            <span className="material-symbols-outlined">settings</span>
            <span className="text-[13px]">Settings</span>
          </a>
        </nav>
        
        {/* Bottom Section */}
        <div className="mt-auto p-4 space-y-4">
          {/* User Profile */}
          <div className="flex items-center gap-3 p-3 bg-surface-container-highest rounded-xl">
            <div className="w-10 h-10 rounded-full overflow-hidden">
              <img 
                alt="User Avatar" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBI57sppD_FLi9ouIh-nc1Tcj4PF6vKEAcZmAdyk0FM0P-SgHL4GDKTwJojpoC4Zdgclz61XTPE4THKrbPyXX4zalYeXTqHkAbKlA85wWL3zAe8gityPPdlDtwuDU0upwunIQPs0M13K-oQ1Tq0ZgfR8cdmGtB_k1Vc8Hdb1TRCamkkRf4oYpPXWTH73M_JuKxNU08-S8VdQevKwYgDZtbUJPtCSxb09pJUEGDjVyW1zafOoKx6JbW26p684_qC_-pO6N_XlrhrrH10"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold text-on-surface truncate">Alex Rivers</p>
              <p className="text-[11px] text-on-surface-variant truncate">alex@creatorhub.com</p>
            </div>
          </div>
          
          {/* Bottom Links */}
          <div className="space-y-1">
            <a className="flex items-center gap-3 px-3 py-2 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest rounded-lg transition-all" href="/help">
              <span className="material-symbols-outlined text-lg">help</span>
              <span className="text-[13px]">Help Center</span>
            </a>
            <a className="flex items-center gap-3 px-3 py-2 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest rounded-lg transition-all" href="/logout">
              <span className="material-symbols-outlined text-lg">logout</span>
              <span className="text-[13px]">Log Out</span>
            </a>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1">
        {children}
      </div>
    </>
  );
}

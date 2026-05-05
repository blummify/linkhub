"use client";

import { useState, useEffect } from "react";
import { signOut, useSession } from "next-auth/react";
import { useSidebar } from "./SidebarContext";
import UserAvatar from "./UserAvatar";

export default function AppHeader({ isAdmin = false }: { isAdmin?: boolean }) {
  const { isCollapsed, toggleSidebar } = useSidebar();
  const { data: session } = useSession();
  const user = session?.user;
  const displayName =
    user?.name?.trim() ||
    user?.email?.split("@")[0] ||
    "Account";
  const [isMobileSearch, setIsMobileSearch] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobileSearch(window.innerWidth < 640);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  return (
    <header 
      id="header"
      className={`fixed top-0 right-0 z-40 bg-white/70 dark:bg-surface/70 backdrop-blur-2xl border-b border-outline-variant/30 flex justify-between items-center h-16 px-4 sm:px-8 transition-all duration-300 ease-in-out ${
        isCollapsed ? 'lg:w-[calc(100%-5rem)] w-full' : 'lg:w-[calc(100%-12rem)] sm:lg:w-[calc(100%-16rem)] w-full'
      }`}
    >
      <div className="flex items-center gap-4 sm:gap-8 flex-1 min-w-0">
        {/* Toggle Sidebar Button */}
        <button 
          onClick={toggleSidebar}
          className="w-9 h-9 shrink-0 rounded-full border border-outline-variant/40 flex items-center justify-center text-on-surface-variant hover:text-primary hover:border-primary/40 hover:bg-primary/5 transition-all bg-white dark:bg-surface shadow-sm active:scale-90"
        >
          <span className="material-symbols-outlined text-[20px] font-black">
            {isCollapsed ? 'menu_open' : 'menu'}
          </span>
        </button>

        {/* Enhanced Search Bar */}
        <div className="relative w-full max-w-xl group">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center">
            <span className="material-symbols-outlined text-on-surface-variant/60 text-[18px] sm:text-[22px] group-focus-within:text-primary transition-colors">search</span>
          </div>
          <input 
            className="w-full bg-surface-container-low/40 border border-outline-variant/20 rounded-2xl pl-12 pr-4 sm:pr-14 py-2.5 text-[12px] sm:text-[13px] font-black text-on-surface tracking-tight placeholder:text-on-surface-variant/40 focus:ring-[6px] focus:ring-primary/5 focus:border-primary/40 focus:bg-white transition-all outline-none" 
            placeholder={isAdmin ? (isMobileSearch ? "Search..." : "Search designers...") : "Search..."} 
            type="text"
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2 hidden lg:flex items-center gap-1.5 px-2 py-1 bg-surface-container-low border border-outline-variant/30 rounded-lg text-[10px] font-black text-on-surface-variant/60">
            <span className="text-[12px]">⌘</span>
            <span>K</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 sm:gap-6 shrink-0 ml-4">
        {/* Action Icons */}
        <div className="hidden md:flex items-center gap-1.5">
          <button className="w-10 h-10 flex items-center justify-center rounded-xl text-on-surface-variant transition-all hover:bg-primary/5 hover:text-primary active:scale-90 group relative">
            <span className="material-symbols-outlined text-[20px] font-medium">notifications</span>
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-primary rounded-full border-2 border-white shadow-sm" />
          </button>
          <button className="w-10 h-10 flex items-center justify-center rounded-xl text-on-surface-variant transition-all hover:bg-primary/5 hover:text-primary active:scale-90">
            <span className="material-symbols-outlined text-[20px] font-medium">help</span>
          </button>
        </div>

        {/* User Profile with Dropdown */}
        <div className="relative group">
          <button type="button" className="relative flex items-center gap-2 active:scale-95 transition-all duration-300">
            <div className="absolute -inset-1.5 bg-gradient-to-tr from-primary/20 to-primary/0 rounded-full opacity-0 group-hover:opacity-100 blur-md transition-opacity" />
            <UserAvatar
              src={user?.image}
              name={user?.name}
              email={user?.email}
              className="relative w-10 h-10 rounded-full border-2 border-white dark:border-surface shadow-lg object-cover ring-1 ring-outline-variant/40 group-hover:ring-primary/60 transition-all group-hover:rotate-6"
            />
            <span className="material-symbols-outlined text-on-surface-variant text-[18px] group-hover:text-primary transition-colors hidden sm:block">keyboard_arrow_down</span>
          </button>

          {/* Premium Dropdown Menu with Hover Bridge */}
          <div className="absolute top-full right-0 pt-3 w-56 opacity-0 translate-y-4 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all duration-300 z-50">
            <div className="bg-white/80 dark:bg-surface/80 backdrop-blur-xl border border-outline-variant/30 rounded-[1.5rem] shadow-2xl p-2 overflow-hidden">
              <div className="px-4 py-3 border-b border-outline-variant/20 mb-1">
                <p className="text-[13px] font-black tracking-tight text-on-surface">{displayName}</p>
                <p className="text-[11px] font-medium text-on-surface-variant/60">{user?.email ?? ""}</p>
              </div>
              
              <button className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-[13px] font-bold text-on-surface-variant hover:bg-primary/5 hover:text-primary transition-colors text-left group/item">
                <span className="material-symbols-outlined text-[20px] opacity-60 group-hover/item:opacity-100">person</span>
                Your Profile
              </button>
              
              <button className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-[13px] font-bold text-on-surface-variant hover:bg-primary/5 hover:text-primary transition-colors text-left group/item">
                <span className="material-symbols-outlined text-[20px] opacity-60 group-hover/item:opacity-100">settings</span>
                Settings
              </button>
              
              <div className="h-px bg-outline-variant/20 my-1 mx-2" />
              
              <button
                type="button"
                className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-[13px] font-bold text-error/80 hover:bg-error/5 hover:text-error transition-colors text-left group/item"
                onClick={() => void signOut({ callbackUrl: "/login" })}
              >
                <span className="material-symbols-outlined text-[20px]">logout</span>
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useSidebar } from "./SidebarContext";

export default function AppHeader({ isAdmin = false }: { isAdmin?: boolean }) {
  const { isCollapsed, toggleSidebar } = useSidebar();
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
        <div className="hidden md:flex items-center gap-2">
          <button className="hover:bg-primary/5 hover:text-primary rounded-2xl p-2.5 transition-all flex items-center justify-center relative text-on-surface-variant group">
            <span className="material-symbols-outlined text-[24px]">notifications</span>
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-primary rounded-full ring-2 ring-white"></span>
          </button>
          <button className="hover:bg-primary/5 hover:text-primary rounded-2xl p-2.5 transition-all flex items-center justify-center text-on-surface-variant">
            <span className="material-symbols-outlined text-[24px]">contact_support</span>
          </button>
        </div>

        {/* User Profile */}
        <button className="relative group active:scale-90 transition-all duration-300">
          <div className="absolute -inset-1.5 bg-gradient-to-tr from-primary/20 to-primary/0 rounded-full opacity-0 group-hover:opacity-100 blur-md transition-opacity" />
          <img 
            alt="User Profile" 
            className="relative w-10 h-10 rounded-full border-2 border-white dark:border-surface shadow-lg object-cover ring-1 ring-outline-variant/40 group-hover:ring-primary/60 transition-all" 
            src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100&h=100"
          />
        </button>
      </div>
    </header>
  );
}

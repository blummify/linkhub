"use client";

import { useState, useEffect } from "react";

export default function CollapsibleSidebar({ children, isAdmin = false }: { children: React.ReactNode; isAdmin?: boolean }) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    // Update header and main content margins based on sidebar state
    const header = document.getElementById('header');
    const mainContent = document.getElementById('mainContent');
    
    if (header && mainContent) {
      if (isCollapsed) {
        header.style.width = 'calc(100% - 0rem)';
        mainContent.style.marginLeft = '0';
      } else {
        header.style.width = 'calc(100% - 16rem)';
        mainContent.style.marginLeft = '16rem';
      }
    }
  }, [isCollapsed]);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
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
        <div className="mb-8 px-4">
          <span className="text-xl font-bold tracking-tight text-indigo-700">Creator Hub</span>
          <p className="text-xs text-on-surface-variant mt-1 font-medium">@username</p>
        </div>
        <nav className="flex-1 space-y-2">
          {/* Active: Links */}
          <a className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-container-highest rounded-xl transition-all active:scale-95 duration-200 ease-in-out" href="/user-analytics">
            <span className="material-symbols-outlined" data-icon="link">link</span>
            <span className="text-sm">Links</span>
          </a>
          <a className="flex items-center gap-3 px-4 py-3 bg-primary-container text-primary rounded-xl font-bold transition-all active:scale-95 duration-200 ease-in-out" href="/appearance">
            <span className="material-symbols-outlined" data-icon="palette">palette</span>
            <span className="text-sm">Appearance</span>
          </a>
          <a className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-container-highest rounded-xl transition-all active:scale-95 duration-200 ease-in-out" href="/user-analytics">
            <span className="material-symbols-outlined" data-icon="monitoring">monitoring</span>
            <span className="text-sm">Analytics</span>
          </a>
          <a className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-container-highest rounded-xl transition-all active:scale-95 duration-200 ease-in-out" href="/user-admin">
            <span className="material-symbols-outlined" data-icon="settings">settings</span>
            <span className="text-sm">Admin</span>
          </a>
        </nav>
        <div className="mt-auto p-4 bg-indigo-700 rounded-2xl text-white">
          <p className="text-xs font-bold uppercase tracking-wider mb-2 opacity-80">Pro Plan</p>
          <p className="text-sm font-medium mb-4">Unlock advanced analytics and themes.</p>
          <button className="w-full py-2 bg-surface-container-highest text-on-primary-container rounded-full text-sm font-bold shadow-sm hover:bg-surface-container transition-colors">
            Upgrade to Pro
          </button>
        </div>
      </aside>

      {/* Collapse Toggle Button (separate from sidebar) */}
      <button 
        id="sidebarToggle"
        onClick={toggleSidebar}
        className={`fixed w-6 h-6 bg-surface border border-outline-variant rounded-full shadow-md flex items-center justify-center hover:bg-surface-container-highest transition-all duration-300 z-50 ${
          isCollapsed ? 'left-2' : 'left-64'
        } top-4`}
      >
        <span className="material-symbols-outlined text-xs text-on-surface-variant">
          {isCollapsed ? 'chevron_right' : 'chevron_left'}
        </span>
      </button>

      {/* Main Content Area */}
      <div className="flex-1">
        {children}
      </div>
    </>
  );
}

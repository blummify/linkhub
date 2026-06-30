"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import { AdminSidebar, type AdminUserInfo } from "./AdminSidebar";
import { AdminTopbar } from "./AdminTopbar";

const MOBILE_QUERY = "(max-width: 860px)";

/**
 * Admin layout shell: a dark fixed sidebar plus a topbar over the page content.
 * The nav toggle collapses the sidebar on desktop and opens it as an overlay
 * drawer on mobile, mirroring the prototype's responsive behaviour.
 */
export function AdminShell({ user, children }: { user: AdminUserInfo; children: ReactNode }) {
  const [isMobile, setIsMobile] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(MOBILE_QUERY);
    const update = () => {
      setIsMobile(mq.matches);
      setMobileOpen(false);
      setCollapsed(false);
    };
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [mobileOpen]);

  const toggleNav = useCallback(() => {
    if (window.matchMedia(MOBILE_QUERY).matches) {
      setMobileOpen((open) => !open);
    } else {
      setCollapsed((value) => !value);
    }
  }, []);

  const closeMobileNav = useCallback(() => setMobileOpen(false), []);

  const sidebarHidden = isMobile ? !mobileOpen : collapsed;
  const mainMargin = isMobile || collapsed ? 0 : 248;

  return (
    <div className="min-h-screen bg-paper font-[family-name:var(--font-geist)] text-ink-900">
      <div
        className="fixed left-0 top-0 z-40 h-screen transition-transform duration-300 ease-out motion-reduce:transition-none max-[860px]:z-[95]"
        style={{ transform: sidebarHidden ? "translateX(-100%)" : "none" }}
      >
        <AdminSidebar user={user} onNavigate={isMobile ? closeMobileNav : undefined} />
      </div>

      {isMobile && mobileOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={closeMobileNav}
          className="fixed inset-0 z-[94] bg-ink-900/50"
        />
      )}

      <div
        className="flex min-h-screen flex-col transition-[margin] duration-300 ease-out motion-reduce:transition-none"
        style={{ marginLeft: mainMargin }}
      >
        <AdminTopbar userName={user.name} onToggleNav={toggleNav} />
        <main id="mainContent" tabIndex={-1} className="flex-1 overflow-x-hidden p-7">
          {children}
        </main>
      </div>
    </div>
  );
}

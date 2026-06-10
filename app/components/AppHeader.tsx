"use client";

import { useRef } from "react";
import { signOut, useSession } from "next-auth/react";
import { useSidebarStore } from "@/store/sidebarStore";
import UserAvatar from "./UserAvatar";
import { useShortKey } from "./hooks/useShortKey";

export default function AppHeader({}: { isAdmin?: boolean }) {
  const isCollapsed = useSidebarStore((s) => s.isCollapsed);
  const toggleSidebar = useSidebarStore((s) => s.toggle);
  const { data: session } = useSession();

  const searchInputRef = useRef<HTMLInputElement>(null);

  const {modifier} = useShortKey( ()=> {
    searchInputRef.current?.focus();
  });

  const user = session?.user;
  const isEmailVerified = !!user?.emailVerified;
  const displayName =
    user?.name?.trim() ||
    user?.email?.split("@")[0] ||
    "Account";
  
  return (
    <header
      id="header"
      className={`fixed top-0 right-0 z-40 bg-white/80 backdrop-blur-2xl border-b hidden lg:flex justify-between items-center h-16 px-4 sm:px-8 transition-all duration-300 ease-in-out ${
        isCollapsed ? 'lg:w-[calc(100%-5rem)] w-full' : 'lg:w-[calc(100%-12rem)] sm:lg:w-[calc(100%-16rem)] w-full'
      }`}
      style={{ borderBottomColor: '#eef0f7' }}
    >
      <div className="flex items-center gap-4 sm:gap-6 flex-1 min-w-0">
        <button
          onClick={toggleSidebar}
          className="shrink-0 flex items-center justify-center transition-all active:scale-90"
          style={{
            width: 38, height: 38,
            borderRadius: 12,
            border: '1px solid #eef0f7',
            background: 'white',
            color: '#6b75a3',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#d6dae9'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#eef0f7'; }}
        >
          <span className="material-symbols-outlined text-[20px] font-black">
            {isCollapsed ? 'menu_open' : 'menu'}
          </span>
        </button>

        <div className="relative w-full group">
          <div className="absolute left-[14px] top-1/2 -translate-y-1/2 pointer-events-none">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6b75a3" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35"/>
            </svg>
          </div>
          <input
            ref={searchInputRef}
            className="w-full pl-[42px] pr-4 sm:pr-[90px] text-[14px] text-[#0b1020] placeholder:text-[#6b75a3] outline-none transition-all"
            style={{
              height: 42,
              borderRadius: 12,
              background: 'white',
              border: '1px solid #eef0f7',
            }}
            onFocus={e => {
              e.currentTarget.style.borderColor = '#6873ff';
              e.currentTarget.style.boxShadow = '0 0 0 4px rgba(104,115,255,0.12)';
            }}
            onBlur={e => {
              e.currentTarget.style.borderColor = '#eef0f7';
              e.currentTarget.style.boxShadow = 'none';
            }}
            placeholder="Search links, pages, analytics…"
            type="text"
          />
          <div
            className="absolute right-[14px] top-1/2 -translate-y-1/2 hidden lg:inline-flex items-center gap-[3px]"
            style={{
              fontFamily: 'monospace',
              fontSize: 11,
              color: '#6b75a3',
              padding: '3px 7px',
              borderRadius: 6,
              background: '#eef0f7',
              border: '1px solid #d6dae9',
              borderBottomWidth: 2,
            }}
          >
            <span suppressHydrationWarning>{modifier}</span>
            <span style={{ opacity: 0.6 }}>K</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 shrink-0 ml-4">
        <div className="hidden md:flex items-center gap-1.5">
          <button
            className="relative flex items-center justify-center transition-all active:scale-90"
            style={{ width: 38, height: 38, borderRadius: 12, border: '1px solid #eef0f7', background: 'white', color: '#6b75a3' }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#d6dae9'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#eef0f7'; }}
          >
            <span className="material-symbols-outlined text-[20px] font-medium">notifications</span>
            <span className="absolute top-[9px] right-[10px] w-[7px] h-[7px] rounded-full border-2 border-white" style={{ background: '#e11d48' }} />
          </button>
          <button
            className="flex items-center justify-center transition-all active:scale-90"
            style={{ width: 38, height: 38, borderRadius: 12, border: '1px solid #eef0f7', background: 'white', color: '#6b75a3' }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#d6dae9'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#eef0f7'; }}
          >
            <span className="material-symbols-outlined text-[20px] font-medium">help</span>
          </button>
        </div>

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

          <div className="absolute top-full right-0 pt-3 w-56 opacity-0 translate-y-4 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all duration-300 z-50">
            <div className="bg-white/80 dark:bg-surface/80 backdrop-blur-xl border border-outline-variant/30 rounded-[1.5rem] shadow-2xl p-2 overflow-hidden">
              <div className="px-4 py-3 border-b border-outline-variant/20 mb-1">
                <p className="text-[13px] font-black tracking-tight text-on-surface">{displayName}</p>
                <p className="text-[11px] font-medium text-on-surface-variant/60">{user?.email ?? ""}</p>
                {isEmailVerified ? (
                  <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                    <span className="material-symbols-outlined text-[12px]">verified</span>
                    Email verified
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-bold text-amber-600 dark:text-amber-400">
                    <span className="material-symbols-outlined text-[12px]">warning</span>
                    Email not verified
                  </span>
                )}
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
                onClick={() => {
                  localStorage.removeItem("linkhub-branding-v2");
                  localStorage.removeItem("linkhub-branding-v1");
                  void signOut({ callbackUrl: "/login" });
                }}
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

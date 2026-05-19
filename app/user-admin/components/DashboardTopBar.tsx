"use client";

import { useRef } from "react";
import { useSidebar } from "../../components/SidebarContext";
import { useShortKey } from "../../components/hooks/useShortKey";

export function DashboardTopBar({ onSearchClick }: { onSearchClick?: () => void }) {
  const { toggleSidebar } = useSidebar();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { modifier } = useShortKey(() => {
    onSearchClick ? onSearchClick() : searchInputRef.current?.focus();
  });

  return (
    <div className="flex items-center" style={{ gap: 14, marginBottom: 28 }}>
      {/* Menu / sidebar toggle */}
      <button
        type="button"
        onClick={toggleSidebar}
        className="shrink-0 flex items-center justify-center transition-all active:scale-90"
        style={{
          width: 38,
          height: 38,
          borderRadius: 12,
          border: "1px solid #eef0f7",
          background: "white",
          color: "#6b75a3",
          cursor: "pointer",
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "#d6dae9"; }}
        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "#eef0f7"; }}
        aria-label="Toggle sidebar"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 12h18M3 6h18M3 18h18"/>
        </svg>
      </button>

      {/* Search bar */}
      <div
        className="relative flex-1 flex items-center"
        style={{ height: 42, cursor: onSearchClick ? "pointer" : "text" }}
        onClick={onSearchClick}
      >
        <div className="absolute left-[14px] top-1/2 -translate-y-1/2 pointer-events-none">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6b75a3" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35"/>
          </svg>
        </div>
        <input
          ref={searchInputRef}
          type="text"
          readOnly={!!onSearchClick}
          placeholder="Search links, pages, analytics…"
          className="w-full h-full pl-[42px] pr-4 lg:pr-[90px] text-[14px] text-[#0b1020] placeholder:text-[#6b75a3] outline-none transition-all"
          style={{
            borderRadius: 12,
            background: "white",
            border: "1px solid #eef0f7",
            cursor: onSearchClick ? "pointer" : "text",
          }}
          onFocus={e => {
            if (onSearchClick) { e.currentTarget.blur(); onSearchClick(); return; }
            e.currentTarget.style.borderColor = "#6873ff";
            e.currentTarget.style.boxShadow = "0 0 0 4px rgba(104,115,255,0.12)";
          }}
          onBlur={e => {
            e.currentTarget.style.borderColor = "#eef0f7";
            e.currentTarget.style.boxShadow = "none";
          }}
        />
        <div
          className="absolute right-[14px] top-1/2 -translate-y-1/2 hidden lg:inline-flex items-center gap-[3px]"
          style={{
            fontFamily: "monospace",
            fontSize: 11,
            color: "#6b75a3",
            padding: "3px 7px",
            borderRadius: 6,
            background: "#eef0f7",
            border: "1px solid #d6dae9",
            borderBottomWidth: 2,
          }}
        >
          <span suppressHydrationWarning>{modifier}</span>
          <span style={{ opacity: 0.6 }}>K</span>
        </div>
      </div>

      {/* Action icons */}
      <div className="flex items-center" style={{ gap: 8 }}>
        {/* Notifications */}
        <IconBtn aria-label="Notifications">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
            <path strokeLinecap="round" strokeLinejoin="round" d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"/>
          </svg>
          {/* Red ping dot */}
          <span
            className="absolute rounded-full border-2 border-white"
            style={{ width: 7, height: 7, background: "#e11d48", top: 9, right: 10 }}
          />
        </IconBtn>

        {/* Help */}
        <IconBtn aria-label="Help">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
            <circle cx="12" cy="12" r="10"/>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3M12 17h.01"/>
          </svg>
        </IconBtn>
      </div>
    </div>
  );
}

function IconBtn({
  children,
  "aria-label": label,
}: {
  children: React.ReactNode;
  "aria-label"?: string;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      className="relative shrink-0 flex items-center justify-center transition-all active:scale-90"
      style={{
        width: 38,
        height: 38,
        borderRadius: 12,
        border: "1px solid #eef0f7",
        background: "white",
        color: "#6b75a3",
        cursor: "pointer",
      }}
      onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "#d6dae9"; }}
      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "#eef0f7"; }}
    >
      {children}
    </button>
  );
}

"use client";

import { useRef, useState, useEffect } from "react";
import { useSidebarStore } from "@/store/sidebarStore";
import { useShortKey } from "../../components/hooks/useShortKey";

const DEMO_NOTIFICATIONS: {
  id: number;
  icon: "trend" | "link" | "star";
  title: string;
  sub: string;
  unread: boolean;
}[] = [
  {
    id: 1,
    icon: "trend",
    title: "Your page hit 100 visits",
    sub: "Your Linkhub page · 2h ago",
    unread: true,
  },
  {
    id: 2,
    icon: "link",
    title: "Portfolio link getting traction",
    sub: "23 clicks today · 5h ago",
    unread: true,
  },
  {
    id: 3,
    icon: "star",
    title: "Welcome to Linkhub!",
    sub: "Set up your profile to get started · 1d ago",
    unread: false,
  },
];

function NotifIcon({ type }: { type: "trend" | "link" | "star" }) {
  if (type === "trend")
    return (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
        <polyline points="16 7 22 7 22 13" />
      </svg>
    );
  if (type === "link")
    return (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
      </svg>
    );
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

const NOTIF_ICON_STYLES: Record<string, { bg: string; color: string }> = {
  trend: { bg: "#f0fdf4", color: "#16a34a" },
  link:  { bg: "#eff6ff", color: "#3b82f6" },
  star:  { bg: "#fffbeb", color: "#d97706" },
};

export function DashboardTopBar({
  onSearchClick,
  searchPlaceholder = "Search links, pages, analytics…",
  sticky = true,
}: {
  onSearchClick?: () => void;
  searchPlaceholder?: string;
  /** Pin the bar to the top of the scroll area (default on dashboard pages) */
  sticky?: boolean;
}) {
  const toggleSidebar = useSidebarStore((s) => s.toggle);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { modifier } = useShortKey(() => {
    if (onSearchClick) {
      onSearchClick();
    } else {
      searchInputRef.current?.focus();
    }
  });

  const [showNotif, setShowNotif] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [notifRead, setNotifRead] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const helpRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifRead ? 0 : DEMO_NOTIFICATIONS.filter((n) => n.unread).length;

  useEffect(() => {
    if (!showNotif && !showHelp) return;
    const handler = (e: MouseEvent) => {
      if (showNotif && notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotif(false);
      }
      if (showHelp && helpRef.current && !helpRef.current.contains(e.target as Node)) {
        setShowHelp(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showNotif, showHelp]);

  const handleOpenNotif = () => {
    setShowHelp(false);
    setShowNotif((p) => !p);
  };

  const handleOpenHelp = () => {
    setShowNotif(false);
    setShowHelp((p) => !p);
  };

  const toolbar = (
      <div className="flex items-center" style={{ gap: 14 }}>
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
            placeholder={searchPlaceholder}
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

        <div className="flex items-center" style={{ gap: 8 }}>

          <div ref={notifRef} style={{ position: "relative" }}>
            <IconBtn aria-label="Notifications" active={showNotif} onClick={handleOpenNotif}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"/>
              </svg>
              {unreadCount > 0 && (
                <span
                  className="absolute rounded-full border-2 border-white"
                  style={{ width: 7, height: 7, background: "#e11d48", top: 9, right: 10 }}
                />
              )}
            </IconBtn>

            {showNotif && (
              <div
                style={{
                  position: "absolute",
                  top: "calc(100% + 10px)",
                  right: 0,
                  width: 300,
                  background: "white",
                  borderRadius: 16,
                  border: "1px solid #eef0f7",
                  boxShadow: "0 20px 40px -12px rgba(15,23,42,0.18), 0 8px 16px -8px rgba(15,23,42,0.10)",
                  zIndex: 100,
                  animation: "topbarPopIn 0.18s cubic-bezier(0.16,1,0.3,1)",
                }}
              >
                <div
                  style={{
                    position: "absolute", top: -6, right: 13,
                    width: 12, height: 12,
                    background: "white",
                    borderLeft: "1px solid #eef0f7",
                    borderTop: "1px solid #eef0f7",
                    transform: "rotate(45deg)",
                  }}
                />

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "14px 16px 12px",
                    borderBottom: "1px solid #f2f4fb",
                  }}
                >
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#0b1020" }}>
                    Notifications
                    {unreadCount > 0 && (
                      <span
                        style={{
                          marginLeft: 7,
                          fontSize: 10.5,
                          fontWeight: 600,
                          background: "#e11d48",
                          color: "white",
                          borderRadius: 99,
                          padding: "1px 6px",
                        }}
                      >
                        {unreadCount}
                      </span>
                    )}
                  </span>
                  {!notifRead && (
                    <button
                      type="button"
                      onClick={() => setNotifRead(true)}
                      style={{
                        fontSize: 11.5,
                        color: "#3b46e0",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        fontFamily: "inherit",
                        padding: 0,
                      }}
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                <div style={{ padding: "6px 0" }}>
                  {DEMO_NOTIFICATIONS.map((n) => {
                    const s = NOTIF_ICON_STYLES[n.icon];
                    const isUnread = n.unread && !notifRead;
                    return (
                      <div
                        key={n.id}
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: 11,
                          padding: "10px 16px",
                          background: isUnread ? "#fafbff" : "transparent",
                          cursor: "default",
                        }}
                      >
                        <div
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: 9,
                            background: s.bg,
                            color: s.color,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                          }}
                        >
                          <NotifIcon type={n.icon} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div
                            style={{
                              fontSize: 13,
                              fontWeight: isUnread ? 600 : 400,
                              color: "#0b1020",
                              lineHeight: 1.3,
                            }}
                          >
                            {n.title}
                          </div>
                          <div style={{ fontSize: 11.5, color: "#6b75a3", marginTop: 2 }}>
                            {n.sub}
                          </div>
                        </div>
                        {isUnread && (
                          <span
                            style={{
                              width: 6,
                              height: 6,
                              borderRadius: "50%",
                              background: "#3b46e0",
                              flexShrink: 0,
                              marginTop: 5,
                            }}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div ref={helpRef} style={{ position: "relative" }}>
            <IconBtn aria-label="Help" active={showHelp} onClick={handleOpenHelp}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                <circle cx="12" cy="12" r="10"/>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3M12 17h.01"/>
              </svg>
            </IconBtn>

            {showHelp && (
              <div
                style={{
                  position: "absolute",
                  top: "calc(100% + 10px)",
                  right: 0,
                  width: 230,
                  background: "white",
                  borderRadius: 16,
                  border: "1px solid #eef0f7",
                  boxShadow: "0 20px 40px -12px rgba(15,23,42,0.18), 0 8px 16px -8px rgba(15,23,42,0.10)",
                  zIndex: 100,
                  animation: "topbarPopIn 0.18s cubic-bezier(0.16,1,0.3,1)",
                  padding: "6px 0",
                }}
              >
                <div
                  style={{
                    position: "absolute", top: -6, right: 13,
                    width: 12, height: 12,
                    background: "white",
                    borderLeft: "1px solid #eef0f7",
                    borderTop: "1px solid #eef0f7",
                    transform: "rotate(45deg)",
                  }}
                />

                <HelpItem
                  icon={
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                    </svg>
                  }
                  iconBg="#fffbeb"
                  iconColor="#d97706"
                  label="What's new"
                  sub="Latest features & updates"
                  href="/features"
                />
                <HelpItem
                  icon={
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                    </svg>
                  }
                  iconBg="#eff6ff"
                  iconColor="#3b82f6"
                  label="Contact support"
                  sub="We usually reply in a few hours"
                  href="mailto:support@linkhub.io"
                />
              </div>
            )}
          </div>
        </div>
      </div>
  );

  return (
    <>
      {sticky ? (
        <div
          className="sticky top-0 z-40 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 -mt-[22px] pt-[22px] pb-3 mb-7 bg-[#f7f8fc]"
        >
          {toolbar}
        </div>
      ) : (
        <div style={{ marginBottom: 28 }}>{toolbar}</div>
      )}
    </>
  );
}

function IconBtn({
  children,
  "aria-label": label,
  active,
  onClick,
}: {
  children: React.ReactNode;
  "aria-label"?: string;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="relative shrink-0 flex items-center justify-center transition-all active:scale-90"
      style={{
        width: 38,
        height: 38,
        borderRadius: 12,
        border: `1px solid ${active ? "#d6dae9" : "#eef0f7"}`,
        background: active ? "#f4f6fc" : "white",
        color: active ? "#0b1020" : "#6b75a3",
        cursor: "pointer",
      }}
      onMouseEnter={e => { if (!active) (e.currentTarget as HTMLButtonElement).style.borderColor = "#d6dae9"; }}
      onMouseLeave={e => { if (!active) (e.currentTarget as HTMLButtonElement).style.borderColor = "#eef0f7"; }}
    >
      {children}
    </button>
  );
}

function HelpItem({
  icon,
  iconBg,
  iconColor,
  label,
  sub,
  href,
}: {
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  label: string;
  sub: string;
  href: string;
}) {
  return (
    <a
      href={href}
      target={href.startsWith("mailto") ? undefined : "_blank"}
      rel="noopener noreferrer"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 11,
        padding: "10px 14px",
        textDecoration: "none",
        transition: "background 0.12s ease",
      }}
      onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = "#f7f8fc"; }}
      onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = "transparent"; }}
    >
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 9,
          background: iconBg,
          color: iconColor,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {icon}
      </div>
      <div>
        <div style={{ fontSize: 13, fontWeight: 500, color: "#0b1020", lineHeight: 1.3 }}>
          {label}
        </div>
        <div style={{ fontSize: 11.5, color: "#6b75a3", marginTop: 1 }}>{sub}</div>
      </div>
    </a>
  );
}

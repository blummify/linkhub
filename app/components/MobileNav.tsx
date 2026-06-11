"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  LinksIcon,
  AnalyticsIcon,
  AppearanceIcon,
  BillingIcon,
  MyAccountIcon,
  HelpIcon,
  LogoutIcon,
} from "./icons/SidebarIcons";
import { LinkhubLogo } from "./icons/LinkhubLogo";

const TABS = [
  {
    label: "Links",
    href: "/user-dashboard",
    Icon: LinksIcon,
    isActive: (p: string) => p === "/user-dashboard" || p === "/user-admin",
  },
  {
    label: "Analytics",
    href: "/user-analytics",
    Icon: AnalyticsIcon,
    isActive: (p: string) => p === "/user-analytics",
  },
  {
    label: "Branding",
    href: "/branding",
    Icon: AppearanceIcon,
    isActive: (p: string) => p.startsWith("/branding"),
  },
  {
    label: "Billing",
    href: "/billing",
    Icon: BillingIcon,
    isActive: (p: string) => p === "/billing",
  },
  {
    label: "Account",
    href: "/my-account",
    Icon: MyAccountIcon,
    isActive: (p: string) => p === "/my-account",
  },
];

export function MobileTopBar({ extra }: { extra?: React.ReactNode }) {
  const { data: session } = useSession();
  const [profileOpen, setProfileOpen] = useState(false);

  const user = session?.user;
  const initial = (user?.name?.trim() || user?.email || "?").charAt(0).toUpperCase();
  const displayName = user?.name?.trim() || user?.email?.split("@")[0] || "Account";
  const isEmailVerified = !!user?.emailVerified;

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-[80] h-14 flex items-center justify-between px-4 bg-white border-b border-[#eef0f7] lg:hidden">
        <Link href="/user-dashboard" style={{ textDecoration: "none" }}>
          <LinkhubLogo size="sm" />
        </Link>

        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          {extra}
          <button
            type="button"
            className="relative flex items-center justify-center"
            aria-label="Notifications"
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#6b75a3"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" />
            </svg>
            <span
              className="absolute"
              style={{
                top: 0,
                right: 0,
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: "#e11d48",
                border: "2px solid white",
              }}
            />
          </button>

          <button
            type="button"
            onClick={() => setProfileOpen(true)}
            aria-label="Profile"
            style={{
              width: 30,
              height: 30,
              borderRadius: "50%",
              background: "#f1f3ff",
              color: "#1e2a8a",
              fontSize: 12,
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              border: "none",
              cursor: "pointer",
            }}
          >
            {initial}
          </button>
        </div>
      </header>

      {/* Backdrop */}
      {profileOpen && (
        <div
          className="fixed inset-0 z-[88] bg-black/30 backdrop-blur-sm lg:hidden"
          onClick={() => setProfileOpen(false)}
        />
      )}

      {/* Profile bottom sheet */}
      <div
        className="fixed left-0 right-0 z-[89] bg-white lg:hidden"
        style={{
          bottom: 0,
          borderRadius: "24px 24px 0 0",
          boxShadow: "0 -8px 40px rgba(0,0,0,0.12)",
          paddingBottom: "calc(24px + env(safe-area-inset-bottom, 0px))",
          transform: profileOpen ? "translateY(0)" : "translateY(100%)",
          transition: "transform 0.3s cubic-bezier(0.32, 0.72, 0, 1)",
        }}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div style={{ width: 36, height: 4, borderRadius: 99, background: "#d6dae9" }} />
        </div>

        {/* User info */}
        <div
          className="flex items-center gap-3 px-5 py-4"
          style={{ borderBottom: "1px solid #eef0f7" }}
        >
          <div
            style={{
              width: 46,
              height: 46,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #3b46e0, #7a85ff)",
              color: "white",
              fontSize: 18,
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            {initial}
          </div>
          <div className="min-w-0">
            <p style={{ fontSize: 15, fontWeight: 600, color: "#0b1020", marginBottom: 1 }} className="truncate">
              {displayName}
            </p>
            <p style={{ fontSize: 12.5, color: "#6b75a3" }} className="truncate">
              {user?.email ?? ""}
            </p>
            {isEmailVerified ? (
              <span style={{ fontSize: 11, fontWeight: 600, color: "#059669", display: "flex", alignItems: "center", gap: 3, marginTop: 2 }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6L9 17l-5-5"/>
                </svg>
                Email verified
              </span>
            ) : (
              <span style={{ fontSize: 11, fontWeight: 600, color: "#d97706", display: "flex", alignItems: "center", gap: 3, marginTop: 2 }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
                  <line x1="12" y1="9" x2="12" y2="13"/>
                  <line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
                Email not verified
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <nav className="px-3 pt-2">
          <Link
            href="/my-account"
            onClick={() => setProfileOpen(false)}
            className="flex items-center gap-3 px-3 py-3 rounded-xl"
            style={{ color: "#3a4474", fontSize: 14, fontWeight: 500, textDecoration: "none" }}
          >
            <MyAccountIcon className="w-[18px] h-[18px] shrink-0" />
            My Account
          </Link>

          <Link
            href="/help"
            onClick={() => setProfileOpen(false)}
            className="flex items-center gap-3 px-3 py-3 rounded-xl"
            style={{ color: "#3a4474", fontSize: 14, fontWeight: 500, textDecoration: "none" }}
          >
            <HelpIcon className="w-[18px] h-[18px] shrink-0" />
            Help
          </Link>

          <div style={{ height: 1, background: "#eef0f7", margin: "4px 12px" }} />

          <button
            type="button"
            onClick={() => {
              localStorage.removeItem("linkhub-branding-v2");
              localStorage.removeItem("linkhub-branding-v1");
              void signOut({ callbackUrl: "/login" });
            }}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-xl"
            style={{ color: "#e11d48", fontSize: 14, fontWeight: 500, background: "transparent", border: "none", cursor: "pointer", textAlign: "left" }}
          >
            <LogoutIcon className="w-[18px] h-[18px] shrink-0" />
            Log out
          </button>
        </nav>
      </div>
    </>
  );
}

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-[80] grid grid-cols-5 bg-white border-t border-[#eef0f7] lg:hidden"
      style={{
        paddingTop: 8,
        paddingBottom: "calc(8px + env(safe-area-inset-bottom, 0px))",
      }}
    >
      {TABS.map(({ label, href, Icon, isActive }) => {
        const active = isActive(pathname);
        return (
          <Link
            key={href}
            href={href}
            className="flex flex-col items-center justify-center gap-[3px] min-h-[44px]"
            style={{
              color: active ? "#3b46e0" : "#6b75a3",
              fontSize: 11,
              fontWeight: 500,
              textDecoration: "none",
              transition: "color var(--motion-fast) var(--ease-standard)",
            }}
          >
            <Icon className="w-[22px] h-[22px]" />
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

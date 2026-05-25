"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image"
import { signOut, useSession } from "next-auth/react";
import { useSidebarStore } from "@/store/sidebarStore";
import { useLinksStore } from "@/store/linksStore";
import {
  LinksIcon,
  AppearanceIcon,
  AnalyticsIcon,
  ChevronDownIcon,
  HelpIcon,
  LogoutIcon,
} from "./icons/SidebarIcons";
import UpgradeCard from "./UpgradeCard";

const NAV_ITEMS = [
  { label: "Links",     href: "/user-dashboard", Icon: LinksIcon,      showBadge: true },
  { label: "Branding",  href: "/branding",       Icon: AppearanceIcon              },
  { label: "Analytics", href: "/user-analytics", Icon: AnalyticsIcon               },
];

export default function CollapsibleSidebar({
  children,
}: {
  children: React.ReactNode;
  isAdmin?: boolean;
}) {
  const isCollapsed = useSidebarStore((s) => s.isCollapsed);
  const toggleSidebar = useSidebarStore((s) => s.toggle);
  const linkCount = useLinksStore((s) => s.links.length);
  const pathname = usePathname();
  const { data: session, status, update } = useSession();
  const user = session?.user;

  // Ensure the session is always fresh when the dashboard first mounts.
  // Covers every sign-in path (credentials redirect, verify-email, OAuth).
  useEffect(() => { void update(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const displayName =
    user?.name?.trim() ||
    user?.email?.split("@")[0] ||
    (status === "loading" ? "…" : "Account");
  const displayEmail = user?.email ?? "";

  const isActiveLink = (href: string) => {
    if (href === "/user-dashboard") {
      return pathname === "/user-dashboard" || pathname === "/user-admin";
    }
    return pathname === href;
  };

  return (
    <>
      {/* Mobile overlay */}
      {!isCollapsed && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        id="sidebar"
        className={`h-screen bg-white border-r z-50 transition-all duration-300 ease-in-out fixed left-0 top-0 flex flex-col overflow-hidden ${
          isCollapsed
            ? "w-[76px] px-[10px] py-6 -translate-x-full lg:translate-x-0"
            : "w-[264px] px-[18px] py-7 translate-x-0"
        }`}
        style={{ borderColor: "#eef0f7" }}
      >
        {/* Brand */}

      <div className={`flex items-center justify-center ${isCollapsed ? 'mb-6 pt-1' : 'mb-8 pt-2'}`} >
        <Link href="/user-dashboard">
          <Image
            src="/link_hub_logo.png"
            alt="LinkHub Logo"
            width={128}
            height={128}
            className={`object-contain transition-all duration-300 cursor-pointer hover:opacity-80 ${
              isCollapsed ? "h-8 w-8" : "h-auto w-32"
            }`}
          />
        </Link>
      </div>

        {/* WORKSPACE label */}
        {!isCollapsed && (
          <p
            className="px-3 mb-2.5"
            style={{
              fontSize: 10.5,
              fontWeight: 600,
              color: "#6b75a3",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
            }}
          >
            Workspace
          </p>
        )}

        {/* Nav */}
        <nav className="flex flex-col gap-0.5 flex-1">
          {NAV_ITEMS.map(({ label, href, Icon, showBadge }) => {
            const active = isActiveLink(href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center relative transition-all duration-150 ${
                  isCollapsed ? "justify-center px-2.5 py-2.5" : "gap-3 px-3 py-2.5"
                }`}
                style={{
                  borderRadius: 12,
                  background: active
                    ? "linear-gradient(180deg, #f1f3ff, #eaeefb)"
                    : "transparent",
                  color: active ? "#1e2a8a" : "#3a4474",
                  fontWeight: active ? 600 : 500,
                  fontSize: 14,
                  boxShadow: active
                    ? "inset 0 0 0 1px rgba(59,70,224,0.08)"
                    : "none",
                  textDecoration: "none",
                }}
                onMouseEnter={e => {
                  if (!active)
                    (e.currentTarget as HTMLAnchorElement).style.background = "#eef0f7";
                }}
                onMouseLeave={e => {
                  if (!active)
                    (e.currentTarget as HTMLAnchorElement).style.background = "transparent";
                }}
              >
                {/* Active left bar */}
                {active && (
                  <span
                    className="absolute rounded-r-[3px]"
                    style={{
                      left: isCollapsed ? -10 : -18,
                      top: "50%",
                      transform: "translateY(-50%)",
                      width: 3,
                      height: 22,
                      background: "#3b46e0",
                    }}
                  />
                )}

                <Icon className="w-[18px] h-[18px] shrink-0" />

                {!isCollapsed && (
                  <>
                    <span>{label}</span>
                    {showBadge && (
                      <span
                        className="ml-auto"
                        style={{
                          fontSize: 10,
                          fontWeight: 600,
                          padding: "2px 7px",
                          background: "#3b46e0",
                          color: "white",
                          borderRadius: 99,
                        }}
                      >
                        {linkCount}
                      </span>
                    )}
                  </>
                )}

                {/* Collapsed badge */}
                {isCollapsed && showBadge && linkCount > 0 && (
                  <span
                    className="absolute"
                    style={{
                      top: 4,
                      right: 4,
                      fontSize: 9,
                      fontWeight: 600,
                      padding: "1px 5px",
                      background: "#3b46e0",
                      color: "white",
                      borderRadius: 99,
                    }}
                  >
                    {linkCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Upgrade card */}
        <UpgradeCard isCollapsed={isCollapsed} />

        {/* User chip */}
        <div
          className={`flex items-center transition-all cursor-pointer ${
            isCollapsed ? "justify-center p-1.5" : "gap-[11px] p-2.5"
          }`}
          style={{
            borderRadius: 12,
            border: "1px solid #eef0f7",
            background: "white",
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLDivElement).style.borderColor = "#d6dae9";
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLDivElement).style.borderColor = "#eef0f7";
          }}
        >
          <div
            className="flex items-center justify-center text-white font-semibold shrink-0"
            style={{
              width: 34,
              height: 34,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #3b46e0, #7a85ff)",
              fontSize: 13,
            }}
          >
            {displayName.charAt(0).toUpperCase()}
          </div>

          {!isCollapsed && (
            <>
              <div className="flex-1 min-w-0">
                <p
                  className="truncate"
                  style={{ fontSize: 13, fontWeight: 600, color: "#0b1020" }}
                >
                  {displayName}
                </p>
                <p
                  className="truncate"
                  style={{ fontSize: 11.5, color: "#6b75a3" }}
                >
                  {displayEmail || " "}
                </p>
              </div>
              <ChevronDownIcon className="w-3.5 h-3.5 shrink-0 text-[#6b75a3]" />
            </>
          )}
        </div>

        {/* Bottom links: Help + Logout */}
        <div className={`flex gap-2 mt-2.5 ${isCollapsed ? "flex-col" : ""}`}>
          <Link
            href="/help"
            className={`flex-1 flex items-center transition-all ${
              isCollapsed ? "justify-center p-2" : "gap-2 p-2.5"
            }`}
            style={{
              borderRadius: 12,
              color: "#3a4474",
              fontSize: 12.5,
              textDecoration: "none",
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLAnchorElement).style.background = "#eef0f7";
              (e.currentTarget as HTMLAnchorElement).style.color = "#0b1020";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLAnchorElement).style.background = "transparent";
              (e.currentTarget as HTMLAnchorElement).style.color = "#3a4474";
            }}
          >
            <HelpIcon className="w-3.5 h-3.5 shrink-0" />
            {!isCollapsed && <span>Help</span>}
          </Link>

          <button
            type="button"
            onClick={() => {
              localStorage.removeItem("linkhub-branding-v2");
              localStorage.removeItem("linkhub-branding-v1");
              void signOut({ callbackUrl: "/login" });
            }}
            className={`flex-1 flex items-center transition-all cursor-pointer ${
              isCollapsed ? "justify-center p-2" : "gap-2 p-2.5"
            }`}
            style={{
              borderRadius: 12,
              color: "#3a4474",
              fontSize: 12.5,
              border: 0,
              background: "transparent",
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.background = "#eef0f7";
              (e.currentTarget as HTMLButtonElement).style.color = "#0b1020";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.background = "transparent";
              (e.currentTarget as HTMLButtonElement).style.color = "#3a4474";
            }}
          >
            <LogoutIcon className="w-3.5 h-3.5 shrink-0" />
            {!isCollapsed && <span>Log out</span>}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 h-screen overflow-hidden relative flex flex-col">
        {children}
      </div>
    </>
  );
}

"use client";

import { useEffect } from "react";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { LinkhubLogo } from "./icons/LinkhubLogo";
import { signOut, useSession } from "next-auth/react";
import { useSidebarStore } from "@/store/sidebarStore";
import { useLinksStore } from "@/store/linksStore";
import { usePrefersReducedMotion } from "./hooks/usePrefersReducedMotion";
import {
  LinksIcon,
  AppearanceIcon,
  AnalyticsIcon,
  ChevronDownIcon,
  HelpIcon,
  LogoutIcon,
  MyAccountIcon,
  BillingIcon,
} from "./icons/SidebarIcons";
import UpgradeCard from "./UpgradeCard";
import { MobileTopBar, MobileBottomNav } from "./MobileNav";

const NAV_ITEMS = [
  { label: "Links",     href: "/user-dashboard", Icon: LinksIcon,      showBadge: true },
  { label: "Branding",  href: "/branding",       Icon: AppearanceIcon              },
  { label: "Analytics", href: "/user-analytics", Icon: AnalyticsIcon               },
];

const ACCOUNT_ITEMS = [
  { label: "My account", href: "/my-account", Icon: MyAccountIcon },
  { label: "Billing",    href: "/billing",    Icon: BillingIcon   },
];

export default function CollapsibleSidebar({
  children,
  mobileHeaderExtra,
}: {
  children: React.ReactNode;
  isAdmin?: boolean;
  mobileHeaderExtra?: React.ReactNode;
}) {
  const isCollapsed = useSidebarStore((s) => s.isCollapsed);
  const reduced = usePrefersReducedMotion();

  const linkCount = useLinksStore((s) => s.links.length);
  const pathname = usePathname();
  const { data: session, status, update } = useSession();
  const user = session?.user;

  useEffect(() => {
    void update();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
      <MobileTopBar extra={mobileHeaderExtra} />

      <aside
        id="sidebar"
        className={`h-screen bg-white border-r z-50 fixed left-0 top-0 hidden lg:flex flex-col overflow-hidden ${
          isCollapsed
            ? "w-[76px] px-[10px] py-6"
            : "w-[264px] px-[18px] py-7"
        }`}
        style={{ borderColor: "#eef0f7", willChange: "width", transition: reduced ? "none" : "width var(--motion-base) var(--ease-standard)" }}
      >

      <div className={`flex items-center justify-center ${isCollapsed ? 'mb-6 pt-1' : 'mb-8 pt-2'}`}>
        <Link href="/user-dashboard" className="hover:opacity-80 transition-opacity">
          {isCollapsed ? (
            <LinkhubLogo markOnly size="md" />
          ) : (
            <LinkhubLogo size="md" />
          )}
        </Link>
      </div>

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

        <nav className="flex flex-col gap-0.5">
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

        <div className="mt-5">
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
              Account
            </p>
          )}
          <nav className="flex flex-col gap-0.5">
            {ACCOUNT_ITEMS.map(({ label, href, Icon }) => {
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
                  {!isCollapsed && <span>{label}</span>}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex-1" />

        <UpgradeCard isCollapsed={isCollapsed} />

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

      <div className="flex-1 h-screen overflow-hidden relative flex flex-col pt-14 lg:pt-0">
        {children}
      </div>

      <MobileBottomNav />
    </>
  );
}

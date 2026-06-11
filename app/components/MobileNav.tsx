"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LinksIcon,
  AnalyticsIcon,
  AppearanceIcon,
  BillingIcon,
  MyAccountIcon,
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
  return (
    <header className="fixed top-0 left-0 right-0 z-[80] h-14 flex items-center justify-between px-4 bg-white border-b border-[#eef0f7] lg:hidden">
      <Link href="/user-dashboard" style={{ textDecoration: "none" }}>
        <LinkhubLogo size="sm" />
      </Link>

      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
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
      </div>
    </header>
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

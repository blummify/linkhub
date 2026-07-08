import type { IconName } from "../icons";

export interface NavItem {
  label: string;
  /** Public admin-subdomain path (middleware rewrites it into /admin-portal/*). */
  href: string;
  icon: IconName;
  /** Optional count shown as a pill (e.g. open moderation reports). */
  badge?: number;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

export const NAV_GROUPS: NavGroup[] = [
  {
    label: "Platform",
    items: [
      { label: "Overview", href: "/dashboard", icon: "overview" },
      { label: "Users", href: "/users", icon: "users" },
      { label: "Pages", href: "/pages", icon: "pages" },
      { label: "Moderation", href: "/moderation", icon: "moderation", badge: 7 },
    ],
  },
  {
    label: "Business",
    items: [
      { label: "Revenue", href: "/revenue", icon: "revenue" },
      { label: "Plans", href: "/plans", icon: "plans" },
    ],
  },
  {
    label: "System",
    items: [
      { label: "Team & roles", href: "/team", icon: "team" },
      { label: "Audit log", href: "/audit", icon: "audit" },
      { label: "Settings", href: "/settings", icon: "settings" },
    ],
  },
];

/** True when `pathname` is within the nav item's route. */
export function isNavItemActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

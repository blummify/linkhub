/**
 * Inline line-icon set for the admin surface, matching the linkhub-admin
 * prototype's stroke style. A single typed `Icon` keeps callers terse and the
 * paths in one place. Icons are decorative — label the interactive element.
 */

import type { ReactNode } from "react";

export type IconName =
  | "overview"
  | "users"
  | "pages"
  | "moderation"
  | "revenue"
  | "plans"
  | "team"
  | "audit"
  | "settings"
  | "search"
  | "bell"
  | "menu"
  | "chevronDown"
  | "trendUp"
  | "trendDown"
  | "alert"
  | "close"
  | "exit"
  | "impersonate"
  | "export";

const PATHS: Record<IconName, ReactNode> = {
  overview: (
    <>
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
    </>
  ),
  users: (
    <>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 21v-2a4 4 0 00-4-4H7a4 4 0 00-4 4v2" />
      <circle cx="10" cy="7" r="4" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21v-2a4 4 0 00-3-3.87" />
    </>
  ),
  pages: (
    <>
      <path strokeLinecap="round" strokeLinejoin="round" d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M14 2v6h6" />
    </>
  ),
  moderation: (
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  ),
  revenue: (
    <>
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <line x1="2" y1="10" x2="22" y2="10" />
    </>
  ),
  plans: (
    <>
      <polygon points="12 2 2 7 12 12 22 7 12 2" />
      <polyline points="2 17 12 22 22 17" />
      <polyline points="2 12 12 17 22 12" />
    </>
  ),
  team: (
    <>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 21v-2a4 4 0 00-4-4H7a4 4 0 00-4 4v2" />
      <circle cx="10" cy="7" r="4" />
    </>
  ),
  audit: (
    <>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v5h5" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.05 13A9 9 0 106 5.3L3 8" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 7v5l3 2" />
    </>
  ),
  settings: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-2.81 1.17V21a2 2 0 11-4 0v-.09A1.65 1.65 0 007 19.4l-.06.06a2 2 0 11-2.83-2.83l.06-.06A1.65 1.65 0 004.6 15H4.5a2 2 0 110-4h.09A1.65 1.65 0 006 8.6l-.06-.06a2 2 0 112.83-2.83l.06.06A1.65 1.65 0 0011 4.6V4.5a2 2 0 014 0v.09a1.65 1.65 0 002.81 1.17l.06-.06a2 2 0 112.83 2.83l-.06.06A1.65 1.65 0 0019.4 11" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="8" />
      <path strokeLinecap="round" d="M21 21l-4.3-4.3" />
    </>
  ),
  bell: (
    <path strokeLinecap="round" strokeLinejoin="round" d="M18 8a6 6 0 00-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 01-3.4 0" />
  ),
  menu: <path strokeLinecap="round" d="M3 6h18M3 12h18M3 18h18" />,
  chevronDown: <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />,
  trendUp: <path strokeLinecap="round" strokeLinejoin="round" d="M7 17l5-5 4 4 6-7" />,
  trendDown: <path strokeLinecap="round" strokeLinejoin="round" d="M7 7l5 5 4-4 6 7" />,
  alert: (
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4M12 17h.01M10.3 3.9l-8 14A2 2 0 004 21h16a2 2 0 001.7-3l-8-14a2 2 0 00-3.4 0z" />
  ),
  close: <path strokeLinecap="round" d="M18 6L6 18M6 6l12 12" />,
  exit: (
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
  ),
  impersonate: (
    <>
      <path strokeLinecap="round" strokeLinejoin="round" d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  export: (
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
  ),
};

export interface IconProps {
  name: IconName;
  className?: string;
}

export function Icon({ name, className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      {PATHS[name]}
    </svg>
  );
}

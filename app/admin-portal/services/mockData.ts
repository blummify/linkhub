/**
 * In-memory fixtures backing the mock {@link AdminService}. Kept separate from
 * the service so it can be imported directly in tests and swapped out when a
 * real backend lands. Content mirrors the linkhub-admin prototype.
 */

import type {
  AdminPageDetail,
  PlanAdminSnapshot,
  OverviewMetrics,
  PlatformSettings,
  Report,
  TeamMember,
  PageReportHistoryItem,
  PageOwner,
  PublishedPageLink,

} from "./types";

export const MOCK_SETTINGS: PlatformSettings = {
  general: { defaultCurrency: "EUR", supportEmail: "support@linkhub.app" },
  safety: { autoFlagSuspiciousLinks: true, autoSuspendAfterReports: 3 },
  reservedHandles: ["admin", "api", "login", "dashboard", "settings", "support"],
  system: { maintenanceMode: false },
};

export const MOCK_OVERVIEW: OverviewMetrics = {
  kpis: [
    {
      id: "total-users",
      label: "Total users",
      value: "48,210",
      delta: { direction: "up", text: "+4.2%" },
      sparkline: [20, 17, 18, 12, 13, 8, 6, 3],
    },
    {
      id: "active-30d",
      label: "Active (30d)",
      value: "19,540",
      delta: { direction: "up", text: "+2.1%" },
      sparkline: [16, 18, 13, 14, 10, 12, 7, 6],
    },
    {
      id: "mrr",
      label: "MRR",
      value: "€38,420",
      delta: { direction: "up", text: "+6.8%" },
      sparkline: [21, 19, 16, 15, 11, 9, 7, 2],
    },
    {
      id: "pro-conversion",
      label: "Pro conversion",
      value: "7.4%",
      delta: { direction: "up", text: "+0.3%" },
    },
    {
      id: "pages-live",
      label: "Pages live",
      value: "41,032",
      delta: { direction: "flat", text: "stable" },
    },
    {
      id: "open-reports",
      label: "Open reports",
      value: "7",
      delta: { direction: "flat", text: "needs review", tone: "warning" },
    },
  ],
  signupsRevenueSeries: {
    signups: [170, 160, 165, 140, 148, 120, 128, 92, 80],
    revenue: [185, 180, 178, 168, 170, 150, 152, 130, 118],
  },
  distribution: [
    { label: "Free", pct: 71, tone: "neutral" },
    { label: "Pro", pct: 26, tone: "primary" },
    { label: "Business", pct: 3, tone: "purple" },
  ],
  systemStatus: [
    { name: "API", status: "operational" },
    { name: "CDN", status: "operational" },
    { name: "Payments", status: "operational" },
    { name: "Background jobs", status: "degraded" },
  ],
  recentSignups: [
    { id: "su_1", name: "Kofi Twum", handle: "@kofitwum", plan: "free", when: "2m ago" },
    { id: "su_2", name: "Sara Addo", handle: "@saraa", plan: "pro", when: "18m ago" },
    { id: "su_3", name: "Mensah J.", handle: "@mensahj", plan: "free", when: "41m ago" },
    { id: "su_4", name: "Lara Owusu", handle: "@laraowusu", plan: "pro", when: "1h ago" },
  ],
  moderationQueue: [
    { id: "mq_1", handle: "@quick-cash-now", reason: "phishing", reports: 3, severity: "high" },
    { id: "mq_2", handle: "@free-giftcards", reason: "spam", reports: 1, severity: "medium" },
    { id: "mq_3", handle: "@cryptodoubler", reason: "scam", reports: 2, severity: "medium" },
  ],
};

export const MOCK_PLAN_SNAPSHOT: PlanAdminSnapshot = {
  plans: [
    {
      plan: "free",
      tier: "Starter",
      name: "Free",
      price: "Free",
      limits: {
        links: "5 links",
        views: "1,000 views/mo",
        customDomains: "No custom domain",
        storage: "1 GB storage",
      },
      features: ["linkhub badge shown"],
      editor: {
        price: "0.00",
        interval: "Monthly",
        linkLimit: "5",
        monthlyViews: "1000",
        customDomains: "0",
        storage: "1",
        featureToggles: {
          linkhubBadge: true,
        },
      },
    },
    {
      plan: "pro",
      tier: "Creator",
      name: "Pro",
      price: "€9/mo",
      limits: {
        links: "Unlimited links",
        views: "50,000 views/mo",
        customDomains: "3 custom domains",
        storage: "10 GB storage",
      },
      features: ["Remove badge", "Custom themes"],
      highlighted: true,
      editor: {
        price: "9.00",
        interval: "Monthly",
        linkLimit: "Unlimited",
        monthlyViews: "50000",
        customDomains: "3",
        storage: "10",
        featureToggles: {
          removeBadge: true,
          customThemeEditor: true,
        },
      },
    },
    {
      plan: "business",
      tier: "Scale",
      name: "Business",
      price: "€29/mo",
      limits: {
        links: "Unlimited links",
        views: "250,000 views/mo",
        customDomains: "10 custom domains",
        storage: "100 GB storage",
      },
      features: ["Team seats", "Priority support"],
      editor: {
        price: "29.00",
        interval: "Monthly",
        linkLimit: "Unlimited",
        monthlyViews: "250000",
        customDomains: "10",
        storage: "100",
        featureToggles: {
          teamSeats: true,
          prioritySupport: true,
        },
      },
    },
  ],
  flags: [
    {
      id: "custom-theme-editor",
      label: "Custom theme editor",
      description: "Pro & Business only",
      enabled: true,
      scope: "plan",
    },
    {
      id: "ai-bio-suggestions",
      label: "AI bio suggestions (beta)",
      description: "Rolling out to 20% of Pro users",
      enabled: false,
      scope: "rollout",
    },
    {
      id: "scheduled-links",
      label: "Scheduled links",
      description: "Business only",
      enabled: true,
      scope: "plan",
    },
  ],
  versions: [
    {
      id: "plan-ver-1",
      plan: "all",
      version: "v1",
      summary: "Loaded from the reference plan set.",
      changedBy: "Ama Mensah",
      changedAt: "Today",
      fields: ["price", "limits", "features", "feature flags"],
    },
  ],
  auditLog: [
    {
      id: "plan-audit-1",
      action: "Baseline loaded",
      plan: "all",
      actor: "Ama Mensah",
      details: "Seeded the plans view with the current reference values.",
      timestamp: "Today",
    },
  ],
};


function makeLink(id: string, title: string, url: string, clicks: number): PublishedPageLink {
  return { id, title, url, clicks };
}

function makeReport(
  id: string,
  reporter: string,
  reason: PageReportHistoryItem["reason"],
  status: PageReportHistoryItem["status"],
  reportedAt: string
): PageReportHistoryItem {
  return { id, reporter, reason, status, reportedAt };
}

function makeOwner(id: string, name: string, handle: string): PageOwner {
  return { id, name, handle };
}

export const MOCK_PAGES: AdminPageDetail[] = [
  {
    id: "page_joelosei",
    handle: "@joelosei",
    owner: makeOwner("usr_joelosei", "Joel Osei Acquah", "@joelosei"),
    url: "https://linkhub.app/joelosei",
    status: "live",
    links: 15,
    views30d: 8420,
    reports: 0,
    createdAt: "2026-05-24",
    theme: "Midnight",
    publishedLinks: [
      makeLink("pl_joel_1", "Official website", "https://joelosei.me", 412),
      makeLink("pl_joel_2", "Latest portfolio drop", "https://behance.net/joelosei", 289),
      makeLink("pl_joel_3", "YouTube channel", "https://youtube.com/@joelosei", 689),
    ],
    reportHistory: [],
  },
  {
    id: "page_saraa",
    handle: "@saraa",
    owner: makeOwner("usr_saraa", "Sara Addo", "@saraa"),
    url: "https://linkhub.app/saraa",
    status: "live",
    links: 22,
    views30d: 12910,
    reports: 0,
    createdAt: "2026-05-18",
    theme: "Sunrise",
    publishedLinks: [
      makeLink("pl_sara_1", "Brand studio", "https://saraaddo.com", 930),
      makeLink("pl_sara_2", "Instagram", "https://instagram.com/saraa", 1550),
      makeLink("pl_sara_3", "Newsletter", "https://substack.com/@saraa", 410),
    ],
    reportHistory: [],
  },
  {
    id: "page_quickcash",
    handle: "@quick-cash-now",
    owner: makeOwner("usr_quickcash", "quick-cash-now", "@quick-cash-now"),
    url: "https://linkhub.app/quick-cash-now",
    status: "flagged",
    links: 9,
    views30d: 0,
    reports: 3,
    createdAt: "2026-06-19",
    theme: "Alert",
    publishedLinks: [
      makeLink("pl_quick_1", "Bank login", "https://quick-cash-now.com/login", 2),
      makeLink("pl_quick_2", "Bonus claim", "https://quick-cash-now.com/bonus", 1),
      makeLink("pl_quick_3", "Support chat", "https://quick-cash-now.com/chat", 0),
    ],
    reportHistory: [
      makeReport("pr_quick_1", "@nadiaowusu", "phishing", "open", "2026-06-19"),
      makeReport("pr_quick_2", "@saraa", "scam", "reviewing", "2026-06-20"),
      makeReport("pr_quick_3", "@kofitwum", "phishing", "resolved", "2026-06-21"),
    ],
  },
  {
    id: "page_nadiaowusu",
    handle: "@nadiaowusu",
    owner: makeOwner("usr_nadiaowusu", "Nadia Owusu", "@nadiaowusu"),
    url: "https://linkhub.app/nadiaowusu",
    status: "live",
    links: 38,
    views30d: 41200,
    reports: 0,
    createdAt: "2026-03-02",
    theme: "Editorial",
    publishedLinks: [
      makeLink("pl_nadia_1", "Studio site", "https://nadiaowusu.com", 2100),
      makeLink("pl_nadia_2", "Portfolio", "https://behance.net/nadiaowusu", 1200),
      makeLink("pl_nadia_3", "Calendly", "https://cal.com/nadia", 830),
    ],
    reportHistory: [],
  },
  {
    id: "page_cryptodoubler",
    handle: "@cryptodoubler",
    owner: makeOwner("usr_cryptodoubler", "cryptodoubler", "@cryptodoubler"),
    url: "https://linkhub.app/cryptodoubler",
    status: "flagged",
    links: 5,
    views30d: 120,
    reports: 2,
    createdAt: "2026-06-25",
    theme: "Hustle",
    publishedLinks: [
      makeLink("pl_crypto_1", "Investment pitch", "https://cryptodoubler.io", 12),
      makeLink("pl_crypto_2", "Telegram", "https://t.me/cryptodoubler", 4),
      makeLink("pl_crypto_3", "Testimonials", "https://cryptodoubler.io/reviews", 1),
    ],
    reportHistory: [
      makeReport("pr_crypto_1", "@saraa", "scam", "open", "2026-06-25"),
      makeReport("pr_crypto_2", "@joelosei", "scam", "resolved", "2026-06-26"),
    ],
  },
  {
    id: "page_laraowusu",
    handle: "@laraowusu",
    owner: makeOwner("usr_laraowusu", "Lara Owusu", "@laraowusu"),
    url: "https://linkhub.app/laraowusu",
    status: "live",
    links: 17,
    views30d: 9830,
    reports: 0,
    createdAt: "2026-04-15",
    theme: "Aurora",
    publishedLinks: [
      makeLink("pl_lara_1", "Shop", "https://laraowusu.com/shop", 540),
      makeLink("pl_lara_2", "TikTok", "https://tiktok.com/@laraowusu", 980),
      makeLink("pl_lara_3", "Contact", "https://laraowusu.com/contact", 210),
    ],
    reportHistory: [],
  },
  {
    id: "page_freegiftcards",
    handle: "@free-giftcards",
    owner: makeOwner("usr_freegiftcards", "free-giftcards", "@free-giftcards"),
    url: "https://linkhub.app/free-giftcards",
    status: "suspended",
    links: 6,
    views30d: 0,
    reports: 1,
    createdAt: "2026-06-15",
    theme: "Flash",
    publishedLinks: [
      makeLink("pl_free_1", "Claim offer", "https://free-giftcards.net", 3),
      makeLink("pl_free_2", "Survey", "https://free-giftcards.net/survey", 0),
      makeLink("pl_free_3", "Terms", "https://free-giftcards.net/terms", 0),
    ],
    reportHistory: [makeReport("pr_free_1", "@efiamensa", "spam", "resolved", "2026-06-15")],
  },
  {
    id: "page_akuasarpong",
    handle: "@akuasarpong",
    owner: makeOwner("usr_akuasarpong", "Akua Sarpong", "@akuasarpong"),
    url: "https://linkhub.app/akuasarpong",
    status: "live",
    links: 11,
    views30d: 5210,
    reports: 0,
    createdAt: "2026-02-11",
    theme: "Dusk",
    publishedLinks: [
      makeLink("pl_akua_1", "Book now", "https://akuasarpong.com/book", 640),
      makeLink("pl_akua_2", "Gallery", "https://akuasarpong.com/gallery", 290),
      makeLink("pl_akua_3", "CV", "https://akuasarpong.com/cv", 110),
    ],
    reportHistory: [],
  },
  {
    id: "page_kwameasare",
    handle: "@kwameasare",
    owner: makeOwner("usr_kwameasare", "Kwame Asare", "@kwameasare"),
    url: "https://linkhub.app/kwameasare",
    status: "live",
    links: 7,
    views30d: 3300,
    reports: 0,
    createdAt: "2026-01-30",
    theme: "Mono",
    publishedLinks: [
      makeLink("pl_kwame_1", "GitHub", "https://github.com/kwameasare", 520),
      makeLink("pl_kwame_2", "Blog", "https://kwameasare.dev", 210),
      makeLink("pl_kwame_3", "X profile", "https://x.com/kwameasare", 80),
    ],
    reportHistory: [],
  },
  {
    id: "page_fiifimensah",
    handle: "@fiifimensah",
    owner: makeOwner("usr_fiifimensah", "Fiifi Mensah", "@fiifimensah"),
    url: "https://linkhub.app/fiifimensah",
    status: "suspended",
    links: 0,
    views30d: 0,
    reports: 2,
    createdAt: "2026-05-30",
    theme: "Classic",
    publishedLinks: [],
    reportHistory: [
      makeReport("pr_fiifi_1", "@saraa", "spam", "open", "2026-05-31"),
      makeReport("pr_fiifi_2", "@yaaa", "spam", "resolved", "2026-06-01"),
    ],
  },
];

export const MOCK_REPORTS: Report[] = [
  {
    id: "rep_quickcash",
    handle: "@quick-cash-now",
    category: "phishing",
    severity: "high",
    reportCount: 3,
    description:
      "Links impersonate a bank login page to harvest credentials. Auto-flagged by link scanner + 3 user reports.",
    reporter: "@nadiaowusu",
    reportedAt: "4h ago",
    url: "linkhub.app/quick-cash-now",
    status: "open",
  },
  {
    id: "rep_cryptodoubler",
    handle: "@cryptodoubler",
    category: "scam",
    severity: "medium",
    reportCount: 2,
    description: "Promises to double crypto deposits. Likely advance-fee fraud.",
    reporter: "@kofitwum",
    reportedAt: "9h ago",
    url: "linkhub.app/cryptodoubler",
    status: "open",
  },
  {
    id: "rep_freegiftcards",
    handle: "@free-giftcards",
    category: "spam",
    severity: "medium",
    reportCount: 1,
    description: "Bulk affiliate spam across all links. Low engagement, high report rate.",
    reporter: "@saraa",
    reportedAt: "1d ago",
    url: "linkhub.app/free-giftcards",
    status: "open",
  },
];

export const MOCK_TEAM_MEMBERS: TeamMember[] = [
  {
    id: "adm_ama",
    name: "Ama Mensah",
    email: "ama@linkhub.app",
    role: "SUPER_ADMIN",
    status: "active",
    // "now" in the prototype — represent as a very recent timestamp so the
    // formatter still produces something sensible if wired to relative time.
    lastActiveAt: "2026-06-30",
  },
  {
    id: "adm_kojo",
    name: "Kojo Brent",
    email: "kojo@linkhub.app",
    role: "SUPPORT",
    status: "active",
    lastActiveAt: "2026-06-30",
  },
  {
    id: "adm_efua",
    name: "Efua Boat",
    email: "efua@linkhub.app",
    role: "FINANCE",
    status: "active",
    lastActiveAt: "2026-06-29",
  },
  {
    id: "adm_sam",
    name: "Sam Hale",
    email: "sam@linkhub.app",
    role: "MODERATOR",
    status: "active",
    lastActiveAt: "2026-06-30",
  },
  {
    id: "adm_nii",
    name: "Nii Ako",
    email: "nii@linkhub.app",
    role: "MODERATOR",
    status: "invited",
    lastActiveAt: null,
  },
];
/**
 * In-memory fixtures backing the mock {@link AdminService}. Kept separate from
 * the service so it can be imported directly in tests and swapped out when a
 * real backend lands. Content mirrors the linkhub-admin prototype.
 */

import type {
  AdminUserDetail,
  AuditActionType,
  AuditActor,
  AuditLogEntryDetail,
  OverviewMetrics,
  Report,
} from "./types";

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

const DEFAULT_USAGE: AdminUserDetail["usage"] = [
  { label: "Links", used: 15, limit: 25, display: "15 / 25" },
  { label: "Views", used: 8400, limit: 50000, display: "8.4k / 50k" },
  { label: "Storage", used: 410, limit: 1024, display: "410MB / 1GB" },
];

const DEFAULT_ACTIVITY: AdminUserDetail["recentActivity"] = [
  { id: "ac_1", title: "Added link · YouTube", meta: "2h ago" },
  { id: "ac_2", title: "Changed theme · Midnight", meta: "1d ago" },
  { id: "ac_3", title: "Upgraded to Pro", meta: "24 May 2026" },
];

/**
 * Users dataset (23 rows) — enough to exercise search, filter tabs, and a
 * multi-page pager. The first rows match the prototype table exactly.
 */
export const MOCK_USERS: AdminUserDetail[] = [
  {
    id: "usr_joelosei",
    name: "Joel Osei Acquah",
    email: "oseijoel6111@gmail.com",
    handle: "@joelosei",
    plan: "pro",
    status: "active",
    links: 15,
    views30d: 8420,
    country: "Ghana",
    joinedAt: "2026-05-24",
    lastActiveAt: "2026-06-30",
    usage: DEFAULT_USAGE,
    recentActivity: DEFAULT_ACTIVITY,
  },
  {
    id: "usr_saraa",
    name: "Sara Addo",
    email: "sara@addo.co",
    handle: "@saraa",
    plan: "pro",
    status: "active",
    links: 22,
    views30d: 12910,
    country: "Ghana",
    joinedAt: "2026-05-18",
    lastActiveAt: "2026-06-30",
    usage: DEFAULT_USAGE,
    recentActivity: DEFAULT_ACTIVITY,
  },
  {
    id: "usr_kofitwum",
    name: "Kofi Twum",
    email: "kofi@twum.dev",
    handle: "@kofitwum",
    plan: "free",
    status: "active",
    links: 4,
    views30d: 612,
    country: "Ghana",
    joinedAt: "2026-06-21",
    lastActiveAt: "2026-06-30",
    usage: DEFAULT_USAGE,
    recentActivity: DEFAULT_ACTIVITY,
  },
  {
    id: "usr_nadiaowusu",
    name: "Nadia Owusu",
    email: "nadia@studio.gh",
    handle: "@nadiaowusu",
    plan: "business",
    status: "active",
    links: 38,
    views30d: 41200,
    country: "Ghana",
    joinedAt: "2026-03-02",
    lastActiveAt: "2026-06-30",
    usage: DEFAULT_USAGE,
    recentActivity: DEFAULT_ACTIVITY,
  },
  {
    id: "usr_quickcash",
    name: "quick-cash-now",
    email: "hidden@account.com",
    handle: "@quick-cash-now",
    plan: "free",
    status: "suspended",
    links: 9,
    views30d: 0,
    country: "Unknown",
    joinedAt: "2026-06-19",
    lastActiveAt: null,
    usage: DEFAULT_USAGE,
    recentActivity: DEFAULT_ACTIVITY,
  },
  {
    id: "usr_mensahj",
    name: "Mensah Junior",
    email: "mensah@j.com",
    handle: "@mensahj",
    plan: "free",
    status: "active",
    links: 2,
    views30d: 148,
    country: "Ghana",
    joinedAt: "2026-06-21",
    lastActiveAt: "2026-06-30",
    usage: DEFAULT_USAGE,
    recentActivity: DEFAULT_ACTIVITY,
  },
  {
    id: "usr_laraowusu",
    name: "Lara Owusu",
    email: "lara@owusu.art",
    handle: "@laraowusu",
    plan: "pro",
    status: "active",
    links: 17,
    views30d: 9830,
    country: "Ghana",
    joinedAt: "2026-04-15",
    lastActiveAt: "2026-06-30",
    usage: DEFAULT_USAGE,
    recentActivity: DEFAULT_ACTIVITY,
  },
  {
    id: "usr_yawb",
    name: "Yaw Boateng",
    email: "yaw@boateng.io",
    handle: "@yawb",
    plan: "free",
    status: "pending",
    links: 1,
    views30d: 12,
    country: "Ghana",
    joinedAt: "2026-06-27",
    lastActiveAt: "2026-06-30",
    usage: DEFAULT_USAGE,
    recentActivity: DEFAULT_ACTIVITY,
  },
  {
    id: "usr_akuasarpong",
    name: "Akua Sarpong",
    email: "akua@sarpong.gh",
    handle: "@akuasarpong",
    plan: "pro",
    status: "active",
    links: 11,
    views30d: 5210,
    country: "Ghana",
    joinedAt: "2026-02-11",
    lastActiveAt: "2026-06-29",
    usage: DEFAULT_USAGE,
    recentActivity: DEFAULT_ACTIVITY,
  },
  {
    id: "usr_kwameasare",
    name: "Kwame Asare",
    email: "kwame@asare.io",
    handle: "@kwameasare",
    plan: "pro",
    status: "active",
    links: 7,
    views30d: 3300,
    country: "Ghana",
    joinedAt: "2026-01-30",
    lastActiveAt: "2026-06-28",
    usage: DEFAULT_USAGE,
    recentActivity: DEFAULT_ACTIVITY,
  },
  {
    id: "usr_efiamensa",
    name: "Efia Mensa",
    email: "efia@mensa.co",
    handle: "@efiamensa",
    plan: "free",
    status: "active",
    links: 3,
    views30d: 240,
    country: "Ghana",
    joinedAt: "2026-06-12",
    lastActiveAt: "2026-06-27",
    usage: DEFAULT_USAGE,
    recentActivity: DEFAULT_ACTIVITY,
  },
  {
    id: "usr_freegiftcards",
    name: "free-giftcards",
    email: "hidden2@account.com",
    handle: "@free-giftcards",
    plan: "free",
    status: "suspended",
    links: 14,
    views30d: 0,
    country: "Unknown",
    joinedAt: "2026-06-10",
    lastActiveAt: null,
    usage: DEFAULT_USAGE,
    recentActivity: DEFAULT_ACTIVITY,
  },
  {
    id: "usr_abenakuma",
    name: "Abena Kuma",
    email: "abena@kuma.art",
    handle: "@abenakuma",
    plan: "business",
    status: "active",
    links: 29,
    views30d: 22100,
    country: "Ghana",
    joinedAt: "2025-12-05",
    lastActiveAt: "2026-06-30",
    usage: DEFAULT_USAGE,
    recentActivity: DEFAULT_ACTIVITY,
  },
  {
    id: "usr_kojoanan",
    name: "Kojo Anan",
    email: "kojo@anan.dev",
    handle: "@kojoanan",
    plan: "free",
    status: "active",
    links: 5,
    views30d: 880,
    country: "Ghana",
    joinedAt: "2026-05-02",
    lastActiveAt: "2026-06-26",
    usage: DEFAULT_USAGE,
    recentActivity: DEFAULT_ACTIVITY,
  },
  {
    id: "usr_amaboateng",
    name: "Ama Boateng",
    email: "ama@boateng.gh",
    handle: "@amaboateng",
    plan: "pro",
    status: "active",
    links: 19,
    views30d: 14300,
    country: "Ghana",
    joinedAt: "2026-03-19",
    lastActiveAt: "2026-06-30",
    usage: DEFAULT_USAGE,
    recentActivity: DEFAULT_ACTIVITY,
  },
  {
    id: "usr_cryptodoubler",
    name: "cryptodoubler",
    email: "hidden3@account.com",
    handle: "@cryptodoubler",
    plan: "free",
    status: "pending",
    links: 6,
    views30d: 95,
    country: "Unknown",
    joinedAt: "2026-06-25",
    lastActiveAt: "2026-06-29",
    usage: DEFAULT_USAGE,
    recentActivity: DEFAULT_ACTIVITY,
  },
  {
    id: "usr_kwesiopoku",
    name: "Kwesi Opoku",
    email: "kwesi@opoku.io",
    handle: "@kwesiopoku",
    plan: "free",
    status: "active",
    links: 8,
    views30d: 1320,
    country: "Ghana",
    joinedAt: "2026-04-28",
    lastActiveAt: "2026-06-30",
    usage: DEFAULT_USAGE,
    recentActivity: DEFAULT_ACTIVITY,
  },
  {
    id: "usr_adwoaserwaa",
    name: "Adwoa Serwaa",
    email: "adwoa@serwaa.art",
    handle: "@adwoaserwaa",
    plan: "pro",
    status: "active",
    links: 24,
    views30d: 18750,
    country: "Ghana",
    joinedAt: "2026-02-22",
    lastActiveAt: "2026-06-30",
    usage: DEFAULT_USAGE,
    recentActivity: DEFAULT_ACTIVITY,
  },
  {
    id: "usr_yaaasantewaa",
    name: "Yaa Asantewaa",
    email: "yaa@asantewaa.gh",
    handle: "@yaaa",
    plan: "business",
    status: "active",
    links: 41,
    views30d: 53400,
    country: "Ghana",
    joinedAt: "2025-11-14",
    lastActiveAt: "2026-06-30",
    usage: DEFAULT_USAGE,
    recentActivity: DEFAULT_ACTIVITY,
  },
  {
    id: "usr_kobjoboateng",
    name: "Kobby Boateng",
    email: "kobby@boateng.dev",
    handle: "@kobby",
    plan: "free",
    status: "active",
    links: 2,
    views30d: 64,
    country: "Ghana",
    joinedAt: "2026-06-29",
    lastActiveAt: "2026-06-30",
    usage: DEFAULT_USAGE,
    recentActivity: DEFAULT_ACTIVITY,
  },
  {
    id: "usr_esinamquao",
    name: "Esinam Quao",
    email: "esinam@quao.co",
    handle: "@esinam",
    plan: "pro",
    status: "active",
    links: 13,
    views30d: 7600,
    country: "Ghana",
    joinedAt: "2026-01-08",
    lastActiveAt: "2026-06-28",
    usage: DEFAULT_USAGE,
    recentActivity: DEFAULT_ACTIVITY,
  },
  {
    id: "usr_fiifimensah",
    name: "Fiifi Mensah",
    email: "fiifi@mensah.io",
    handle: "@fiifi",
    plan: "free",
    status: "suspended",
    links: 0,
    views30d: 0,
    country: "Ghana",
    joinedAt: "2026-05-30",
    lastActiveAt: null,
    usage: DEFAULT_USAGE,
    recentActivity: DEFAULT_ACTIVITY,
  },
  {
    id: "usr_naakaikai",
    name: "Naa Kaikai",
    email: "naa@kaikai.art",
    handle: "@naakaikai",
    plan: "pro",
    status: "active",
    links: 16,
    views30d: 10240,
    country: "Ghana",
    joinedAt: "2026-04-04",
    lastActiveAt: "2026-06-30",
    usage: DEFAULT_USAGE,
    recentActivity: DEFAULT_ACTIVITY,
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

/** Admins who can appear as an audit log actor, and the actor filter's options. */
export const AUDIT_ACTORS: AuditActor[] = [
  { id: "act_ama", name: "Ama Mensah", role: "Super admin" },
  { id: "act_sam", name: "Sam Hale", role: "Admin" },
  { id: "act_efua", name: "Efua Boat", role: "Support" },
  { id: "act_kojo", name: "Kojo Brent", role: "Admin" },
];

const AUDIT_ACTION_META: Record<AuditActionType, { label: string; sensitive: boolean }> = {
  user_suspended: { label: "Suspended account", sensitive: true },
  user_reinstated: { label: "Reinstated account", sensitive: false },
  page_takedown: { label: "Took down page", sensitive: true },
  impersonation: { label: "Impersonated user", sensitive: true },
  password_reset: { label: "Sent password reset", sensitive: false },
  plan_changed: { label: "Edited plan", sensitive: false },
  payment_refunded: { label: "Refunded payment", sensitive: false },
  report_dismissed: { label: "Dismissed report", sensitive: false },
  settings_updated: { label: "Updated settings", sensitive: false },
};

/** Latest timestamp in the fixture set — the reference point for date-range filtering. */
export const AUDIT_LOG_NOW = new Date("2026-06-30T14:22:00Z");

function auditEntry(
  id: string,
  actor: AuditActor,
  actionType: AuditActionType,
  target: string,
  ip: string,
  hoursAgo: number,
  extra: Partial<Pick<AuditLogEntryDetail, "reason" | "changes" | "sensitive">> = {}
): AuditLogEntryDetail {
  const meta = AUDIT_ACTION_META[actionType];
  const createdAt = new Date(AUDIT_LOG_NOW.getTime() - hoursAgo * 3_600_000).toISOString();
  return {
    id,
    actor,
    actionType,
    actionLabel: meta.label,
    target,
    sensitive: extra.sensitive ?? meta.sensitive,
    ip,
    createdAt,
    session: `ses_${id.replace("evt_", "")}`,
    reason: extra.reason,
    changes: extra.changes,
  };
}

const [AMA, SAM, EFUA, KOJO] = AUDIT_ACTORS;

/**
 * Hand-written entries covering every action type, mixing sensitive/
 * non-sensitive and reason/changes/plain rows.
 */
const AUDIT_LOG_SEED: AuditLogEntryDetail[] = [
  auditEntry("evt_001", AMA, "user_suspended", "@quick-cash-now", "41.66.12.9", 0.5, {
    reason: "Phishing — impersonating a bank login. Confirmed by link scanner + 3 reports.",
  }),
  auditEntry("evt_002", SAM, "page_takedown", "@cryptodoubler", "102.89.4.201", 1.75, {
    reason: "Advance-fee crypto scam. Confirmed by link scanner + 2 reports.",
  }),
  auditEntry("evt_003", EFUA, "payment_refunded", "Kwame Asare · €9", "154.160.31.5", 3),
  auditEntry("evt_004", AMA, "impersonation", "@laraowusu", "41.66.12.9", 4.25, {
    reason: "Investigating a billing dispute at the user's request.",
  }),
  auditEntry("evt_005", KOJO, "password_reset", "@saraa", "197.251.8.44", 19),
  auditEntry("evt_006", AMA, "plan_changed", "Pro plan", "41.66.12.9", 22, {
    changes: [{ field: "Monthly price", before: "€8.00", after: "€9.00" }],
  }),
  auditEntry("evt_007", SAM, "report_dismissed", "@free-giftcards", "102.89.4.201", 29),
  auditEntry("evt_008", EFUA, "settings_updated", "Notification templates", "154.160.31.5", 34, {
    changes: [{ field: "Password reset subject", before: "Reset your password", after: "Reset your LinkHub password" }],
  }),
  auditEntry("evt_009", KOJO, "user_reinstated", "@kwesiopoku", "197.251.8.44", 41),
  auditEntry("evt_010", AMA, "user_suspended", "@spammybot", "41.66.12.9", 52, {
    reason: "Bulk affiliate spam across all links.",
  }),
  auditEntry("evt_011", SAM, "impersonation", "@naakaikai", "102.89.4.201", 68, {
    reason: "Reproducing a reported rendering bug on the user's page.",
  }),
  auditEntry("evt_012", EFUA, "payment_refunded", "Nadia Owusu · €24", "154.160.31.5", 80, {
    reason: "Duplicate charge from a failed retry.",
  }),
  auditEntry("evt_013", AMA, "plan_changed", "Business plan", "41.66.12.9", 96, {
    changes: [{ field: "Seats included", before: "3", after: "5" }],
  }),
  auditEntry("evt_014", KOJO, "page_takedown", "@fake-giveaway-gh", "197.251.8.44", 130, {
    reason: "Impersonates a verified brand giveaway.",
  }),
  auditEntry("evt_015", SAM, "settings_updated", "Rate limits", "102.89.4.201", 150, {
    changes: [{ field: "API requests / min", before: "60", after: "120" }],
  }),
];

const GENERATED_ACTORS = AUDIT_ACTORS;
const GENERATED_ACTIONS: AuditActionType[] = [
  "user_suspended",
  "page_takedown",
  "password_reset",
  "plan_changed",
  "report_dismissed",
  "payment_refunded",
  "settings_updated",
  "user_reinstated",
  "impersonation",
];
const GENERATED_TARGETS = [
  "@yawb",
  "@akuasarpong",
  "@efiamensa",
  "@abenakuma",
  "@kojoanan",
  "@amaboateng",
  "@adwoaserwaa",
  "@kobby",
  "@esinam",
  "@fiifi",
];
const GENERATED_IPS = ["41.66.12.9", "102.89.4.201", "154.160.31.5", "197.251.8.44"];

/**
 * Deterministic padding so the log is large enough to exercise pagination and
 * the date-range filter, spanning back from the seed entries across ~30 days.
 */
function buildGeneratedEntries(count: number): AuditLogEntryDetail[] {
  return Array.from({ length: count }, (_, index) => {
    const actor = GENERATED_ACTORS[index % GENERATED_ACTORS.length];
    const actionType = GENERATED_ACTIONS[index % GENERATED_ACTIONS.length];
    const target = GENERATED_TARGETS[index % GENERATED_TARGETS.length];
    const ip = GENERATED_IPS[index % GENERATED_IPS.length];
    // Spread ~135 entries across the 30 days preceding the seed entries.
    const hoursAgo = 160 + index * 5.3;
    return auditEntry(`evt_gen_${index}`, actor, actionType, target, ip, hoursAgo);
  });
}

/** Full audit log fixture (~150 entries) backing `listAuditLog`/`exportAuditLog`. */
export const MOCK_AUDIT_LOG: AuditLogEntryDetail[] = [...AUDIT_LOG_SEED, ...buildGeneratedEntries(135)];

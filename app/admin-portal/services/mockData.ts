/**
 * In-memory fixtures backing the mock {@link AdminService}. Kept separate from
 * the service so it can be imported directly in tests and swapped out when a
 * real backend lands. Content mirrors the linkhub-admin prototype.
 */

import type {
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

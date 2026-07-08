"use server";

import { auth } from "@/auth";
import { getMetricTotal, getMetricBreakdown, getMetricSeriesForRange } from "@/lib/analytics/analytics";
import { ANALYTICS_METRIC } from "@/app/constants/analyticsMetrics";
import { DEVICE_DIMENSIONS, SOURCE_DIMENSIONS, NON_COUNTRY_DIMENSIONS } from "@/lib/analytics/dimensions";
import { customRangeSchema } from "@/lib/validation/analytics.schema";
import { getClicksSeriesForRange, getTopLinksForRange } from "@/app/actions/links";

export interface AnalyticsSummary {
  profileViews: number;
  linkClicks: number;
  /** linkClicks / profileViews, as a percentage. 0 when profileViews is 0. */
  ctr: number;
}

export async function getAnalyticsSummary(): Promise<AnalyticsSummary> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const [profileViews, linkClicks] = await Promise.all([
    getMetricTotal(session.user.id, ANALYTICS_METRIC.PROFILE_VIEW),
    getMetricTotal(session.user.id, ANALYTICS_METRIC.LINK_CLICK),
  ]);

  return {
    profileViews,
    linkClicks,
    ctr: profileViews > 0 ? (linkClicks / profileViews) * 100 : 0,
  };
}

export async function getDeviceBreakdown(): Promise<{ dimension: string; count: number }[]> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  return getMetricBreakdown(session.user.id, [ANALYTICS_METRIC.PROFILE_VIEW], { include: DEVICE_DIMENSIONS });
}

export async function getSourceBreakdown(): Promise<{ dimension: string; count: number }[]> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  return getMetricBreakdown(session.user.id, [ANALYTICS_METRIC.PROFILE_VIEW], { include: SOURCE_DIMENSIONS });
}

export async function getGeographyBreakdown(): Promise<{ dimension: string; count: number }[]> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  return getMetricBreakdown(session.user.id, [ANALYTICS_METRIC.PROFILE_VIEW], {
    exclude: [...NON_COUNTRY_DIMENSIONS, "total"],
  });
}

export interface AnalyticsRangeInput {
  start: string;
  end: string;
}

export interface AnalyticsRangeResult {
  series: number[];
  topLinks: { linkId: string; clicks: number }[];
  summary: AnalyticsSummary;
  sources: { dimension: string; count: number }[];
  devices: { dimension: string; count: number }[];
  geography: { dimension: string; count: number }[];
}

/** Same shape of data as the fixed-range reads above, but scoped to an explicit
 *  custom [start, end] window instead of a fixed lookback from today. */
export async function getAnalyticsForRange(input: AnalyticsRangeInput): Promise<AnalyticsRangeResult> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const parsed = customRangeSchema.safeParse(input);
  if (!parsed.success) throw new Error(parsed.error.issues[0].message);

  const start = new Date(`${parsed.data.start}T00:00:00.000Z`);
  const end = new Date(`${parsed.data.end}T00:00:00.000Z`);
  const userId = session.user.id;

  const [series, topLinks, profileViews, linkClicks, sources, devices, geography] = await Promise.all([
    getClicksSeriesForRange(start, end),
    getTopLinksForRange(start, end),
    getMetricSeriesForRange(userId, ANALYTICS_METRIC.PROFILE_VIEW, start, end).then((rows) =>
      rows.reduce((s, r) => s + r.count, 0)
    ),
    getMetricSeriesForRange(userId, ANALYTICS_METRIC.LINK_CLICK, start, end).then((rows) =>
      rows.reduce((s, r) => s + r.count, 0)
    ),
    getMetricBreakdown(userId, [ANALYTICS_METRIC.PROFILE_VIEW], { include: SOURCE_DIMENSIONS }, start, end),
    getMetricBreakdown(userId, [ANALYTICS_METRIC.PROFILE_VIEW], { include: DEVICE_DIMENSIONS }, start, end),
    getMetricBreakdown(userId, [ANALYTICS_METRIC.PROFILE_VIEW], {
      exclude: [...NON_COUNTRY_DIMENSIONS, "total"],
    }, start, end),
  ]);

  return {
    series,
    topLinks,
    summary: { profileViews, linkClicks, ctr: profileViews > 0 ? (linkClicks / profileViews) * 100 : 0 },
    sources,
    devices,
    geography,
  };
}

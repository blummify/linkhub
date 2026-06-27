/** Valid `Analytics.metric` values — a plain string union, not a DB enum, so adding a
 *  new metric is a pure application-code change with no migration. */
export const ANALYTICS_METRIC = {
  PROFILE_VIEW: "profile_view",
} as const;

export type AnalyticsMetric = typeof ANALYTICS_METRIC[keyof typeof ANALYTICS_METRIC];

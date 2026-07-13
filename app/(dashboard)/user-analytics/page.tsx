import { type Metadata } from "next";
import UserAnalyticsClient from "./UserAnalyticsClient";
import { getLinks, getClicksSeries } from "@/app/actions/links";
import {
  getAnalyticsSummary,
  getSourceBreakdown,
  getDeviceBreakdown,
  getGeographyBreakdown,
} from "@/app/actions/analytics";

export const metadata: Metadata = {
  title: "Analytics",
};

// Widest range the chart can show (the "All" pill renders 180 day-buckets), so
// fetch once and let the client slice it for the 7/30/90/all views.
const SERIES_DAYS = 180;

export default async function UserAnalyticsPage() {
  const [links, series, summary, sources, devices, geography] = await Promise.all([
    getLinks().catch(() => []),
    getClicksSeries(SERIES_DAYS).catch(() => [] as number[]),
    getAnalyticsSummary().catch(() => ({ profileViews: 0, linkClicks: 0, ctr: 0 })),
    getSourceBreakdown().catch(() => []),
    getDeviceBreakdown().catch(() => []),
    getGeographyBreakdown().catch(() => []),
  ]);

  return (
    <UserAnalyticsClient
      series={series}
      links={links.map((l) => ({
        id: l.id,
        title: l.title,
        url: l.url,
        clicks: String(l.clicks),
        icon: l.icon,
      }))}
      summary={summary}
      sources={sources}
      devices={devices}
      geography={geography}
    />
  );
}

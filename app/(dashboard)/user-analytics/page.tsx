import { type Metadata } from "next";
import UserAnalyticsClient from "./UserAnalyticsClient";
import { getLinks, getClicksSeries } from "@/app/actions/links";

export const metadata: Metadata = {
  title: "Analytics",
};

// Widest range the chart can show (the "All" pill renders 180 day-buckets), so
// fetch once and let the client slice it for the 7/30/90/all views.
const SERIES_DAYS = 180;

export default async function UserAnalyticsPage() {
  // Surface the real cumulative click data (Link.clicks) plus the real per-day
  // time series (ClickDaily, via getClicksSeries). Other metrics on the page
  // (visitors, CTR, sources, devices, geo) have no data source yet and remain
  // illustrative.
  const [links, series] = await Promise.all([
    getLinks().catch(() => []),
    getClicksSeries(SERIES_DAYS).catch(() => [] as number[]),
  ]);

  return (
    <UserAnalyticsClient
      series={series}
      links={links.map((l) => ({
        title: l.title,
        url: l.url,
        clicks: String(l.clicks),
        icon: l.icon,
      }))}
    />
  );
}

import { type Metadata } from "next";
import UserAnalyticsClient from "./UserAnalyticsClient";
import { getLinks } from "@/app/actions/links";

export const metadata: Metadata = {
  title: "Analytics",
};

export default async function UserAnalyticsPage() {
  // Surface the real cumulative click data (Link.clicks). Other metrics on the
  // page (visitors, CTR, sources, devices, geo) have no data source yet and
  // remain illustrative.
  const links = await getLinks().catch(() => []);

  return (
    <UserAnalyticsClient
      links={links.map((l) => ({
        title: l.title,
        url: l.url,
        clicks: String(l.clicks),
        icon: l.icon,
      }))}
    />
  );
}

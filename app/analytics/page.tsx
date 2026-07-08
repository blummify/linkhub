import { redirect } from "next/navigation";

/** Canonical analytics page is `/user-analytics`; keep this URL working for bookmarks. */
export default function AnalyticsPage() {
  redirect("/user-analytics");
}

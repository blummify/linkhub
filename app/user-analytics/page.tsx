import type { Metadata } from "next";
import { loadTemplateHtml } from "../templateLoader";

export const metadata: Metadata = {
  title: "Analytics",
};

export default async function UserAnalyticsPage() {
  const { bodyClassName, bodyHtml } = await loadTemplateHtml("user-analytics.html");
  return (
    <div className={`admin-skin ${bodyClassName}`} dangerouslySetInnerHTML={{ __html: bodyHtml }} />
  );
}

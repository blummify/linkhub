import type { Metadata } from "next";
import { loadTemplateHtml } from "../templateLoader";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default async function UserDashboardPage() {
  const { bodyClassName, bodyHtml } = await loadTemplateHtml("user-dashboard.html");
  return <div className={bodyClassName} dangerouslySetInnerHTML={{ __html: bodyHtml }} />;
}

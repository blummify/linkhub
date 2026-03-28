import type { Metadata } from "next";
import { loadTemplateHtml } from "../templateLoader";

export const metadata: Metadata = {
  title: "Super Admin",
};

export default async function SuperAdminPage() {
  const { bodyClassName, bodyHtml } = await loadTemplateHtml("super-admin.html");
  return (
    <div className={`admin-skin ${bodyClassName}`} dangerouslySetInnerHTML={{ __html: bodyHtml }} />
  );
}

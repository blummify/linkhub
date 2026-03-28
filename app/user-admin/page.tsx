import type { Metadata } from "next";
import { loadTemplateHtml } from "../templateLoader";

export const metadata: Metadata = {
  title: "User Admin",
};

export default async function UserAdminPage() {
  const { bodyClassName, bodyHtml } = await loadTemplateHtml("user-admin.html");
  return (
    <div className={`admin-skin ${bodyClassName}`} dangerouslySetInnerHTML={{ __html: bodyHtml }} />
  );
}

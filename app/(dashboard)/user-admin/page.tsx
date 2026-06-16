import { redirect } from "next/navigation";

/** Canonical links hub is `/user-dashboard`; keep this URL working for bookmarks. */
export default function UserAdminPage() {
  redirect("/user-dashboard");
}

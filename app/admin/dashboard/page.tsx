import UserAdminClient from "../../(dashboard)/user-admin/UserAdminClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Dashboard",
  description: "System administration and management dashboard.",
};

export default function AdminDashboardPage() {
  return <UserAdminClient />;
}

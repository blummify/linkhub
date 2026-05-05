import UserAdminClient from "../../user-admin/UserAdminClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Dashboard - Creator Hub",
  description: "System administration and management dashboard.",
};

export default function AdminDashboardPage() {
  return <UserAdminClient />;
}

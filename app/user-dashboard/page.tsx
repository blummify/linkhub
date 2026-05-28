import UserAdminClient from "../user-admin/UserAdminClient";
import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Manage and organize your digital presence.",
};

export default function UserDashboardPage() {
  return <UserAdminClient />;
}
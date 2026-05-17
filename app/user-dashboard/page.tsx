import UserAdminClient from "../user-admin/UserAdminClient";
import { type Metadata } from "next";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Manage and organize your digital presence.",
};

export default async function UserDashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/signin");
  }

  return <UserAdminClient />;
}
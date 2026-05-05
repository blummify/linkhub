import SuperAdminClient from "../SuperAdminClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Super Admin Dashboard - Creator Hub",
  description: "Super admin control center with system-wide administration capabilities.",
};

export default function SuperAdminPage() {
  return <SuperAdminClient />;
}

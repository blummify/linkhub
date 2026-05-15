import SuperAdminClient from "./SuperAdminClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Super Admin",
  description: "System-wide administration and control center.",
};

export default function SuperAdminPage() {
  return <SuperAdminClient />;
}

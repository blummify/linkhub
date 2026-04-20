import LinksClient from "../links/LinksClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard - Creator Hub",
  description: "Manage and organize your digital presence.",
};

export default function UserDashboardPage() {
  return <LinksClient />;
}

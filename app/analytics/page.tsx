import UserAnalyticsClient from "../user-analytics/UserAnalyticsClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Analytics - Creator Hub",
  description: "View detailed analytics and performance metrics for your links.",
};

export default function AnalyticsPage() {
  return <UserAnalyticsClient />;
}

import { type Metadata } from "next";
import UserAnalyticsClient from "./UserAnalyticsClient";

export const metadata: Metadata = {
  title: "Analytics",
};

export default function UserAnalyticsPage() {
  return <UserAnalyticsClient />;
}

import type { Metadata } from "next";
import { StubView } from "../../components/StubView";

export const metadata: Metadata = { title: "Plans" };

export default function AdminPlansPage() {
  return (
    <StubView
      crumb="Admin / Plans"
      title="Plans."
      icon="plans"
      heading="Plans & limits"
      description="Manage tiers, pricing, limits, and feature flags."
    />
  );
}

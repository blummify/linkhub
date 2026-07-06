import type { Metadata } from "next";
import { StubView } from "../../components/StubView";

export const metadata: Metadata = { title: "Revenue" };

export default function AdminRevenuePage() {
  return (
    <StubView
      crumb="Admin / Revenue"
      title="Rev"
      accent="enue."
      icon="revenue"
      heading="Revenue"
      description="Subscriptions, transactions, and recovery."
    />
  );
}

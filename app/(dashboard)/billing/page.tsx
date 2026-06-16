import { type Metadata } from "next";
import { headers } from "next/headers";
import BillingClient from "./BillingClient";
import { detectCurrencyFromHeaders } from "@/lib/geo";

export const metadata: Metadata = {
  title: "Billing",
};

export default async function BillingPage() {
  const h = await headers();
  const defaultCurrency = detectCurrencyFromHeaders((name) => h.get(name));
  return <BillingClient defaultCurrency={defaultCurrency} />;
}

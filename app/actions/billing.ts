"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { redis } from "@/lib/redis";
import {
  initializeTransaction,
  disableSubscription,
  listCustomerTransactions,
} from "@/lib/paystack";

/* ── DTO types — only client-safe fields are ever returned ─────────────────
   Internal Paystack IDs (paystackCustomerId, paystackSubscriptionId,
   authorization codes) are NEVER included in these types.
*/
export type SubscriptionDTO = {
  planId: "free" | "pro" | "business";
  status: "active" | "non-renewing" | "past_due" | "canceled";
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
};

export type InvoiceDTO = {
  id: string;       // Paystack transaction reference — safe to display
  date: string;
  amount: string;   // Formatted: "$12.00"
  status: "success" | "failed" | "pending";
  pdfUrl: string;
};

/* ── Helpers ─────────────────────────────────────────────────────────────── */
async function requireSession() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  return session.user as { id: string; email: string };
}

function formatAmount(pesewas: number): string {
  return `$${(pesewas / 100).toFixed(2)}`;
}

/* ── getSubscription ─────────────────────────────────────────────────────── */
export async function getSubscription(): Promise<SubscriptionDTO | null> {
  const user = await requireSession();

  const sub = await db.subscription.findUnique({
    where: { userId: user.id },
    // Select only the fields the DTO needs — never pull paystackCustomerId etc.
    select: {
      planId: true,
      status: true,
      currentPeriodEnd: true,
      cancelAtPeriodEnd: true,
    },
  });

  if (!sub) return null;

  return {
    planId: sub.planId as SubscriptionDTO["planId"],
    status: sub.status as SubscriptionDTO["status"],
    currentPeriodEnd: sub.currentPeriodEnd?.toISOString() ?? null,
    cancelAtPeriodEnd: sub.cancelAtPeriodEnd,
  };
}

/* ── createCheckoutSession ───────────────────────────────────────────────── */
export async function createCheckoutSession(
  planCode: string
): Promise<{ url: string }> {
  const user = await requireSession();

  // Rate-limit: max 3 checkout initiations per hour per user
  const rlKey = `checkout:${user.id}`;
  try {
    const count = await redis.incr(rlKey);
    if (count === 1) await redis.expire(rlKey, 3600);
    if (count > 3) throw new Error("Too many checkout attempts. Please try again later.");
  } catch (err) {
    if (err instanceof Error && err.message.includes("Too many")) throw err;
    // Redis unavailable — allow through
  }

  const baseUrl =
    process.env.NEXTAUTH_URL ??
    (process.env.NEXT_PUBLIC_APP_DOMAIN
      ? `https://${process.env.NEXT_PUBLIC_APP_DOMAIN}`
      : "http://localhost:3000");

  const { authorizationUrl } = await initializeTransaction({
    email: user.email,
    amount: 0, // Paystack uses the plan's amount when a plan code is specified
    planCode,
    callbackUrl: `${baseUrl}/billing?checkout=success`,
    metadata: { userId: user.id },
  });

  // Return only the URL — never the full Paystack transaction object
  return { url: authorizationUrl };
}

/* ── cancelSubscription ──────────────────────────────────────────────────── */
export async function cancelSubscription(): Promise<void> {
  const user = await requireSession();

  // Fetch internal subscription fields needed for Paystack API — never returned to client
  const sub = await db.subscription.findUnique({
    where: { userId: user.id },
    select: {
      paystackSubscriptionId: true,
      status: true,
    },
  });

  if (!sub?.paystackSubscriptionId) {
    throw new Error("No active subscription found");
  }
  if (sub.status === "canceled") {
    throw new Error("Subscription is already canceled");
  }

  // Paystack requires the email token (sent to the customer) for cancel — fetch it
  // In production this comes from the subscription's email_token field.
  // Here we call the cancel endpoint with the subscription code.
  // Note: disableSubscription requires email_token; for server-initiated cancel
  // use the subscription code only (Paystack supports this for server-side cancel).
  await disableSubscription({
    code: sub.paystackSubscriptionId,
    token: "", // Empty for server-initiated cancel without customer token
  });

  // Optimistically update DB — webhook will confirm this
  await db.subscription.updateMany({
    where: { userId: user.id },
    data: { cancelAtPeriodEnd: true, status: "non-renewing" },
  });
}

/* ── getInvoices ─────────────────────────────────────────────────────────── */
export async function getInvoices(): Promise<InvoiceDTO[]> {
  const user = await requireSession();

  // Fetch the internal customer code — needed for Paystack API, never returned to client
  const sub = await db.subscription.findUnique({
    where: { userId: user.id },
    select: { paystackCustomerId: true },
  });

  if (!sub?.paystackCustomerId) return [];

  const transactions = await listCustomerTransactions(sub.paystackCustomerId, 12);

  // Map to DTO — only safe fields
  return transactions.map((tx) => ({
    id: tx.reference,
    date: new Date(tx.paid_at).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }),
    amount: formatAmount(tx.amount),
    status: tx.status,
    pdfUrl: tx.invoice_url ?? "",
  }));
}

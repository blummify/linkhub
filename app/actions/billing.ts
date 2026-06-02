"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { redis } from "@/lib/redis";
import {
  initializeTransaction,
  disableSubscription,
  listCustomerTransactions,
} from "@/lib/paystack";

export type CardDTO = {
  last4: string;
  brand: string;
  expiry: string;
};

export type SubscriptionDTO = {
  planId: "free" | "pro" | "business";
  status: "active" | "non-renewing" | "past_due" | "canceled";
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  card: CardDTO | null;
};

export type InvoiceDTO = {
  id: string;
  date: string;
  amount: string;
  status: "success" | "failed" | "pending";
  pdfUrl: string;
};

async function requireSession() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  return session.user as { id: string; email: string };
}

function formatAmount(pesewas: number): string {
  return `$${(pesewas / 100).toFixed(2)}`;
}

export async function getSubscription(): Promise<SubscriptionDTO | null> {
  const user = await requireSession();

  const sub = await db.subscription.findUnique({
    where: { userId: user.id },
    select: {
      planId: true,
      status: true,
      currentPeriodEnd: true,
      cancelAtPeriodEnd: true,
      cardLast4: true,
      cardBrand: true,
      cardExpiry: true,
      // authorizationCode intentionally excluded — server-only field
    },
  });

  if (!sub) return null;

  const card: CardDTO | null =
    sub.cardLast4 && sub.cardBrand && sub.cardExpiry
      ? { last4: sub.cardLast4, brand: sub.cardBrand, expiry: sub.cardExpiry }
      : null;

  return {
    planId: sub.planId as SubscriptionDTO["planId"],
    status: sub.status as SubscriptionDTO["status"],
    currentPeriodEnd: sub.currentPeriodEnd?.toISOString() ?? null,
    cancelAtPeriodEnd: sub.cancelAtPeriodEnd,
    card,
  };
}

export async function createCheckoutSession(
  planCode: string
): Promise<{ url: string }> {
  const user = await requireSession();

  const rlKey = `checkout:${user.id}`;
  try {
    const count = await redis.incr(rlKey);
    if (count === 1) await redis.expire(rlKey, 3600);
    if (count > 3) throw new Error("Too many checkout attempts. Please try again later.");
  } catch (err) {
    if (err instanceof Error && err.message.includes("Too many")) throw err;
  }

  const baseUrl =
    process.env.NEXTAUTH_URL ??
    (process.env.NEXT_PUBLIC_APP_DOMAIN
      ? `https://${process.env.NEXT_PUBLIC_APP_DOMAIN}`
      : "http://localhost:3000");

  const { authorizationUrl } = await initializeTransaction({
    email: user.email,
    amount: 0,
    planCode,
    callbackUrl: `${baseUrl}/billing?checkout=success`,
    metadata: { userId: user.id },
  });

  return { url: authorizationUrl };
}

export async function cancelSubscription(): Promise<void> {
  const user = await requireSession();

  const sub = await db.subscription.findUnique({
    where: { userId: user.id },
    select: {
      paystackSubscriptionId: true,
      authorizationCode: true,
      status: true,
    },
  });

  if (!sub?.paystackSubscriptionId) throw new Error("No active subscription found");
  if (sub.status === "canceled") throw new Error("Subscription is already canceled");

  await disableSubscription({
    code: sub.paystackSubscriptionId,
    token: sub.authorizationCode ?? "",
  });

  await db.subscription.updateMany({
    where: { userId: user.id },
    data: { cancelAtPeriodEnd: true, status: "non-renewing" },
  });
}

export async function getInvoices(): Promise<InvoiceDTO[]> {
  const user = await requireSession();

  const sub = await db.subscription.findUnique({
    where: { userId: user.id },
    select: { paystackCustomerId: true },
  });

  if (!sub?.paystackCustomerId) return [];

  const transactions = await listCustomerTransactions(sub.paystackCustomerId, 12);

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

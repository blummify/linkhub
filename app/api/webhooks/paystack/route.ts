import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyWebhookSignature } from "@/lib/paystack";

/* ── Allowed event types ─────────────────────────────────────────────────────
   Unknown events return 200 immediately — Paystack will stop retrying.
   We take no DB action for events not in this set.
*/
const HANDLED_EVENTS = new Set([
  "charge.success",
  "subscription.create",
  "invoice.payment_success",
  "invoice.payment_failed",
  "subscription.not_renew",
  "subscription.disable",
]);

export async function POST(req: NextRequest) {
  // ── Step 1: Read raw body BEFORE any JSON parsing ────────────────────────
  // HMAC is computed over the raw bytes; parsing first would alter whitespace.
  const rawBody = await req.text();

  // ── Step 2: Verify signature BEFORE touching the DB ──────────────────────
  const signature = req.headers.get("x-paystack-signature") ?? "";
  if (!verifyWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  // ── Step 3: Parse only after verification passes ──────────────────────────
  let event: { event: string; data: Record<string, unknown> };
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { event: eventType, data } = event;

  // ── Step 4: Log event type only — never log the body (contains PII) ───────
  console.info(`[paystack-webhook] event=${eventType}`);

  // Unknown events: acknowledge receipt and exit — no DB writes
  if (!HANDLED_EVENTS.has(eventType)) {
    return NextResponse.json({ received: true });
  }

  // ── Step 5: Handle events — all DB writes use upsert for idempotency ─────
  try {
    await handleEvent(eventType, data);
  } catch (err) {
    console.error(`[paystack-webhook] handler error event=${eventType}`, err);
    // Still return 200 to stop Paystack from retrying a handler error
    return NextResponse.json({ received: true });
  }

  return NextResponse.json({ received: true });
}

async function handleEvent(
  eventType: string,
  data: Record<string, unknown>
) {
  switch (eventType) {

    case "charge.success": {
      // A subscription payment was successfully charged for the first time.
      const customerEmail = (data.customer as { email?: string })?.email;
      const customerId = (data.customer as { customer_code?: string })?.customer_code ?? "";
      const paidAt = typeof data.paid_at === "string" ? new Date(data.paid_at) : new Date();
      const planObj = data.plan as { plan_code?: string; interval?: string } | undefined;

      if (!customerEmail) return;

      const user = await db.user.findUnique({ where: { email: customerEmail } });
      if (!user) return;

      // Upsert subscription and set role atomically
      await db.$transaction([
        db.subscription.upsert({
          where: { userId: user.id },
          create: {
            userId: user.id,
            paystackCustomerId: customerId,
            paystackPlanCode: planObj?.plan_code ?? null,
            planId: "pro",
            status: "active",
            currentPeriodEnd: nextPeriodEnd(paidAt, planObj?.interval),
            cancelAtPeriodEnd: false,
          },
          update: {
            paystackCustomerId: customerId,
            paystackPlanCode: planObj?.plan_code ?? null,
            planId: "pro",
            status: "active",
            currentPeriodEnd: nextPeriodEnd(paidAt, planObj?.interval),
            cancelAtPeriodEnd: false,
          },
        }),
        db.user.update({
          where: { id: user.id },
          data: { role: "PRO" },
        }),
      ]);
      break;
    }

    case "subscription.create": {
      // Paystack has created the subscription record; store the subscription code.
      const subCode = typeof data.subscription_code === "string" ? data.subscription_code : null;
      const planCode = (data.plan as { plan_code?: string })?.plan_code ?? null;
      const customerEmail = (data.customer as { email?: string })?.email;
      if (!customerEmail || !subCode) return;

      const user = await db.user.findUnique({ where: { email: customerEmail } });
      if (!user) return;

      await db.subscription.updateMany({
        where: { userId: user.id },
        data: {
          paystackSubscriptionId: subCode,
          paystackPlanCode: planCode,
        },
      });
      break;
    }

    case "invoice.payment_success": {
      const customerEmail = (data.customer as { email?: string })?.email;
      const paidAt = typeof data.paid_at === "string" ? new Date(data.paid_at) : new Date();
      const planObj = data.subscription as { plan?: { interval?: string } } | undefined;
      if (!customerEmail) return;

      const user = await db.user.findUnique({ where: { email: customerEmail } });
      if (!user) return;

      await db.subscription.updateMany({
        where: { userId: user.id },
        data: {
          status: "active",
          currentPeriodEnd: nextPeriodEnd(paidAt, planObj?.plan?.interval),
        },
      });
      break;
    }

    case "invoice.payment_failed": {
      const customerEmail = (data.customer as { email?: string })?.email;
      if (!customerEmail) return;

      const user = await db.user.findUnique({ where: { email: customerEmail } });
      if (!user) return;

      await db.subscription.updateMany({
        where: { userId: user.id },
        data: { status: "past_due" },
      });
      break;
    }

    case "subscription.not_renew": {
      // User cancelled — subscription stays active until period end.
      const customerEmail = (data.customer as { email?: string })?.email;
      if (!customerEmail) return;

      const user = await db.user.findUnique({ where: { email: customerEmail } });
      if (!user) return;

      await db.subscription.updateMany({
        where: { userId: user.id },
        data: { cancelAtPeriodEnd: true, status: "non-renewing" },
      });
      break;
    }

    case "subscription.disable": {
      // Subscription has fully ended — revoke Pro access.
      const customerEmail = (data.customer as { email?: string })?.email;
      if (!customerEmail) return;

      const user = await db.user.findUnique({ where: { email: customerEmail } });
      if (!user) return;

      await db.$transaction([
        db.subscription.updateMany({
          where: { userId: user.id },
          data: { status: "canceled", cancelAtPeriodEnd: false },
        }),
        db.user.update({
          where: { id: user.id },
          data: { role: "USER" },
        }),
      ]);
      break;
    }
  }
}

/** Calculate the next billing period end date from a payment date and plan interval. */
function nextPeriodEnd(from: Date, interval?: string): Date {
  const d = new Date(from);
  if (interval === "annually") {
    d.setFullYear(d.getFullYear() + 1);
  } else {
    // Default: monthly
    d.setMonth(d.getMonth() + 1);
  }
  return d;
}

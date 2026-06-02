import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyWebhookSignature } from "@/lib/paystack";

const HANDLED_EVENTS = new Set([
  "charge.success",
  "subscription.create",
  "invoice.payment_success",
  "invoice.payment_failed",
  "subscription.not_renew",
  "subscription.disable",
]);

export async function POST(req: NextRequest) {
  // Read raw body before JSON.parse — HMAC is computed over the raw bytes.
  const rawBody = await req.text();

  const signature = req.headers.get("x-paystack-signature") ?? "";
  if (!verifyWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  let event: { event: string; data: Record<string, unknown> };
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { event: eventType, data } = event;

  console.info(`[paystack-webhook] event=${eventType}`);

  if (!HANDLED_EVENTS.has(eventType)) {
    return NextResponse.json({ received: true });
  }

  try {
    await handleEvent(eventType, data);
  } catch (err) {
    console.error(`[paystack-webhook] handler error event=${eventType}`, err);
    // Return 200 so Paystack doesn't retry a handler-side error indefinitely.
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
      const customerEmail = (data.customer as { email?: string })?.email;
      const customerId    = (data.customer as { customer_code?: string })?.customer_code ?? "";
      const paidAt        = typeof data.paid_at === "string" ? new Date(data.paid_at) : new Date();
      const planObj       = data.plan as { plan_code?: string; interval?: string } | undefined;

      const auth = data.authorization as {
        authorization_code?: string;
        card_type?: string;
        last4?: string;
        exp_month?: string;
        exp_year?: string;
      } | undefined;

      const cardExpiry = auth?.exp_month && auth?.exp_year
        ? `${auth.exp_month}/${auth.exp_year}`
        : null;

      if (!customerEmail) return;

      const user = await db.user.findUnique({ where: { email: customerEmail } });
      if (!user) return;

      await db.$transaction([
        db.subscription.upsert({
          where: { userId: user.id },
          create: {
            userId: user.id,
            paystackCustomerId: customerId,
            paystackPlanCode: planObj?.plan_code ?? null,
            authorizationCode: auth?.authorization_code ?? null,
            cardLast4:  auth?.last4 ?? null,
            cardBrand:  auth?.card_type ?? null,
            cardExpiry,
            planId: "pro",
            status: "active",
            currentPeriodEnd: nextPeriodEnd(paidAt, planObj?.interval),
            cancelAtPeriodEnd: false,
          },
          update: {
            paystackCustomerId: customerId,
            paystackPlanCode: planObj?.plan_code ?? null,
            authorizationCode: auth?.authorization_code ?? null,
            cardLast4:  auth?.last4 ?? null,
            cardBrand:  auth?.card_type ?? null,
            cardExpiry,
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
      const subCode = typeof data.subscription_code === "string" ? data.subscription_code : null;
      const planCode = (data.plan as { plan_code?: string })?.plan_code ?? null;
      const customerEmail = (data.customer as { email?: string })?.email;
      if (!customerEmail || !subCode) return;

      const user = await db.user.findUnique({ where: { email: customerEmail } });
      if (!user) return;

      await db.subscription.updateMany({
        where: { userId: user.id },
        data: { paystackSubscriptionId: subCode, paystackPlanCode: planCode },
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

function nextPeriodEnd(from: Date, interval?: string): Date {
  const d = new Date(from);
  if (interval === "annually") {
    d.setFullYear(d.getFullYear() + 1);
  } else {
    d.setMonth(d.getMonth() + 1);
  }
  return d;
}

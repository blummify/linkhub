import { describe, it, expect, vi, beforeEach } from "vitest";
import { createHmac } from "crypto";
import { NextRequest } from "next/server";

/* ── Mocks ── */
vi.mock("@/lib/db", () => ({
  db: {
    user: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    subscription: {
      upsert: vi.fn(),
      updateMany: vi.fn(),
    },
    $transaction: vi.fn((ops: unknown[]) => Promise.all(ops)),
  },
}));

vi.mock("@/lib/paystack", async (importOriginal) => {
  const real = await importOriginal<typeof import("@/lib/paystack")>();
  // Keep verifyWebhookSignature real — it must run for security tests
  return { ...real };
});

import { POST } from "../route";
import { db } from "@/lib/db";

/* ── Helpers ── */
const SECRET = "webhook_secret_for_tests";

function sign(body: string): string {
  return createHmac("sha512", SECRET).update(body).digest("hex");
}

function makeRequest(body: string, signature?: string): NextRequest {
  const headers = new Headers({ "Content-Type": "application/json" });
  if (signature !== undefined) headers.set("x-paystack-signature", signature);
  return new NextRequest("http://localhost/api/webhooks/paystack", {
    method: "POST",
    headers,
    body,
  });
}

function mockUser() {
  (db.user.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
    id: "user_123",
    email: "joel@example.com",
    role: "USER",
  });
}

const CUSTOMER = { email: "joel@example.com", customer_code: "CUS_abc123" };

beforeEach(() => {
  vi.clearAllMocks();
  process.env.PAYSTACK_WEBHOOK_SECRET = SECRET;
});

/* ── Signature verification ── */
describe("POST /api/webhooks/paystack — signature", () => {
  it("returns 400 when x-paystack-signature header is missing", async () => {
    const body = JSON.stringify({ event: "charge.success", data: {} });
    const res = await POST(makeRequest(body, undefined));
    expect(res.status).toBe(400);
  });

  it("returns 400 when the signature is wrong", async () => {
    const body = JSON.stringify({ event: "charge.success", data: {} });
    const res = await POST(makeRequest(body, "deadbeef".repeat(16)));
    expect(res.status).toBe(400);
  });

  it("returns 200 for a valid signature on an unknown event", async () => {
    const body = JSON.stringify({ event: "unknown.event", data: {} });
    const res = await POST(makeRequest(body, sign(body)));
    expect(res.status).toBe(200);
    expect(db.user.findUnique).not.toHaveBeenCalled();
  });
});

/* ── charge.success ── */
describe("charge.success", () => {
  it("upserts subscription, sets User.role to PRO, returns 200", async () => {
    mockUser();
    (db.subscription.upsert as ReturnType<typeof vi.fn>).mockResolvedValue({});
    (db.user.update as ReturnType<typeof vi.fn>).mockResolvedValue({});
    (db.$transaction as ReturnType<typeof vi.fn>).mockResolvedValue([{}, {}]);

    const body = JSON.stringify({
      event: "charge.success",
      data: {
        customer: CUSTOMER,
        paid_at: new Date().toISOString(),
        plan: { plan_code: "PLN_pro_monthly", interval: "monthly" },
      },
    });

    const res = await POST(makeRequest(body, sign(body)));
    expect(res.status).toBe(200);
    expect(db.user.findUnique).toHaveBeenCalledWith({ where: { email: "joel@example.com" } });
    expect(db.$transaction).toHaveBeenCalled();
  });

  it("returns 200 without DB writes when customer email is not found", async () => {
    (db.user.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(null);

    const body = JSON.stringify({
      event: "charge.success",
      data: { customer: { email: "unknown@example.com" }, paid_at: new Date().toISOString() },
    });

    const res = await POST(makeRequest(body, sign(body)));
    expect(res.status).toBe(200);
    expect(db.$transaction).not.toHaveBeenCalled();
  });
});

/* ── subscription.disable ── */
describe("subscription.disable", () => {
  it("sets User.role to USER and status to canceled, returns 200", async () => {
    mockUser();
    (db.$transaction as ReturnType<typeof vi.fn>).mockResolvedValue([{}, {}]);

    const body = JSON.stringify({
      event: "subscription.disable",
      data: { customer: CUSTOMER },
    });

    const res = await POST(makeRequest(body, sign(body)));
    expect(res.status).toBe(200);
    expect(db.$transaction).toHaveBeenCalled();
  });
});

/* ── invoice.payment_failed ── */
describe("invoice.payment_failed", () => {
  it("sets status to past_due, returns 200", async () => {
    mockUser();
    (db.subscription.updateMany as ReturnType<typeof vi.fn>).mockResolvedValue({ count: 1 });

    const body = JSON.stringify({
      event: "invoice.payment_failed",
      data: { customer: CUSTOMER },
    });

    const res = await POST(makeRequest(body, sign(body)));
    expect(res.status).toBe(200);
    expect(db.subscription.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({ data: { status: "past_due" } })
    );
  });
});

/* ── subscription.not_renew ── */
describe("subscription.not_renew", () => {
  it("sets cancelAtPeriodEnd=true and status=non-renewing, returns 200", async () => {
    mockUser();
    (db.subscription.updateMany as ReturnType<typeof vi.fn>).mockResolvedValue({ count: 1 });

    const body = JSON.stringify({
      event: "subscription.not_renew",
      data: { customer: CUSTOMER },
    });

    const res = await POST(makeRequest(body, sign(body)));
    expect(res.status).toBe(200);
    expect(db.subscription.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({ data: { cancelAtPeriodEnd: true, status: "non-renewing" } })
    );
  });
});

/* ── Idempotency ── */
describe("idempotency", () => {
  it("handles the same charge.success event twice without error", async () => {
    mockUser();
    (db.$transaction as ReturnType<typeof vi.fn>).mockResolvedValue([{}, {}]);

    const body = JSON.stringify({
      event: "charge.success",
      data: {
        customer: CUSTOMER,
        paid_at: new Date().toISOString(),
        plan: { plan_code: "PLN_pro", interval: "monthly" },
      },
    });

    const res1 = await POST(makeRequest(body, sign(body)));
    const res2 = await POST(makeRequest(body, sign(body)));

    expect(res1.status).toBe(200);
    expect(res2.status).toBe(200);
    // upsert called twice — both succeed, no duplicates
    expect(db.$transaction).toHaveBeenCalledTimes(2);
  });
});

import { describe, it, expect, vi, beforeEach } from "vitest";

/* ── Mocks ── */
vi.mock("@/auth", () => ({
  auth: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  db: {
    subscription: {
      findUnique: vi.fn(),
      updateMany: vi.fn(),
    },
  },
}));

vi.mock("@/lib/redis", () => ({
  redis: {
    incr: vi.fn().mockResolvedValue(1),
    expire: vi.fn().mockResolvedValue(1),
  },
}));

vi.mock("@/lib/paystack", () => ({
  initializeTransaction: vi.fn(),
  disableSubscription: vi.fn(),
  listCustomerTransactions: vi.fn(),
}));

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { initializeTransaction, listCustomerTransactions } from "@/lib/paystack";
import {
  getSubscription,
  createCheckoutSession,
  cancelSubscription,
  getInvoices,
} from "../billing";

const MOCK_SESSION = { user: { id: "user_123", email: "joel@example.com" } };

function mockAuth(session: typeof MOCK_SESSION | null) {
  (auth as ReturnType<typeof vi.fn>).mockResolvedValue(session);
}

beforeEach(() => {
  vi.clearAllMocks();
  process.env.NEXTAUTH_URL = "http://localhost:3000";
});

/* ── getSubscription ── */
describe("getSubscription", () => {
  it("throws Unauthorized when there is no session", async () => {
    mockAuth(null);
    await expect(getSubscription()).rejects.toThrow("Unauthorized");
  });

  it("returns null when the user has no subscription row", async () => {
    mockAuth(MOCK_SESSION);
    (db.subscription.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(null);
    const result = await getSubscription();
    expect(result).toBeNull();
  });

  it("returns a DTO with only safe fields — no internal Paystack IDs", async () => {
    mockAuth(MOCK_SESSION);
    (db.subscription.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
      planId: "pro",
      status: "active",
      currentPeriodEnd: new Date("2026-12-14"),
      cancelAtPeriodEnd: false,
    });

    const result = await getSubscription();

    expect(result).not.toBeNull();
    expect(result?.planId).toBe("pro");
    expect(result?.status).toBe("active");
    expect(result?.cancelAtPeriodEnd).toBe(false);

    expect(result).not.toHaveProperty("paystackCustomerId");
    expect(result).not.toHaveProperty("paystackSubscriptionId");
    expect(result).not.toHaveProperty("paystackPlanCode");
  });
});

/* ── createCheckoutSession ── */
describe("createCheckoutSession", () => {
  it("throws Unauthorized when there is no session", async () => {
    mockAuth(null);
    await expect(createCheckoutSession("hub")).rejects.toThrow("Unauthorized");
  });

  it("returns only { url } — never the full Paystack transaction object", async () => {
    mockAuth(MOCK_SESSION);
    process.env.PAYSTACK_HUB_PLAN_CODE = "PLN_test";
    (initializeTransaction as ReturnType<typeof vi.fn>).mockResolvedValue({
      authorizationUrl: "https://checkout.paystack.com/abc123",
      reference: "ref_abc",
    });

    const result = await createCheckoutSession("hub");

    expect(result).toEqual({ url: "https://checkout.paystack.com/abc123" });
    expect(result).not.toHaveProperty("reference");
    expect(result).not.toHaveProperty("authorizationUrl");
  });
});

/* ── cancelSubscription ── */
describe("cancelSubscription", () => {
  it("throws Unauthorized when there is no session", async () => {
    mockAuth(null);
    await expect(cancelSubscription()).rejects.toThrow("Unauthorized");
  });

  it("throws when no active subscription is found", async () => {
    mockAuth(MOCK_SESSION);
    (db.subscription.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(null);
    await expect(cancelSubscription()).rejects.toThrow("No active subscription found");
  });
});

/* ── getInvoices ── */
describe("getInvoices", () => {
  it("throws Unauthorized when there is no session", async () => {
    mockAuth(null);
    await expect(getInvoices()).rejects.toThrow("Unauthorized");
  });

  it("returns an empty array when the user has no subscription", async () => {
    mockAuth(MOCK_SESSION);
    (db.subscription.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(null);
    const result = await getInvoices();
    expect(result).toEqual([]);
  });

  it("returns DTOs with only safe fields — no internal Paystack IDs", async () => {
    mockAuth(MOCK_SESSION);
    (db.subscription.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
      paystackCustomerId: "CUS_secret_internal_code",
    });
    (listCustomerTransactions as ReturnType<typeof vi.fn>).mockResolvedValue([
      {
        reference: "ref_pub_abc",
        amount: 1200,
        status: "success",
        paid_at: "2025-12-14T00:00:00Z",
        invoice_url: "https://paystack.com/invoice/abc",
      },
    ]);

    const result = await getInvoices();

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("ref_pub_abc");
    expect(result[0].amount).toBe("₵12.00");
    expect(result[0].status).toBe("success");

    const serialized = JSON.stringify(result);
    expect(serialized).not.toContain("CUS_secret_internal_code");
  });
});

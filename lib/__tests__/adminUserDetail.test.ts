import { beforeEach, describe, expect, it, vi } from "vitest";
import { getAdminUserDetail, type AdminDetailClient } from "../adminUserDetail";
import { ANALYTICS_METRIC } from "@/app/constants/analyticsMetrics";

const findUnique = vi.fn();
const aggregate = vi.fn();
const countBackupCodes = vi.fn();
const findLogins = vi.fn();
const findLinks = vi.fn();

const client = {
  user: { findUnique },
  analytics: { aggregate },
  twoFactorBackupCode: { count: countBackupCodes },
  loginEvent: { findMany: findLogins },
  link: { findMany: findLinks },
} as unknown as AdminDetailClient;

type DbUser = Record<string, unknown>;

function dbUser(overrides: DbUser = {}): DbUser {
  return {
    id: "usr_1",
    name: "Joel Osei",
    email: "joel@x.com",
    country: "GH",
    createdAt: new Date("2026-01-12T00:00:00Z"),
    lastActiveAt: new Date("2026-07-01T10:00:00Z"),
    suspendedAt: null,
    emailVerified: new Date("2026-01-12T00:00:00Z"),
    passwordHash: "bcrypt-hash",
    twoFactorEnabled: true,
    profile: { handle: "joel" },
    subscription: {
      planId: "pro",
      status: "active",
      currentPeriodEnd: new Date("2026-08-01T00:00:00Z"),
      cancelAtPeriodEnd: false,
      cardBrand: "visa",
      cardLast4: "4242",
      cardExpiry: "12/27",
    },
    accounts: [{ provider: "google" }],
    _count: { links: 6 },
    ...overrides,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  findUnique.mockResolvedValue(dbUser());
  aggregate.mockResolvedValue({ _sum: { count: 812 } });
  countBackupCodes.mockResolvedValue(8);
  findLogins.mockResolvedValue([
    {
      id: "login_1",
      createdAt: new Date("2026-07-01T10:00:00Z"),
      ip: "1.2.3.4",
      country: "GH",
      userAgent: "Chrome/126",
    },
  ]);
  findLinks.mockResolvedValue([
    {
      id: "lnk_1",
      title: "My Portfolio",
      createdAt: new Date("2026-05-01T00:00:00Z"),
      updatedAt: new Date("2026-06-15T00:00:00Z"),
    },
    {
      id: "lnk_2",
      title: "YouTube",
      createdAt: new Date("2026-05-02T00:00:00Z"),
      updatedAt: new Date("2026-05-02T00:00:30Z"),
    },
  ]);
});

describe("getAdminUserDetail", () => {
  it("returns null for an unknown user", async () => {
    findUnique.mockResolvedValue(null);
    expect(await getAdminUserDetail(client, "nope")).toBeNull();
  });

  it("assembles account, billing, usage, and security from real tables", async () => {
    const detail = await getAdminUserDetail(client, "usr_1");
    expect(detail).toMatchObject({
      id: "usr_1",
      handle: "@joel",
      plan: "pro",
      status: "active",
      links: 6,
      views30d: 812,
      billing: {
        plan: "pro",
        status: "active",
        renewsAt: "2026-08-01T00:00:00.000Z",
        cancelAtPeriodEnd: false,
        card: { brand: "visa", last4: "4242", expiry: "12/27" },
      },
      security: {
        twoFactorEnabled: true,
        backupCodesRemaining: 8,
        passwordSet: true,
        providers: ["google"],
        emailVerifiedAt: "2026-01-12T00:00:00.000Z",
      },
    });
    expect(detail?.security.recentLogins).toEqual([
      {
        id: "login_1",
        at: "2026-07-01T10:00:00.000Z",
        ip: "1.2.3.4",
        country: "GH",
        userAgent: "Chrome/126",
      },
    ]);
  });

  it("labels activity as updated only when timestamps meaningfully differ", async () => {
    const detail = await getAdminUserDetail(client, "usr_1");
    expect(detail?.recentActivity[0].meta).toMatch(/^Link updated · /);
    expect(detail?.recentActivity[1].meta).toMatch(/^Link added · /);
  });

  it("defaults billing for accounts that never subscribed", async () => {
    findUnique.mockResolvedValue(dbUser({ subscription: null }));
    const detail = await getAdminUserDetail(client, "usr_1");
    expect(detail?.plan).toBe("free");
    expect(detail?.billing).toEqual({
      plan: "free",
      status: "active",
      renewsAt: null,
      cancelAtPeriodEnd: false,
      card: null,
    });
  });

  it("derives suspended status and OAuth-only password state", async () => {
    findUnique.mockResolvedValue(
      dbUser({ suspendedAt: new Date(), passwordHash: null, emailVerified: null })
    );
    const detail = await getAdminUserDetail(client, "usr_1");
    expect(detail?.status).toBe("suspended");
    expect(detail?.security.passwordSet).toBe(false);
    expect(detail?.security.emailVerifiedAt).toBeNull();
  });

  it("windows views to the last 30 days of the profile_view metric", async () => {
    await getAdminUserDetail(client, "usr_1");
    const where = aggregate.mock.calls[0][0].where;
    expect(where.metric).toBe(ANALYTICS_METRIC.PROFILE_VIEW);
    expect(where.dimension).toBe("total");
    const sinceMs = Date.now() - where.date.gte.getTime();
    expect(sinceMs).toBeGreaterThan(29 * 24 * 3600 * 1000);
    expect(sinceMs).toBeLessThan(31 * 24 * 3600 * 1000);
  });
});

import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/auth", () => ({ auth: vi.fn() }));

vi.mock("@/lib/db", () => ({
  db: {
    profile: { findFirst: vi.fn(), update: vi.fn() },
    clickDaily: { findMany: vi.fn() },
  },
}));

vi.mock("@/lib/redis", () => ({
  redis: { get: vi.fn(), set: vi.fn(), del: vi.fn() },
}));

vi.mock("@/lib/r2", () => ({ deleteFromR2: vi.fn() }));

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { claimHandle, checkHandleAvailability, getClicksSeries } from "../links";

const asMock = (fn: unknown) => fn as ReturnType<typeof vi.fn>;
const SESSION = { user: { id: "user_123" } };

/** UTC-midnight date `n` days before today. */
function daysAgo(n: number): Date {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  d.setUTCDate(d.getUTCDate() - n);
  return d;
}

beforeEach(() => {
  vi.clearAllMocks();
  asMock(auth).mockResolvedValue(SESSION);
});

describe("claimHandle", () => {
  it("rejects reserved handles without touching the DB", async () => {
    const result = await claimHandle("billing");
    expect(result).toEqual({ error: "That handle is reserved. Try another." });
    expect(db.profile.findFirst).not.toHaveBeenCalled();
  });

  it("allows claiming a non-reserved, well-formed handle", async () => {
    asMock(db.profile.findFirst).mockResolvedValue(null);
    asMock(db.profile.update).mockResolvedValue({});
    const result = await claimHandle("joelosei");
    expect(result).toEqual({ success: true });
  });
});

describe("checkHandleAvailability", () => {
  it("reports reserved handles as unavailable without touching the DB", async () => {
    const result = await checkHandleAvailability("login");
    expect(result).toEqual({ available: false });
    expect(db.profile.findFirst).not.toHaveBeenCalled();
  });
});

describe("getClicksSeries", () => {
  it("throws when there is no session", async () => {
    asMock(auth).mockResolvedValueOnce(null);
    await expect(getClicksSeries(7)).rejects.toThrow("Unauthorized");
  });

  it("returns a fixed-length, 0-filled series scoped to the user", async () => {
    asMock(db.clickDaily.findMany).mockResolvedValue([
      { day: daysAgo(0), count: 5 },
      { day: daysAgo(3), count: 2 },
    ]);

    const series = await getClicksSeries(7);

    expect(series).toHaveLength(7);
    expect(series).toEqual([0, 0, 0, 2, 0, 0, 5]);
    expect(asMock(db.clickDaily.findMany).mock.calls[0][0]).toMatchObject({
      where: { userId: "user_123" },
    });
  });

  it("returns all zeros and never throws when the query fails", async () => {
    asMock(db.clickDaily.findMany).mockRejectedValue(new Error("db down"));
    const series = await getClicksSeries(7);
    expect(series).toEqual(new Array(7).fill(0));
  });
});

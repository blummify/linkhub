import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/auth", () => ({ auth: vi.fn() }));

vi.mock("@/lib/db", () => ({
  db: { profile: { findFirst: vi.fn(), update: vi.fn() } },
}));

vi.mock("@/lib/redis", () => ({
  redis: { get: vi.fn(), set: vi.fn(), del: vi.fn() },
}));

vi.mock("@/lib/r2", () => ({ deleteFromR2: vi.fn() }));

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { claimHandle, checkHandleAvailability } from "../links";

const asMock = (fn: unknown) => fn as ReturnType<typeof vi.fn>;
const SESSION = { user: { id: "user_123" } };

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

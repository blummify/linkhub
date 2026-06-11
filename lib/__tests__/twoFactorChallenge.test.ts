import { describe, it, expect, vi, beforeEach } from "vitest";
import { createHash } from "crypto";

vi.mock("@/lib/db", () => ({
  db: {
    verificationToken: {
      deleteMany: vi.fn(),
      create: vi.fn(),
    },
  },
}));

import { db } from "@/lib/db";
import { createPendingTwoFactorToken } from "../twoFactorChallenge";

describe("createPendingTwoFactorToken", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns a 64-char hex token", async () => {
    const token = await createPendingTwoFactorToken("user-1");
    expect(token).toMatch(/^[a-f0-9]{64}$/);
  });

  it("returns a different token on each call", async () => {
    const a = await createPendingTwoFactorToken("user-1");
    const b = await createPendingTwoFactorToken("user-1");
    expect(a).not.toBe(b);
  });

  it("clears any existing pending challenge for the user before creating a new one", async () => {
    await createPendingTwoFactorToken("user-1");

    expect(db.verificationToken.deleteMany).toHaveBeenCalledWith({
      where: { identifier: "2fa:login:user-1" },
    });
  });

  it("stores a sha256 hash of the returned token, not the raw token", async () => {
    const token = await createPendingTwoFactorToken("user-1");
    const expectedHash = createHash("sha256").update(token).digest("hex");

    expect(db.verificationToken.create).toHaveBeenCalledWith({
      data: {
        identifier: "2fa:login:user-1",
        token: expectedHash,
        expires: expect.any(Date),
      },
    });
  });

  it("sets an expiry roughly 5 minutes in the future", async () => {
    const before = Date.now();
    await createPendingTwoFactorToken("user-1");
    const after = Date.now();

    const call = (db.verificationToken.create as ReturnType<typeof vi.fn>).mock.calls[0][0] as {
      data: { expires: Date };
    };
    const expiresAt = call.data.expires.getTime();

    expect(expiresAt).toBeGreaterThanOrEqual(before + 5 * 60 * 1000 - 1000);
    expect(expiresAt).toBeLessThanOrEqual(after + 5 * 60 * 1000 + 1000);
  });
});

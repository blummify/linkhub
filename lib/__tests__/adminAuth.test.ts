import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/db", () => ({
  db: { user: { findUnique: vi.fn() } },
}));
vi.mock("bcryptjs", () => ({
  default: { compare: vi.fn() },
}));
vi.mock("@/lib/redis", () => ({
  redis: { get: vi.fn(), incr: vi.fn(), expire: vi.fn() },
}));

import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { redis } from "@/lib/redis";
import { verifySuperAdminCredentials } from "../adminAuth";

const findUnique = db.user.findUnique as ReturnType<typeof vi.fn>;
const compare = bcrypt.compare as unknown as ReturnType<typeof vi.fn>;
const redisGet = redis.get as ReturnType<typeof vi.fn>;
const redisIncr = redis.incr as ReturnType<typeof vi.fn>;

const superAdminRow = {
  id: "u1",
  email: "admin@example.com",
  name: "Admin",
  role: "SUPER_ADMIN",
  passwordHash: "$2b$10$realhash",
  emailVerified: new Date("2026-01-01"),
};

beforeEach(() => {
  vi.clearAllMocks();
  redisGet.mockResolvedValue(null); // not rate limited
  redisIncr.mockResolvedValue(1);
  compare.mockResolvedValue(false);
});

describe("verifySuperAdminCredentials", () => {
  it("rejects malformed input without touching the database", async () => {
    const result = await verifySuperAdminCredentials("not-an-email", "pw");
    expect(result).toBeNull();
    expect(findUnique).not.toHaveBeenCalled();
  });

  it("rejects when the per-email rate limit is exceeded, before any DB lookup", async () => {
    redisGet.mockResolvedValue(10);
    const result = await verifySuperAdminCredentials("admin@example.com", "pw");
    expect(result).toBeNull();
    expect(findUnique).not.toHaveBeenCalled();
    expect(compare).not.toHaveBeenCalled();
  });

  it("normalises the email to lower case for the lookup", async () => {
    findUnique.mockResolvedValue(null);
    await verifySuperAdminCredentials("Admin@Example.COM", "pw");
    expect(findUnique).toHaveBeenCalledWith({ where: { email: "admin@example.com" } });
  });

  it("runs bcrypt.compare even for an unknown email (constant-time, no enumeration)", async () => {
    findUnique.mockResolvedValue(null);
    const result = await verifySuperAdminCredentials("ghost@example.com", "pw");
    expect(result).toBeNull();
    expect(compare).toHaveBeenCalledWith("pw", expect.any(String));
    expect(redisIncr).toHaveBeenCalled(); // failed attempt recorded
  });

  it("rejects a correct password for a non-super-admin role without leaking the reason", async () => {
    findUnique.mockResolvedValue({ ...superAdminRow, role: "PRO" });
    compare.mockResolvedValue(true);
    const result = await verifySuperAdminCredentials("admin@example.com", "pw");
    expect(result).toBeNull();
    expect(redisIncr).toHaveBeenCalled();
  });

  it("rejects a super-admin with a wrong password", async () => {
    findUnique.mockResolvedValue(superAdminRow);
    compare.mockResolvedValue(false);
    const result = await verifySuperAdminCredentials("admin@example.com", "pw");
    expect(result).toBeNull();
  });

  it("rejects an OAuth-only account that has no password hash", async () => {
    findUnique.mockResolvedValue({ ...superAdminRow, passwordHash: null });
    const result = await verifySuperAdminCredentials("admin@example.com", "pw");
    expect(result).toBeNull();
  });

  it("returns the user for valid super-admin credentials and records no failure", async () => {
    findUnique.mockResolvedValue(superAdminRow);
    compare.mockResolvedValue(true);
    const result = await verifySuperAdminCredentials("admin@example.com", "pw");
    expect(result).toEqual({
      id: "u1",
      email: "admin@example.com",
      name: "Admin",
      role: "SUPER_ADMIN",
      emailVerified: superAdminRow.emailVerified,
    });
    expect(redisIncr).not.toHaveBeenCalled();
  });

  it("fails open and still authenticates when Redis is unavailable", async () => {
    redisGet.mockRejectedValue(new Error("redis down"));
    redisIncr.mockRejectedValue(new Error("redis down"));
    findUnique.mockResolvedValue(superAdminRow);
    compare.mockResolvedValue(true);
    const result = await verifySuperAdminCredentials("admin@example.com", "pw");
    expect(result?.id).toBe("u1");
  });
});

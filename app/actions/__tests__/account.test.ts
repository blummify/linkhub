import { describe, it, expect, vi, beforeEach } from "vitest";
import { createHash } from "crypto";

/* ── Mocks ── */
vi.mock("@/auth", () => ({ auth: vi.fn() }));

vi.mock("@/lib/db", () => ({
  db: {
    user: { findUnique: vi.fn(), update: vi.fn(), delete: vi.fn() },
    emailVerification: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      deleteMany: vi.fn(),
    },
    subscription: { findUnique: vi.fn() },
    $transaction: vi.fn().mockResolvedValue([]),
  },
}));

vi.mock("@/lib/redis", () => ({
  redis: { get: vi.fn(), set: vi.fn(), ttl: vi.fn(), del: vi.fn() },
}));

vi.mock("@/lib/postly", () => ({ postly: { send: vi.fn().mockResolvedValue(undefined) } }));

vi.mock("@/lib/paystack", () => ({ disableSubscription: vi.fn() }));

vi.mock("bcryptjs", () => ({
  default: { compare: vi.fn(), hash: vi.fn().mockResolvedValue("new-hash") },
}));

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { redis } from "@/lib/redis";
import { postly } from "@/lib/postly";
import { disableSubscription } from "@/lib/paystack";
import bcrypt from "bcryptjs";
import {
  updateName,
  requestEmailChange,
  confirmEmailChange,
  changePassword,
  setPassword,
  armOAuthDeletion,
  deleteAccount,
} from "../account";

const SESSION = { user: { id: "user_123", email: "joel@linkhub.co" } };
const asMock = (fn: unknown) => fn as ReturnType<typeof vi.fn>;
const mockAuth = (s: typeof SESSION | null) => asMock(auth).mockResolvedValue(s);

beforeEach(() => {
  vi.clearAllMocks();
  asMock(bcrypt.hash).mockResolvedValue("new-hash");
  asMock(db.$transaction).mockResolvedValue([]);
});

/* ── auth gating ── */
describe("auth gating", () => {
  it("throws Unauthorized without a session", async () => {
    mockAuth(null);
    await expect(updateName("x")).rejects.toThrow("Unauthorized");
    await expect(deleteAccount({ typedEmail: "x" })).rejects.toThrow("Unauthorized");
  });
});

/* ── updateName ── */
describe("updateName", () => {
  it("rejects an empty name", async () => {
    mockAuth(SESSION);
    const r = await updateName("   ");
    expect("error" in r).toBe(true);
    expect(db.user.update).not.toHaveBeenCalled();
  });

  it("persists a valid name", async () => {
    mockAuth(SESSION);
    const r = await updateName("Joel O.");
    expect(r).toEqual({ success: true });
    expect(db.user.update).toHaveBeenCalledWith({ where: { id: "user_123" }, data: { name: "Joel O." } });
  });
});

/* ── requestEmailChange ── */
describe("requestEmailChange", () => {
  it("rejects when the new email matches the current one", async () => {
    mockAuth(SESSION);
    asMock(db.user.findUnique).mockResolvedValueOnce({ name: "Joel", email: "joel@linkhub.co" });
    const r = await requestEmailChange("JOEL@linkhub.co");
    expect(r).toEqual({ error: "That's already your email address." });
  });

  it("rejects an email already used by another account", async () => {
    mockAuth(SESSION);
    asMock(db.user.findUnique)
      .mockResolvedValueOnce({ name: "Joel", email: "joel@linkhub.co" }) // current user
      .mockResolvedValueOnce({ id: "other" }); // uniqueness check → taken
    const r = await requestEmailChange("taken@linkhub.co");
    expect(r).toEqual({ error: "That email is already in use by another account." });
    expect(db.user.update).not.toHaveBeenCalled();
  });

  it("writes pendingEmail, creates a code, and emails the NEW address", async () => {
    mockAuth(SESSION);
    asMock(db.user.findUnique)
      .mockResolvedValueOnce({ name: "Joel", email: "joel@linkhub.co" })
      .mockResolvedValueOnce(null);
    asMock(redis.get).mockResolvedValue(null);

    const r = await requestEmailChange("new@linkhub.co");

    expect(r).toEqual({ success: true });
    expect(db.user.update).toHaveBeenCalledWith({
      where: { id: "user_123" },
      data: { pendingEmail: "new@linkhub.co" },
    });
    expect(db.emailVerification.create).toHaveBeenCalled();
    expect(postly.send).toHaveBeenCalledWith(expect.objectContaining({ to: ["new@linkhub.co"] }));
  });
});

/* ── confirmEmailChange ── */
describe("confirmEmailChange", () => {
  it("errors when there is no pending change", async () => {
    mockAuth(SESSION);
    asMock(db.user.findUnique).mockResolvedValue({ pendingEmail: null });
    const r = await confirmEmailChange("123456");
    expect(r).toEqual({ error: "No pending email change to confirm." });
  });

  it("deletes the record and errors on an expired code", async () => {
    mockAuth(SESSION);
    asMock(db.user.findUnique).mockResolvedValue({ pendingEmail: "new@linkhub.co" });
    asMock(db.emailVerification.findUnique).mockResolvedValue({
      code: createHash("sha256").update("123456").digest("hex"),
      expiresAt: new Date(Date.now() - 1000),
      attempts: 0,
    });
    const r = await confirmEmailChange("123456");
    expect(r).toEqual({ error: "Code expired. Please request a new one." });
    expect(db.emailVerification.delete).toHaveBeenCalled();
  });

  it("increments attempts on a wrong code and deletes at the 5th", async () => {
    mockAuth(SESSION);
    asMock(db.user.findUnique).mockResolvedValue({ pendingEmail: "new@linkhub.co" });
    asMock(db.emailVerification.findUnique).mockResolvedValue({
      code: createHash("sha256").update("999999").digest("hex"),
      expiresAt: new Date(Date.now() + 60_000),
      attempts: 4,
    });
    const r = await confirmEmailChange("123456");
    expect(r).toEqual({ error: "Too many incorrect attempts. Please request a new code." });
    expect(db.emailVerification.delete).toHaveBeenCalled();
    expect(db.emailVerification.update).not.toHaveBeenCalled();
  });

  it("promotes pendingEmail → email in a transaction on the correct code", async () => {
    mockAuth(SESSION);
    asMock(db.user.findUnique).mockResolvedValue({ pendingEmail: "new@linkhub.co" });
    asMock(db.emailVerification.findUnique).mockResolvedValue({
      code: createHash("sha256").update("123456").digest("hex"),
      expiresAt: new Date(Date.now() + 60_000),
      attempts: 0,
    });

    const r = await confirmEmailChange("123456");

    expect(r).toEqual({ success: true, email: "new@linkhub.co" });
    expect(db.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "user_123" },
        data: expect.objectContaining({ email: "new@linkhub.co", pendingEmail: null }),
      })
    );
    expect(db.$transaction).toHaveBeenCalled();
  });
});

/* ── changePassword / setPassword ── */
describe("password", () => {
  it("changePassword rejects a wrong current password", async () => {
    mockAuth(SESSION);
    asMock(db.user.findUnique).mockResolvedValue({ passwordHash: "hash" });
    asMock(bcrypt.compare).mockResolvedValue(false);
    const r = await changePassword("wrong", "Newpass123!");
    expect(r).toEqual({ error: "Your current password is incorrect." });
    expect(db.user.update).not.toHaveBeenCalled();
  });

  it("changePassword updates with a valid current + new password", async () => {
    mockAuth(SESSION);
    asMock(db.user.findUnique).mockResolvedValue({ passwordHash: "hash" });
    asMock(bcrypt.compare)
      .mockResolvedValueOnce(true) // current matches
      .mockResolvedValueOnce(false); // new differs from old
    const r = await changePassword("OldPass123!", "Newpass123!");
    expect(r).toEqual({ success: true });
    expect(db.user.update).toHaveBeenCalledWith({ where: { id: "user_123" }, data: { passwordHash: "new-hash" } });
  });

  it("setPassword refuses when a password already exists", async () => {
    mockAuth(SESSION);
    asMock(db.user.findUnique).mockResolvedValue({ passwordHash: "hash" });
    const r = await setPassword("Newpass123!");
    expect("error" in r).toBe(true);
    expect(db.user.update).not.toHaveBeenCalled();
  });

  it("setPassword sets a password for an OAuth-only user", async () => {
    mockAuth(SESSION);
    asMock(db.user.findUnique).mockResolvedValue({ passwordHash: null });
    const r = await setPassword("Newpass123!");
    expect(r).toEqual({ success: true });
    expect(db.user.update).toHaveBeenCalledWith({ where: { id: "user_123" }, data: { passwordHash: "new-hash" } });
  });
});

/* ── deletion ── */
describe("account deletion", () => {
  it("armOAuthDeletion refuses credential users", async () => {
    mockAuth(SESSION);
    asMock(db.user.findUnique).mockResolvedValue({ passwordHash: "hash" });
    const r = await armOAuthDeletion();
    expect("error" in r).toBe(true);
    expect(redis.set).not.toHaveBeenCalled();
  });

  it("armOAuthDeletion stores a nonce for OAuth-only users", async () => {
    mockAuth(SESSION);
    asMock(db.user.findUnique).mockResolvedValue({ passwordHash: null });
    const r = await armOAuthDeletion();
    expect("nonce" in r).toBe(true);
    expect(redis.set).toHaveBeenCalledWith(expect.stringContaining("del-reauth:"), "user_123", { ex: 600 });
  });

  it("rejects when the typed email doesn't match (intent gate)", async () => {
    mockAuth(SESSION);
    asMock(db.user.findUnique).mockResolvedValue({ email: "joel@linkhub.co", passwordHash: "hash" });
    const r = await deleteAccount({ typedEmail: "wrong@linkhub.co", password: "x" });
    expect(r).toEqual({ error: "The email you typed doesn't match your account email." });
    expect(db.user.delete).not.toHaveBeenCalled();
  });

  it("rejects a credential user with a wrong password", async () => {
    mockAuth(SESSION);
    asMock(db.user.findUnique).mockResolvedValue({ email: "joel@linkhub.co", passwordHash: "hash" });
    asMock(bcrypt.compare).mockResolvedValue(false);
    const r = await deleteAccount({ typedEmail: "joel@linkhub.co", password: "wrong" });
    expect(r).toEqual({ error: "Your password is incorrect." });
    expect(db.user.delete).not.toHaveBeenCalled();
  });

  it("deletes a credential user and cancels Paystack (non-blocking)", async () => {
    mockAuth(SESSION);
    asMock(db.user.findUnique).mockResolvedValue({ email: "joel@linkhub.co", passwordHash: "hash" });
    asMock(bcrypt.compare).mockResolvedValue(true);
    asMock(db.subscription.findUnique).mockResolvedValue({
      paystackSubscriptionId: "SUB_x",
      authorizationCode: "AUTH_x",
    });

    const r = await deleteAccount({ typedEmail: "joel@linkhub.co", password: "right" });

    expect(r).toEqual({ success: true });
    expect(disableSubscription).toHaveBeenCalledWith({ code: "SUB_x", token: "AUTH_x" });
    expect(db.user.delete).toHaveBeenCalledWith({ where: { id: "user_123" } });
  });

  it("proceeds with deletion even if Paystack cancel throws", async () => {
    mockAuth(SESSION);
    asMock(db.user.findUnique).mockResolvedValue({ email: "joel@linkhub.co", passwordHash: "hash" });
    asMock(bcrypt.compare).mockResolvedValue(true);
    asMock(db.subscription.findUnique).mockResolvedValue({ paystackSubscriptionId: "SUB_x", authorizationCode: null });
    asMock(disableSubscription).mockRejectedValue(new Error("paystack down"));

    const r = await deleteAccount({ typedEmail: "joel@linkhub.co", password: "right" });

    expect(r).toEqual({ success: true });
    expect(db.user.delete).toHaveBeenCalled();
  });

  it("rejects an OAuth re-prompt that resolved to a different account", async () => {
    mockAuth(SESSION);
    asMock(db.user.findUnique).mockResolvedValue({ email: "joel@linkhub.co", passwordHash: null });
    asMock(redis.get).mockResolvedValue("a_different_user");
    const r = await deleteAccount({ typedEmail: "joel@linkhub.co", nonce: "abc" });
    expect(r).toEqual({ error: "That Google account doesn't match this account. Deletion cancelled." });
    expect(redis.del).toHaveBeenCalledWith("del-reauth:abc");
    expect(db.user.delete).not.toHaveBeenCalled();
  });

  it("deletes an OAuth-only user when the nonce binds to the same user", async () => {
    mockAuth(SESSION);
    asMock(db.user.findUnique).mockResolvedValue({ email: "joel@linkhub.co", passwordHash: null });
    asMock(redis.get).mockResolvedValue("user_123");
    asMock(db.subscription.findUnique).mockResolvedValue(null);

    const r = await deleteAccount({ typedEmail: "joel@linkhub.co", nonce: "abc" });

    expect(r).toEqual({ success: true });
    expect(redis.del).toHaveBeenCalledWith("del-reauth:abc");
    expect(db.user.delete).toHaveBeenCalledWith({ where: { id: "user_123" } });
  });
});

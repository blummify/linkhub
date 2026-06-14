import { describe, it, expect, vi, beforeEach } from "vitest";
import { createHash } from "crypto";

/* ── Mocks ── */
vi.mock("@/auth", () => ({
  auth: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  db: {
    user: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    twoFactorBackupCode: {
      createMany: vi.fn(),
      update: vi.fn(),
      deleteMany: vi.fn(),
    },
    verificationToken: {
      findUnique: vi.fn(),
      create: vi.fn(),
      deleteMany: vi.fn(),
      delete: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

vi.mock("@/lib/redis", () => ({
  redis: {
    get: vi.fn(),
    set: vi.fn(),
    del: vi.fn(),
  },
}));

vi.mock("@/lib/totp", () => ({
  generateTotpSecret: vi.fn(),
  generateOtpAuthUrl: vi.fn(),
  verifyTotpCode: vi.fn(),
  encryptTotpSecret: vi.fn(),
  decryptTotpSecret: vi.fn(),
}));

vi.mock("bcryptjs", () => ({
  default: {
    hash: vi.fn(),
    compare: vi.fn(),
  },
}));

vi.mock("qrcode", () => ({
  default: {
    toDataURL: vi.fn(),
  },
}));

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { redis } from "@/lib/redis";
import {
  generateTotpSecret,
  generateOtpAuthUrl,
  verifyTotpCode,
  decryptTotpSecret,
  encryptTotpSecret,
} from "@/lib/totp";
import bcrypt from "bcryptjs";
import QRCode from "qrcode";
import { setup2FA, enable2FA, disable2FA, verifyTotpLogin } from "../twoFactor";

const MOCK_SESSION = { user: { id: "user_123", email: "joel@example.com" } };
const BACKUP_CODE_RE = /^[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{5}-[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{5}$/;

function mockAuth(session: typeof MOCK_SESSION | null) {
  (auth as ReturnType<typeof vi.fn>).mockResolvedValue(session);
}

beforeEach(() => {
  vi.clearAllMocks();
});

/* ── setup2FA ── */
describe("setup2FA", () => {
  it("returns an error when there is no session", async () => {
    mockAuth(null);
    const result = await setup2FA();
    expect(result).toEqual({ error: "Not authenticated" });
  });

  it("returns an error when 2FA is already enabled", async () => {
    mockAuth(MOCK_SESSION);
    (db.user.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
      twoFactorEnabled: true,
      email: "joel@example.com",
    });

    const result = await setup2FA();
    expect(result).toEqual({ error: "2FA is already enabled" });
  });

  it("generates a secret, stashes it in redis, and returns a QR code", async () => {
    mockAuth(MOCK_SESSION);
    (db.user.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
      twoFactorEnabled: false,
      email: "joel@example.com",
    });
    (generateTotpSecret as ReturnType<typeof vi.fn>).mockReturnValue("SECRET123");
    (generateOtpAuthUrl as ReturnType<typeof vi.fn>).mockReturnValue("otpauth://totp/example");
    (redis.set as ReturnType<typeof vi.fn>).mockResolvedValue("OK");
    (QRCode.toDataURL as ReturnType<typeof vi.fn>).mockResolvedValue("data:image/png;base64,abc");

    const result = await setup2FA();

    expect(redis.set).toHaveBeenCalledWith("2fa:setup:user_123", "SECRET123", { ex: 600 });
    expect(generateOtpAuthUrl).toHaveBeenCalledWith("joel@example.com", "SECRET123");
    expect(QRCode.toDataURL).toHaveBeenCalledWith("otpauth://totp/example", { width: 200 });
    expect(result).toEqual({ qrCodeDataUrl: "data:image/png;base64,abc", manualKey: "SECRET123" });
  });

  it("returns an error when redis is unavailable", async () => {
    mockAuth(MOCK_SESSION);
    (db.user.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
      twoFactorEnabled: false,
      email: "joel@example.com",
    });
    (generateTotpSecret as ReturnType<typeof vi.fn>).mockReturnValue("SECRET123");
    (generateOtpAuthUrl as ReturnType<typeof vi.fn>).mockReturnValue("otpauth://totp/example");
    (redis.set as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("redis down"));

    const result = await setup2FA();
    expect(result).toEqual({ error: "Could not initiate 2FA setup. Please try again." });
  });
});

/* ── enable2FA ── */
describe("enable2FA", () => {
  it("returns an error when there is no session", async () => {
    mockAuth(null);
    const result = await enable2FA("123456");
    expect(result).toEqual({ error: "Not authenticated" });
  });

  it("returns an error when 2FA is already enabled", async () => {
    mockAuth(MOCK_SESSION);
    (db.user.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({ twoFactorEnabled: true });

    const result = await enable2FA("123456");
    expect(result).toEqual({ error: "2FA is already enabled" });
  });

  it("returns an error when the setup session has expired", async () => {
    mockAuth(MOCK_SESSION);
    (db.user.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({ twoFactorEnabled: false });
    (redis.get as ReturnType<typeof vi.fn>).mockResolvedValue(null);

    const result = await enable2FA("123456");
    expect(result).toEqual({ error: "Setup session expired. Please start again." });
  });

  it("returns an error when redis lookup fails", async () => {
    mockAuth(MOCK_SESSION);
    (db.user.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({ twoFactorEnabled: false });
    (redis.get as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("redis down"));

    const result = await enable2FA("123456");
    expect(result).toEqual({ error: "Setup session expired. Please start again." });
  });

  it("returns an error for an invalid TOTP code", async () => {
    mockAuth(MOCK_SESSION);
    (db.user.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({ twoFactorEnabled: false });
    (redis.get as ReturnType<typeof vi.fn>).mockResolvedValue("SECRET123");
    (verifyTotpCode as ReturnType<typeof vi.fn>).mockReturnValue(false);

    const result = await enable2FA("000000");
    expect(result).toEqual({ error: "Invalid code. Check your authenticator app and try again." });
  });

  it("enables 2FA, stores hashed backup codes, and returns plaintext codes", async () => {
    mockAuth(MOCK_SESSION);
    (db.user.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({ twoFactorEnabled: false });
    (redis.get as ReturnType<typeof vi.fn>).mockResolvedValue("SECRET123");
    (verifyTotpCode as ReturnType<typeof vi.fn>).mockReturnValue(true);
    (bcrypt.hash as ReturnType<typeof vi.fn>).mockResolvedValue("hashed");
    (encryptTotpSecret as ReturnType<typeof vi.fn>).mockReturnValue("encrypted-secret");
    (db.user.update as ReturnType<typeof vi.fn>).mockReturnValue("user-update-op");
    (db.twoFactorBackupCode.createMany as ReturnType<typeof vi.fn>).mockReturnValue("create-many-op");
    (db.$transaction as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);
    (redis.del as ReturnType<typeof vi.fn>).mockResolvedValue(1);

    const result = await enable2FA("123456");

    if (!("backupCodes" in result)) throw new Error("expected backupCodes in result");
    expect(result.backupCodes).toHaveLength(8);
    result.backupCodes.forEach((code) => expect(code).toMatch(BACKUP_CODE_RE));

    expect(db.user.update).toHaveBeenCalledWith({
      where: { id: "user_123" },
      data: { twoFactorSecret: "encrypted-secret", twoFactorEnabled: true },
    });
    expect(db.twoFactorBackupCode.createMany).toHaveBeenCalled();
    expect(db.$transaction).toHaveBeenCalledWith(["user-update-op", "create-many-op"]);
    expect(redis.del).toHaveBeenCalledWith("2fa:setup:user_123");
  });
});

/* ── disable2FA ── */
describe("disable2FA", () => {
  it("returns an error when there is no session", async () => {
    mockAuth(null);
    const result = await disable2FA("123456");
    expect(result).toEqual({ error: "Not authenticated" });
  });

  it("returns an error when 2FA is not enabled", async () => {
    mockAuth(MOCK_SESSION);
    (db.user.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
      twoFactorEnabled: false,
      twoFactorSecret: null,
      backupCodes: [],
    });

    const result = await disable2FA("123456");
    expect(result).toEqual({ error: "2FA is not enabled" });
  });

  it("disables 2FA with a valid TOTP code", async () => {
    mockAuth(MOCK_SESSION);
    (db.user.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
      twoFactorEnabled: true,
      twoFactorSecret: "encrypted-secret",
      backupCodes: [],
    });
    (decryptTotpSecret as ReturnType<typeof vi.fn>).mockReturnValue("SECRET123");
    (verifyTotpCode as ReturnType<typeof vi.fn>).mockReturnValue(true);
    (db.user.update as ReturnType<typeof vi.fn>).mockReturnValue("user-update-op");
    (db.twoFactorBackupCode.deleteMany as ReturnType<typeof vi.fn>).mockReturnValue("delete-many-op");
    (db.$transaction as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);

    const result = await disable2FA("123456");

    expect(result).toEqual({ success: true });
    expect(db.user.update).toHaveBeenCalledWith({
      where: { id: "user_123" },
      data: { twoFactorSecret: null, twoFactorEnabled: false },
    });
    expect(db.twoFactorBackupCode.deleteMany).toHaveBeenCalledWith({ where: { userId: "user_123" } });
    expect(db.$transaction).toHaveBeenCalledWith(["user-update-op", "delete-many-op"]);
  });

  it("disables 2FA with a valid backup code when the TOTP code is wrong", async () => {
    mockAuth(MOCK_SESSION);
    (db.user.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
      twoFactorEnabled: true,
      twoFactorSecret: "encrypted-secret",
      backupCodes: [{ id: "backup_1", codeHash: "hash_1" }],
    });
    (decryptTotpSecret as ReturnType<typeof vi.fn>).mockReturnValue("SECRET123");
    (verifyTotpCode as ReturnType<typeof vi.fn>).mockReturnValue(false);
    (bcrypt.compare as ReturnType<typeof vi.fn>).mockResolvedValue(true);
    (db.twoFactorBackupCode.update as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);
    (db.user.update as ReturnType<typeof vi.fn>).mockReturnValue("user-update-op");
    (db.twoFactorBackupCode.deleteMany as ReturnType<typeof vi.fn>).mockReturnValue("delete-many-op");
    (db.$transaction as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);

    const result = await disable2FA("ABCDE-FGHJK");

    expect(result).toEqual({ success: true });
    expect(db.twoFactorBackupCode.update).toHaveBeenCalledWith({
      where: { id: "backup_1" },
      data: { usedAt: expect.any(Date) },
    });
  });

  it("returns an error when neither the TOTP code nor any backup code matches", async () => {
    mockAuth(MOCK_SESSION);
    (db.user.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
      twoFactorEnabled: true,
      twoFactorSecret: "encrypted-secret",
      backupCodes: [{ id: "backup_1", codeHash: "hash_1" }],
    });
    (decryptTotpSecret as ReturnType<typeof vi.fn>).mockReturnValue("SECRET123");
    (verifyTotpCode as ReturnType<typeof vi.fn>).mockReturnValue(false);
    (bcrypt.compare as ReturnType<typeof vi.fn>).mockResolvedValue(false);

    const result = await disable2FA("000000");
    expect(result).toEqual({ error: "Invalid code." });
    expect(db.$transaction).not.toHaveBeenCalled();
  });
});

/* ── verifyTotpLogin ── */
describe("verifyTotpLogin", () => {
  const PENDING_TOKEN = "a".repeat(64);

  it("returns an error when the pending token is unknown", async () => {
    (db.verificationToken.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(null);

    const result = await verifyTotpLogin(PENDING_TOKEN, "123456");
    expect(result).toEqual({ error: "Session expired. Please log in again." });
  });

  it("returns an error when the token has expired", async () => {
    (db.verificationToken.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
      identifier: "2fa:login:user_123",
      token: "hash",
      expires: new Date(Date.now() - 1000),
    });

    const result = await verifyTotpLogin(PENDING_TOKEN, "123456");
    expect(result).toEqual({ error: "Session expired. Please log in again." });
  });

  it("returns an error when the user record is incomplete", async () => {
    (db.verificationToken.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
      identifier: "2fa:login:user_123",
      token: "hash",
      expires: new Date(Date.now() + 60_000),
    });
    (db.user.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(null);

    const result = await verifyTotpLogin(PENDING_TOKEN, "123456");
    expect(result).toEqual({ error: "Session expired. Please log in again." });
  });

  it("returns an error for an invalid code", async () => {
    (db.verificationToken.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
      identifier: "2fa:login:user_123",
      token: "hash",
      expires: new Date(Date.now() + 60_000),
    });
    (db.user.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
      email: "joel@example.com",
      twoFactorSecret: "encrypted-secret",
      backupCodes: [],
    });
    (decryptTotpSecret as ReturnType<typeof vi.fn>).mockReturnValue("SECRET123");
    (verifyTotpCode as ReturnType<typeof vi.fn>).mockReturnValue(false);

    const result = await verifyTotpLogin(PENDING_TOKEN, "000000");
    expect(result).toEqual({ error: "Invalid code." });
  });

  it("issues an auto-login token on a valid TOTP code and clears the pending token", async () => {
    (db.verificationToken.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
      identifier: "2fa:login:user_123",
      token: "hash",
      expires: new Date(Date.now() + 60_000),
    });
    (db.user.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
      email: "joel@example.com",
      twoFactorSecret: "encrypted-secret",
      backupCodes: [],
    });
    (decryptTotpSecret as ReturnType<typeof vi.fn>).mockReturnValue("SECRET123");
    (verifyTotpCode as ReturnType<typeof vi.fn>).mockReturnValue(true);
    (db.verificationToken.delete as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);
    (db.verificationToken.deleteMany as ReturnType<typeof vi.fn>).mockResolvedValue({ count: 0 });
    (db.verificationToken.create as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);

    const result = await verifyTotpLogin(PENDING_TOKEN, "123456");

    if (!("autoLoginToken" in result)) throw new Error("expected autoLoginToken in result");
    expect(result.email).toBe("joel@example.com");
    expect(result.autoLoginToken).toMatch(/^[a-f0-9]{64}$/);
    const tokenHash = createHash("sha256").update(PENDING_TOKEN).digest("hex");
    expect(db.verificationToken.delete).toHaveBeenCalledWith({ where: { token: tokenHash } });
    expect(db.verificationToken.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ identifier: "auto:joel@example.com" }),
      })
    );
  });

  it("falls back to a backup code when the TOTP code is wrong", async () => {
    (db.verificationToken.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
      identifier: "2fa:login:user_123",
      token: "hash",
      expires: new Date(Date.now() + 60_000),
    });
    (db.user.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
      email: "joel@example.com",
      twoFactorSecret: "encrypted-secret",
      backupCodes: [{ id: "backup_1", codeHash: "hash_1" }],
    });
    (decryptTotpSecret as ReturnType<typeof vi.fn>).mockReturnValue("SECRET123");
    (verifyTotpCode as ReturnType<typeof vi.fn>).mockReturnValue(false);
    (bcrypt.compare as ReturnType<typeof vi.fn>).mockResolvedValue(true);
    (db.twoFactorBackupCode.update as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);
    (db.verificationToken.delete as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);
    (db.verificationToken.deleteMany as ReturnType<typeof vi.fn>).mockResolvedValue({ count: 0 });
    (db.verificationToken.create as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);

    const result = await verifyTotpLogin(PENDING_TOKEN, "ABCDE-FGHJK");

    if (!("autoLoginToken" in result)) throw new Error("expected autoLoginToken in result");
    expect(db.twoFactorBackupCode.update).toHaveBeenCalledWith({
      where: { id: "backup_1" },
      data: { usedAt: expect.any(Date) },
    });
  });

  it("returns an error when neither the TOTP code nor any backup code matches", async () => {
    (db.verificationToken.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
      identifier: "2fa:login:user_123",
      token: "hash",
      expires: new Date(Date.now() + 60_000),
    });
    (db.user.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
      email: "joel@example.com",
      twoFactorSecret: "encrypted-secret",
      backupCodes: [{ id: "backup_1", codeHash: "hash_1" }],
    });
    (decryptTotpSecret as ReturnType<typeof vi.fn>).mockReturnValue("SECRET123");
    (verifyTotpCode as ReturnType<typeof vi.fn>).mockReturnValue(false);
    (bcrypt.compare as ReturnType<typeof vi.fn>).mockResolvedValue(false);

    const result = await verifyTotpLogin(PENDING_TOKEN, "000000");
    expect(result).toEqual({ error: "Invalid code." });
    expect(db.verificationToken.delete).not.toHaveBeenCalled();
  });
});

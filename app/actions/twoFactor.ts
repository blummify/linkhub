"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { redis } from "@/lib/redis";
import bcrypt from "bcryptjs";
import { createHash, randomBytes } from "crypto";
import {
  decryptTotpSecret,
  encryptTotpSecret,
  generateOtpAuthUrl,
  generateTotpSecret,
  verifyTotpCode,
} from "@/lib/totp";
import QRCode from "qrcode";

function generateBackupCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = randomBytes(10);
  let raw = "";
  for (let i = 0; i < 10; i++) raw += chars[bytes[i] % chars.length];
  return `${raw.slice(0, 5)}-${raw.slice(5)}`;
}

function normalizeCode(code: string): string {
  return code.toUpperCase().replace(/[\s-]/g, "");
}

export async function setup2FA(): Promise<
  { qrCodeDataUrl: string; manualKey: string } | { error: string }
> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not authenticated" };

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { twoFactorEnabled: true, email: true },
  });

  if (user?.twoFactorEnabled) return { error: "2FA is already enabled" };

  const email = user?.email ?? session.user.id;
  const secret = generateTotpSecret();
  const otpAuthUrl = generateOtpAuthUrl(email, secret);

  try {
    await redis.set(`2fa:setup:${session.user.id}`, secret, { ex: 600 });
  } catch {
    return { error: "Could not initiate 2FA setup. Please try again." };
  }

  const qrCodeDataUrl = await QRCode.toDataURL(otpAuthUrl, { width: 200 });
  return { qrCodeDataUrl, manualKey: secret };
}

export async function enable2FA(
  totpCode: string
): Promise<{ backupCodes: string[] } | { error: string }> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not authenticated" };
  const userId = session.user.id;

  const user = await db.user.findUnique({
    where: { id: userId },
    select: { twoFactorEnabled: true },
  });

  if (user?.twoFactorEnabled) return { error: "2FA is already enabled" };

  let secret: string | null = null;
  try {
    secret = await redis.get<string>(`2fa:setup:${userId}`);
  } catch {
    return { error: "Setup session expired. Please start again." };
  }

  if (!secret) return { error: "Setup session expired. Please start again." };
  if (!verifyTotpCode(secret, normalizeCode(totpCode))) {
    return { error: "Invalid code. Check your authenticator app and try again." };
  }

  const plaintextCodes = Array.from({ length: 8 }, generateBackupCode);
  // Hash the normalized form (no hyphen) since verification normalizes user input
  // before comparing; codes are still displayed to the user with the hyphen.
  const codeHashes = await Promise.all(plaintextCodes.map((c) => bcrypt.hash(normalizeCode(c), 10)));
  const encryptedSecret = encryptTotpSecret(secret);

  await db.$transaction([
    db.user.update({
      where: { id: userId },
      data: { twoFactorSecret: encryptedSecret, twoFactorEnabled: true },
    }),
    db.twoFactorBackupCode.createMany({
      data: codeHashes.map((codeHash) => ({ userId, codeHash })),
    }),
  ]);

  try {
    await redis.del(`2fa:setup:${userId}`);
  } catch {} // best-effort cleanup

  return { backupCodes: plaintextCodes };
}

export async function disable2FA(
  code: string
): Promise<{ success: true } | { error: string }> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not authenticated" };
  const userId = session.user.id;

  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      twoFactorSecret: true,
      twoFactorEnabled: true,
      backupCodes: { where: { usedAt: null } },
    },
  });

  if (!user?.twoFactorEnabled || !user.twoFactorSecret) {
    return { error: "2FA is not enabled" };
  }

  const secret = decryptTotpSecret(user.twoFactorSecret);
  const normalized = normalizeCode(code);
  const isTotpValid = verifyTotpCode(secret, normalized);

  if (!isTotpValid) {
    let matchedId: string | null = null;
    for (const backup of user.backupCodes) {
      if (await bcrypt.compare(normalized, backup.codeHash)) {
        matchedId = backup.id;
        break;
      }
    }
    if (!matchedId) return { error: "Invalid code." };
    await db.twoFactorBackupCode.update({
      where: { id: matchedId },
      data: { usedAt: new Date() },
    });
  }

  await db.$transaction([
    db.user.update({
      where: { id: userId },
      data: { twoFactorSecret: null, twoFactorEnabled: false },
    }),
    db.twoFactorBackupCode.deleteMany({ where: { userId } }),
  ]);

  return { success: true };
}

export async function verifyTotpLogin(
  pendingToken: string,
  code: string
): Promise<{ autoLoginToken: string; email: string } | { error: string }> {
  const tokenHash = createHash("sha256").update(pendingToken).digest("hex");

  const record = await db.verificationToken.findUnique({ where: { token: tokenHash } });
  if (!record || !record.identifier.startsWith("2fa:login:") || record.expires < new Date()) {
    return { error: "Session expired. Please log in again." };
  }

  const userId = record.identifier.slice("2fa:login:".length);

  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      email: true,
      twoFactorSecret: true,
      backupCodes: { where: { usedAt: null } },
    },
  });

  if (!user?.email || !user.twoFactorSecret) {
    return { error: "Session expired. Please log in again." };
  }

  const secret = decryptTotpSecret(user.twoFactorSecret);
  const normalized = normalizeCode(code);
  const isTotpValid = verifyTotpCode(secret, normalized);

  if (!isTotpValid) {
    let matchedId: string | null = null;
    for (const backup of user.backupCodes) {
      if (await bcrypt.compare(normalized, backup.codeHash)) {
        matchedId = backup.id;
        break;
      }
    }
    if (!matchedId) return { error: "Invalid code." };
    await db.twoFactorBackupCode.update({
      where: { id: matchedId },
      data: { usedAt: new Date() },
    });
  }

  await db.verificationToken.delete({ where: { token: tokenHash } });

  const rawToken = randomBytes(32).toString("hex");
  const autoTokenHash = createHash("sha256").update(rawToken).digest("hex");
  await db.verificationToken.deleteMany({ where: { identifier: `auto:${user.email}` } });
  await db.verificationToken.create({
    data: {
      identifier: `auto:${user.email}`,
      token: autoTokenHash,
      expires: new Date(Date.now() + 2 * 60 * 1000),
    },
  });

  return { autoLoginToken: rawToken, email: user.email };
}

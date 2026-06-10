"use server";

// Account-settings mutations for /my-account. Every action derives the acting
// user from the server session — never from arguments. Account type (credential
// vs OAuth-only) is decided server-side from User.passwordHash.

import { z } from "zod";
import { Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";
import { createHash, randomBytes } from "crypto";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { redis } from "@/lib/redis";
import { postly } from "@/lib/postly";
import { disableSubscription } from "@/lib/paystack";
import { passwordSchema, emailSchema } from "@/lib/validation/auth.schema";

type Result = { success: true } | { error: string };

const nameSchema = z.string().trim().min(1, "Name is required").max(80, "Name is too long");

async function requireUserId(): Promise<string> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  return session.user.id;
}

/**
 * Reuses the registration code pattern (6-digit, sha256-hashed, 1h expiry,
 * EmailVerification keyed by userId). Sends the code to `targetEmail` — which,
 * for an email change, is the *new* address, not the user's current one.
 */
async function generateAndSendCode(
  userId: string,
  userName: string | null,
  targetEmail: string
): Promise<Result> {
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const hashed = createHash("sha256").update(code).digest("hex");
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

  await db.emailVerification.deleteMany({ where: { userId } });
  await db.emailVerification.create({ data: { userId, code: hashed, expiresAt } });

  try {
    await postly.send({
      template: process.env.POSTLY_TEMPLATE_VERIFICATION!,
      to: [targetEmail],
      data: { name: userName ?? "there", code, expiresInHours: 1 },
    });
  } catch (err) {
    console.error("[account] verification email send failed", err);
    return { error: "We couldn't send the verification email. Please try again in a moment." };
  }

  return { success: true };
}

/* ───────────────────────────── Personal info ───────────────────────────── */

export async function updateName(name: string): Promise<Result> {
  const id = await requireUserId();
  const parsed = nameSchema.safeParse(name);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  try {
    await db.user.update({ where: { id }, data: { name: parsed.data } });
    return { success: true };
  } catch (err) {
    console.error("[updateName] failed", err);
    return { error: "Failed to update your name. Please try again." };
  }
}

/* ───────────────────────────── Email change ───────────────────────────── */

export async function requestEmailChange(newEmail: string): Promise<Result> {
  const id = await requireUserId();
  const trimmed = newEmail.trim();
  const parsed = emailSchema.safeParse(trimmed);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const user = await db.user.findUnique({ where: { id }, select: { name: true, email: true } });
  if (!user) return { error: "Account not found." };
  if (user.email && trimmed.toLowerCase() === user.email.toLowerCase()) {
    return { error: "That's already your email address." };
  }

  // Pre-check uniqueness for a friendly message; the @unique constraint + the
  // P2002 catch on promotion is the real guard against a race.
  const taken = await db.user.findUnique({ where: { email: trimmed }, select: { id: true } });
  if (taken) return { error: "That email is already in use by another account." };

  const rlKey = `emailchange:${id}`;
  try {
    const already = await redis.get(rlKey);
    if (already) {
      const ttl = await redis.ttl(rlKey);
      return { error: `Please wait ${ttl}s before requesting another code.` };
    }
    await redis.set(rlKey, "1", { ex: 60 });
  } catch {} // Redis unavailable — allow through

  try {
    await db.user.update({ where: { id }, data: { pendingEmail: trimmed } });
  } catch (err) {
    console.error("[requestEmailChange] failed to set pendingEmail", err);
    return { error: "Something went wrong. Please try again." };
  }

  return generateAndSendCode(id, user.name, trimmed);
}

export async function confirmEmailChange(
  inputCode: string
): Promise<{ success: true; email: string } | { error: string }> {
  const id = await requireUserId();

  const user = await db.user.findUnique({ where: { id }, select: { pendingEmail: true } });
  if (!user?.pendingEmail) return { error: "No pending email change to confirm." };

  const record = await db.emailVerification.findUnique({ where: { userId: id } });
  if (!record) return { error: "No verification code found. Request a new one." };

  if (record.expiresAt < new Date()) {
    await db.emailVerification.delete({ where: { userId: id } });
    return { error: "Code expired. Please request a new one." };
  }

  if (createHash("sha256").update(inputCode.trim()).digest("hex") !== record.code) {
    const newAttempts = record.attempts + 1;
    if (newAttempts >= 5) {
      await db.emailVerification.delete({ where: { userId: id } });
      return { error: "Too many incorrect attempts. Please request a new code." };
    }
    await db.emailVerification.update({ where: { userId: id }, data: { attempts: newAttempts } });
    return { error: "Invalid code. Please try again." };
  }

  const pendingEmail = user.pendingEmail;
  try {
    await db.$transaction([
      db.user.update({
        where: { id },
        data: { email: pendingEmail, emailVerified: new Date(), pendingEmail: null },
      }),
      db.emailVerification.delete({ where: { userId: id } }),
    ]);
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      // Someone claimed the address between request and confirm. Leave
      // pendingEmail intact so the user can cancel and try another.
      return { error: "That email was just claimed by another account. Try a different address." };
    }
    console.error("[confirmEmailChange] promotion failed", err);
    return { error: "Something went wrong. Please try again." };
  }

  return { success: true, email: pendingEmail };
}

export async function cancelEmailChange(): Promise<Result> {
  const id = await requireUserId();
  try {
    await db.user.update({ where: { id }, data: { pendingEmail: null } });
    await db.emailVerification.deleteMany({ where: { userId: id } });
    return { success: true };
  } catch (err) {
    console.error("[cancelEmailChange] failed", err);
    return { error: "Something went wrong. Please try again." };
  }
}

export async function resendEmailChangeCode(): Promise<Result> {
  const id = await requireUserId();
  const user = await db.user.findUnique({ where: { id }, select: { name: true, pendingEmail: true } });
  if (!user?.pendingEmail) return { error: "No pending email change to resend." };

  const rlKey = `emailchange:${id}`;
  try {
    const already = await redis.get(rlKey);
    if (already) {
      const ttl = await redis.ttl(rlKey);
      return { error: `Please wait ${ttl}s before resending.` };
    }
    await redis.set(rlKey, "1", { ex: 60 });
  } catch {} // Redis unavailable — allow through

  return generateAndSendCode(id, user.name, user.pendingEmail);
}

/* ───────────────────────────── Password ───────────────────────────── */

export async function changePassword(
  currentPassword: string,
  newPassword: string
): Promise<Result> {
  const id = await requireUserId();
  if (!currentPassword) return { error: "Enter your current password." };

  const parsed = passwordSchema.safeParse(newPassword);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const user = await db.user.findUnique({ where: { id }, select: { passwordHash: true } });
  if (!user) return { error: "Account not found." };
  if (!user.passwordHash) {
    return { error: "Your account has no password yet. Use “Set a password” instead." };
  }

  const valid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!valid) return { error: "Your current password is incorrect." };

  const sameAsOld = await bcrypt.compare(newPassword, user.passwordHash);
  if (sameAsOld) return { error: "Your new password must be different from your current one." };

  try {
    const passwordHash = await bcrypt.hash(newPassword, 10);
    await db.user.update({ where: { id }, data: { passwordHash } });
    return { success: true };
  } catch (err) {
    console.error("[changePassword] failed", err);
    return { error: "Something went wrong. Please try again." };
  }
}

export async function setPassword(newPassword: string): Promise<Result> {
  const id = await requireUserId();

  const parsed = passwordSchema.safeParse(newPassword);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const user = await db.user.findUnique({ where: { id }, select: { passwordHash: true } });
  if (!user) return { error: "Account not found." };
  if (user.passwordHash) {
    return { error: "You already have a password. Use “Change password” instead." };
  }

  try {
    const passwordHash = await bcrypt.hash(newPassword, 10);
    await db.user.update({ where: { id }, data: { passwordHash } });
    return { success: true };
  } catch (err) {
    console.error("[setPassword] failed", err);
    return { error: "Something went wrong. Please try again." };
  }
}

/* ───────────────────────────── Account deletion ───────────────────────────── */

/**
 * OAuth-only re-auth: stores a single-use nonce bound to this user, returned to
 * the client which then runs signIn("google", …, { prompt: "consent select_account" })
 * with a callbackUrl carrying the nonce. deleteAccount verifies the returning
 * session resolves to the same user. Degrades *closed* if Redis is down — this
 * is the identity gate, not a rate limit.
 */
export async function armOAuthDeletion(): Promise<{ nonce: string } | { error: string }> {
  const id = await requireUserId();

  const user = await db.user.findUnique({ where: { id }, select: { passwordHash: true } });
  if (user?.passwordHash) {
    return { error: "Use your password to confirm deletion." };
  }

  const nonce = randomBytes(32).toString("hex");
  try {
    await redis.set(`del-reauth:${nonce}`, id, { ex: 600 });
  } catch (err) {
    console.error("[armOAuthDeletion] redis unavailable", err);
    return { error: "Couldn't start re-authentication. Please try again." };
  }
  return { nonce };
}

export async function deleteAccount(args: {
  typedEmail: string;
  password?: string;
  nonce?: string;
}): Promise<Result> {
  const id = await requireUserId();

  const user = await db.user.findUnique({
    where: { id },
    select: { email: true, passwordHash: true },
  });
  if (!user) return { error: "Account not found." };

  // Intent gate — deliberate-action speed bump, not the security check.
  if (!user.email || args.typedEmail.trim() !== user.email) {
    return { error: "The email you typed doesn't match your account email." };
  }

  // Identity gate — verified server-side at the moment of deletion.
  if (user.passwordHash) {
    if (!args.password) return { error: "Enter your password to confirm." };
    const valid = await bcrypt.compare(args.password, user.passwordHash);
    if (!valid) return { error: "Your password is incorrect." };
  } else {
    if (!args.nonce) return { error: "Re-authentication required. Please continue with Google." };
    let originalUserId: string | null = null;
    try {
      originalUserId = await redis.get<string>(`del-reauth:${args.nonce}`);
    } catch (err) {
      console.error("[deleteAccount] redis unavailable for nonce check", err);
      return { error: "Couldn't verify re-authentication. Please try again." };
    }
    if (!originalUserId) {
      return { error: "Your re-authentication expired. Please start the deletion again." };
    }
    // The re-prompt must resolve to the same user. A different Google account
    // means a different session.user.id — reject and burn the nonce.
    if (originalUserId !== id) {
      try { await redis.del(`del-reauth:${args.nonce}`); } catch {}
      return { error: "That Google account doesn't match this account. Deletion cancelled." };
    }
    try { await redis.del(`del-reauth:${args.nonce}`); } catch {} // single-use
  }

  // Cancel any Paystack subscription — strictly non-blocking. A third-party
  // outage must never trap a user in an account they're trying to delete.
  try {
    const sub = await db.subscription.findUnique({
      where: { userId: id },
      select: { paystackSubscriptionId: true, authorizationCode: true },
    });
    if (sub?.paystackSubscriptionId) {
      try {
        await disableSubscription({
          code: sub.paystackSubscriptionId,
          token: sub.authorizationCode ?? "",
        });
      } catch (err) {
        console.error(
          `[deleteAccount] Paystack disable FAILED for user ${id} — MANUAL CLEANUP REQUIRED`,
          err
        );
      }
    }
  } catch (err) {
    console.error("[deleteAccount] subscription lookup failed (continuing)", err);
  }

  // Delete the user; FK onDelete: Cascade removes Profile, Link, Account,
  // Session, EmailVerification, PasswordResetToken, Subscription, CustomTheme.
  try {
    await db.$transaction([db.user.delete({ where: { id } })]);
  } catch (err) {
    console.error("[deleteAccount] delete failed", err);
    return { error: "We couldn't delete your account. Please try again." };
  }

  return { success: true };
}

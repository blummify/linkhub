"use server";

import { db } from "@/lib/db";
import { redis } from "@/lib/redis";
import { postly } from "@/lib/postly";
import bcrypt from "bcryptjs";
import { signIn, auth } from "@/auth";
import { AuthError } from "next-auth";
import { createHash, randomBytes } from "crypto";
import { after } from "next/server";

type CredentialsFormData = {
  email: string;
  password: string;
};

type RegisterFormData = CredentialsFormData & {
  name: string;
};

export async function checkEmailVerified(email: string): Promise<boolean> {
  try {
    const user = await db.user.findUnique({ where: { email }, select: { emailVerified: true } });
    return !!user?.emailVerified;
  } catch {
    return false;
  }
}

export async function checkUserExists(email: string) {
  try {
    const user = await db.user.findUnique({
      where: { email },
    });
    return !!user;
  } catch (error) {
    console.error("Error checking user:", error);
    return false;
  }
}

export async function registerUser(formData: RegisterFormData) {
  const { name, email, password } = formData;

  try {
    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return { error: "An account with this email already exists." };
    }

    const passwordHash = await bcrypt.hash(password, 10);

    await db.user.create({
      data: {
        name,
        email,
        passwordHash,
        profile: { create: {} },
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Registration error:", error);
    return { error: "We couldn't complete your registration. Please try again." };
  }
}

async function createAndSendCode(email: string): Promise<{ success: true } | { error: string }> {
  const user = await db.user.findUnique({ where: { email }, select: { id: true, name: true } });
  if (!user) return { error: "No account found for this email." };

  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const hashed = createHash("sha256").update(code).digest("hex");
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

  await db.emailVerification.deleteMany({ where: { userId: user.id } });
  await db.emailVerification.create({ data: { userId: user.id, code: hashed, expiresAt } });

  console.log("[postly] sending verification email", {
    to: email,
    name: user.name ?? "there",
    baseUrl: process.env.POSTLY_BASE_URL,
    hasApiKey: !!process.env.POSTLY_API_KEY,
  });

  try {
    const result = await postly.send({
      template: process.env.POSTLY_TEMPLATE_VERIFICATION!,
      to: [email],
      data: {
        name: user?.name ?? "there",
        code,
        expiresInHours: 24,
      },
    });
    console.log("[postly] send success", result);
  } catch (err) {
    console.error("[postly] send failed", err);
    return { error: "We couldn't send your verification email. You can request a new one from the next page." };
  }

  return { success: true };
}

export async function sendVerificationCode(email: string): Promise<{ success: true } | { error: string }> {
  try {
    return await createAndSendCode(email);
  } catch (err) {
    console.error("[postly] unexpected error in sendVerificationCode", err);
    return { error: "We couldn't send your verification email. You can request a new one from the next page." };
  }
}

export async function verifyEmailCode(
  email: string,
  inputCode: string
): Promise<{ success: true; autoLoginToken: string } | { error: string }> {
  try {
    const user = await db.user.findUnique({ where: { email }, select: { id: true } });
    if (!user) return { error: "No verification code found. Request a new one." };

    const record = await db.emailVerification.findUnique({ where: { userId: user.id } });
    if (!record) return { error: "No verification code found. Request a new one." };

    if (record.expiresAt < new Date()) {
      await db.emailVerification.delete({ where: { userId: user.id } });
      return { error: "Code expired. Please request a new one." };
    }

    if (createHash("sha256").update(inputCode).digest("hex") !== record.code) {
      const newAttempts = record.attempts + 1;
      if (newAttempts >= 5) {
        await db.emailVerification.delete({ where: { userId: user.id } });
        return { error: "Too many incorrect attempts. Please request a new code." };
      }
      await db.emailVerification.update({ where: { userId: user.id }, data: { attempts: newAttempts } });
      return { error: "Invalid code. Please try again." };
    }

    await db.user.update({ where: { id: user.id }, data: { emailVerified: new Date() } });
    await db.emailVerification.delete({ where: { userId: user.id } });

    const autoLoginToken = randomBytes(32).toString("hex");
    await db.verificationToken.create({
      data: { identifier: `auto:${email}`, token: autoLoginToken, expires: new Date(Date.now() + 2 * 60 * 1000) },
    });

    return { success: true, autoLoginToken };
  } catch {
    return { error: "Verification failed. Please request a new code and try again." };
  }
}

export async function resendVerificationCode(email: string): Promise<{ success: true } | { error: string }> {
  try {
    const rateLimitKey = `resend:${email}`;
    try {
      const alreadySent = await redis.get(rateLimitKey);
      if (alreadySent) {
        const ttl = await redis.ttl(rateLimitKey);
        return { error: `Please wait ${ttl}s before resending.` };
      }
      await redis.set(rateLimitKey, "1", { ex: 60 });
    } catch {
      // Redis unavailable — fall through to DB-based check
      const user = await db.user.findUnique({ where: { email }, select: { id: true } });
      if (user) {
        const existing = await db.emailVerification.findUnique({ where: { userId: user.id } });
        if (existing) {
          const elapsed = (Date.now() - existing.createdAt.getTime()) / 1000;
          if (elapsed < 60) return { error: `Please wait ${Math.ceil(60 - elapsed)}s before resending.` };
        }
      }
    }
    return await createAndSendCode(email);
  } catch {
    return { error: "We couldn't send the verification email. Please try again in a moment." };
  }
}

export async function loginWithCredentials(formData: CredentialsFormData) {
  const { email, password } = formData;

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: "/user-dashboard",
    });
    return { success: true };
  } catch (error) {
    if (error instanceof Error) {
      const message = error.message ?? "";
      const causeMessage = (error as { cause?: { err?: { message?: string } } }).cause?.err?.message ?? "";

      if (
        message.includes("email_not_verified") ||
        causeMessage.includes("email_not_verified")
      ) {
        return { error: "email_not_verified" };
      }
    }

    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Invalid credentials" };
        default:
          return { error: "Something went wrong" };
      }
    }

    throw error;
  }
}

export async function signInWithGoogleOneTap(
  credential: string
): Promise<{ autoLoginToken: string; email: string } | { error: string }> {
  try {
    const { createRemoteJWKSet, jwtVerify } = await import("jose");
    const JWKS = createRemoteJWKSet(new URL("https://www.googleapis.com/oauth2/v3/certs"));
    const { payload } = await jwtVerify(credential, JWKS, {
      audience: process.env.GOOGLE_CLIENT_ID!,
      issuer: ["accounts.google.com", "https://accounts.google.com"],
    });

    const { sub: googleId, email, name, picture, email_verified } = payload as {
      sub: string; email: string; name: string; picture: string; email_verified: boolean;
    };

    if (!email_verified) return { error: "Google account email is not verified." };

    let user = await db.user.findUnique({ where: { email } });

    if (!user) {
      user = await db.user.create({
        data: { email, name, image: picture, emailVerified: new Date(), profile: { create: {} } },
      });
    } else if (!user.emailVerified) {
      await db.user.update({ where: { id: user.id }, data: { emailVerified: new Date() } });
    }

    await db.account.upsert({
      where: { provider_providerAccountId: { provider: "google", providerAccountId: googleId } },
      create: { userId: user.id, type: "oauth", provider: "google", providerAccountId: googleId },
      update: {},
    });

    const autoLoginToken = randomBytes(32).toString("hex");
    await db.verificationToken.deleteMany({ where: { identifier: `auto:${email}` } });
    await db.verificationToken.create({
      data: { identifier: `auto:${email}`, token: autoLoginToken, expires: new Date(Date.now() + 2 * 60 * 1000) },
    });

    return { autoLoginToken, email };
  } catch (err) {
    console.error("[signInWithGoogleOneTap] error", err);
    return { error: "Google sign-in failed. Please try again." };
  }
}

export async function sendResetLink(email: string): Promise<{ success: true } | { error: string }> {
  try {
    const user = await db.user.findUnique({ where: { email }, select: { id: true, name: true } });

    if (user) {
      const rawToken = randomBytes(32).toString("hex");
      const tokenHash = createHash("sha256").update(rawToken).digest("hex");
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      await db.passwordResetToken.deleteMany({ where: { userId: user.id } });
      await db.passwordResetToken.create({ data: { userId: user.id, tokenHash, expiresAt } });

      const baseUrl = process.env.NEXTAUTH_URL
        ?? (process.env.NEXT_PUBLIC_APP_DOMAIN ? `https://${process.env.NEXT_PUBLIC_APP_DOMAIN}` : "http://localhost:3000");
      const resetUrl = `${baseUrl}/reset-password?token=${rawToken}`;
      const name = user.name ?? "there";

      // Fire email after the response is returned — doesn't block the UI
      after(async () => {
        try {
          await postly.send({
            template: process.env.POSTLY_TEMPLATE_FORGOT_PASSWORD!,
            to: [email],
            data: { name, email, resetUrl, expiresInHours: 1 },
          });
        } catch (err) {
          console.error("[postly] reset link send failed", err);
        }
      });
    }

    // Always return success to avoid leaking whether the email exists
    return { success: true };
  } catch (err) {
    console.error("[sendResetLink] error", err);
    return { error: "Something went wrong. Please try again." };
  }
}

export async function validateResetToken(token: string): Promise<{ valid: true } | { error: string }> {
  try {
    const tokenHash = createHash("sha256").update(token).digest("hex");
    const record = await db.passwordResetToken.findUnique({ where: { tokenHash } });
    if (!record) return { error: "This reset link is invalid or has already been used." };
    if (record.usedAt) return { error: "This reset link has already been used." };
    if (record.expiresAt < new Date()) return { error: "This reset link has expired. Please request a new one." };
    return { valid: true };
  } catch {
    return { error: "Something went wrong. Please try again." };
  }
}

export async function resetPassword(
  token: string,
  newPassword: string
): Promise<{ success: true } | { error: string }> {
  try {
    const tokenHash = createHash("sha256").update(token).digest("hex");

    // Fetch token record and hash the new password in parallel
    const [record, passwordHash] = await Promise.all([
      db.passwordResetToken.findUnique({ where: { tokenHash } }),
      bcrypt.hash(newPassword, 10),
    ]);

    if (!record) return { error: "This reset link is invalid or has already been used." };
    if (record.usedAt) return { error: "This reset link has already been used." };
    if (record.expiresAt < new Date()) return { error: "This reset link has expired. Please request a new one." };

    // Write both DB updates concurrently
    await Promise.all([
      db.user.update({ where: { id: record.userId }, data: { passwordHash } }),
      db.passwordResetToken.update({ where: { tokenHash }, data: { usedAt: new Date() } }),
    ]);

    return { success: true };
  } catch (err) {
    console.error("[resetPassword] error", err);
    return { error: "Something went wrong. Please try again." };
  }
}

export async function updateUserName(
  name: string
): Promise<{ success: true } | { error: string }> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const trimmed = name.trim();
  if (!trimmed || trimmed.length > 60)
    return { error: "Name must be between 1 and 60 characters." };

  try {
    await db.user.update({ where: { id: session.user.id }, data: { name: trimmed } });
    return { success: true };
  } catch {
    return { error: "Failed to update name. Please try again." };
  }
}

export async function changePassword(
  currentPassword: string,
  newPassword: string
): Promise<{ success: true } | { error: string }> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  if (newPassword.length < 8)
    return { error: "New password must be at least 8 characters." };

  try {
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { passwordHash: true },
    });

    if (!user?.passwordHash)
      return { error: "Password change is not available for social accounts." };

    const valid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!valid) return { error: "Current password is incorrect." };

    const hash = await bcrypt.hash(newPassword, 10);
    await db.user.update({ where: { id: session.user.id }, data: { passwordHash: hash } });
    return { success: true };
  } catch {
    return { error: "Failed to update password. Please try again." };
  }
}

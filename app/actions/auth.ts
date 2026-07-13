"use server";

import { db } from "@/lib/db";
import { redis } from "@/lib/redis";
import { postly } from "@/lib/postly";
import bcrypt from "bcryptjs";
import { signIn } from "@/auth";
import { AuthError } from "next-auth";
import { createHash, randomBytes } from "crypto";
import { headers } from "next/headers";
import { getCountryFromHeaders } from "@/lib/geo";
import { issuePasswordReset } from "@/lib/passwordReset";
import { verifyRecaptcha } from "@/lib/recaptcha.server";
import { createPendingTwoFactorToken } from "@/lib/twoFactorChallenge";

type CredentialsFormData = {
  email: string;
  password: string;
  recaptchaToken: string;
};

type RegisterFormData = CredentialsFormData & {
  name: string;
};

/** Country is best-effort signup metadata; a failed lookup must never block registration. */
async function detectSignupCountry(): Promise<string | null> {
  try {
    const hdrs = await headers();
    return getCountryFromHeaders((name) => hdrs.get(name));
  } catch {
    return null;
  }
}

export async function checkEmailVerified(email: string): Promise<boolean> {
  try {
    const user = await db.user.findUnique({ where: { email }, select: { emailVerified: true } });
    return !!user?.emailVerified;
  } catch {
    return false;
  }
}

export async function checkUserExists(
  email: string,
  recaptchaToken: string
): Promise<{ exists: boolean } | { error: string }> {
  try {
    await verifyRecaptcha(recaptchaToken, "check_email");
  } catch (error) {
    console.error("[checkUserExists] reCAPTCHA failed", error);
    return { error: "Something went wrong. Please try again." };
  }

  try {
    const user = await db.user.findUnique({
      where: { email },
    });
    return { exists: !!user };
  } catch (error) {
    console.error("Error checking user:", error);
    return { error: "Something went wrong. Please try again." };
  }
}

export async function registerUser(formData: RegisterFormData) {
  const { name, email, password, recaptchaToken } = formData;

  try {
    await verifyRecaptcha(recaptchaToken, "signup");
  } catch (error) {
    console.error("[registerUser] reCAPTCHA failed", error);
    return { error: "Something went wrong. Please try again." };
  }

  try {
    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      const googleAccount = await db.account.findFirst({
        where: { userId: existingUser.id, provider: "google" },
      });
      return {
        error: googleAccount
          ? "This email is linked to a Google account. Please sign in with Google."
          : "An account with this email already exists.",
      };
    }

    const passwordHash = await bcrypt.hash(password, 10);

    await db.user.create({
      data: {
        name,
        email,
        passwordHash,
        country: await detectSignupCountry(),
        profile: { create: {} },
        subscription: { create: {} },
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
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

  await db.emailVerification.deleteMany({ where: { userId: user.id } });
  await db.emailVerification.create({ data: { userId: user.id, code: hashed, expiresAt } });

  try {
    await postly.send({
      template: process.env.POSTLY_TEMPLATE_VERIFICATION!,
      to: [email],
      data: {
        name: user?.name ?? "there",
        code,
        expiresInHours: 1,
      },
    });
  } catch (err) {
    console.error("[postly] send failed", err);
    return { error: "We couldn't send your verification email. You can request a new one from the next page." };
  }

  return { success: true };
}

export async function sendVerificationCode(
  email: string,
  recaptchaToken: string
): Promise<{ success: true } | { error: string }> {
  try {
    await verifyRecaptcha(recaptchaToken, "send_verification");
  } catch (error) {
    console.error("[sendVerificationCode] reCAPTCHA failed", error);
    return { error: "Something went wrong. Please try again." };
  }

  try {
    const rateLimitKey = `verifycode:${email.toLowerCase()}`;
    try {
      const alreadySent = await redis.get(rateLimitKey);
      if (alreadySent) {
        const ttl = await redis.ttl(rateLimitKey);
        return { error: `Please wait ${ttl}s before requesting another code.` };
      }
      await redis.set(rateLimitKey, "1", { ex: 60 });
    } catch {} // Redis unavailable — allow through
    return await createAndSendCode(email);
  } catch (err) {
    console.error("[postly] unexpected error in sendVerificationCode", err);
    return { error: "We couldn't send your verification email. You can request a new one from the next page." };
  }
}

export async function verifyEmailCode(
  email: string,
  inputCode: string,
  recaptchaToken: string
): Promise<{ success: true; autoLoginToken: string } | { error: string }> {
  try {
    await verifyRecaptcha(recaptchaToken, "verify_email");
  } catch (error) {
    console.error("[verifyEmailCode] reCAPTCHA failed", error);
    return { error: "Something went wrong. Please try again." };
  }

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

    const rawToken = randomBytes(32).toString("hex");
    const tokenHash = createHash("sha256").update(rawToken).digest("hex");
    await db.verificationToken.deleteMany({ where: { identifier: `auto:${email}` } });
    await db.verificationToken.create({
      data: { identifier: `auto:${email}`, token: tokenHash, expires: new Date(Date.now() + 2 * 60 * 1000) },
    });

    return { success: true, autoLoginToken: rawToken };
  } catch {
    return { error: "Verification failed. Please request a new code and try again." };
  }
}

export async function resendVerificationCode(
  email: string,
  recaptchaToken: string
): Promise<{ success: true } | { error: string }> {
  try {
    await verifyRecaptcha(recaptchaToken, "resend_verification");
  } catch (error) {
    console.error("[resendVerificationCode] reCAPTCHA failed", error);
    return { error: "Something went wrong. Please try again." };
  }

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

export type LoginResult =
  | { success: true }
  | { error: string }
  | { requiresTwoFactor: true; pendingToken: string };

export async function loginWithCredentials(
  formData: CredentialsFormData
): Promise<LoginResult | undefined> {
  const { email, password, recaptchaToken } = formData;

  try {
    await verifyRecaptcha(recaptchaToken, "login");
  } catch (error) {
    console.error("[loginWithCredentials] reCAPTCHA failed", error);
    return { error: "Something went wrong. Please try again." };
  }

  const rateLimitKey = `login:${email.toLowerCase()}`;
  try {
    const attempts = await redis.get<number>(rateLimitKey);
    if (attempts !== null && attempts >= 10) {
      return { error: "Too many login attempts. Try again in 15 minutes." };
    }
  } catch {} // Redis unavailable — allow through

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

      if (message.includes("email_not_verified") || causeMessage.includes("email_not_verified")) {
        return { error: "email_not_verified" };
      }

      if (message.includes("oauth_account_no_password") || causeMessage.includes("oauth_account_no_password")) {
        return { error: "oauth_account_no_password" };
      }

      const raw = causeMessage.includes("2fa_required:") ? causeMessage : message;
      if (raw.includes("2fa_required:")) {
        const idx = raw.indexOf("2fa_required:");
        const pendingToken = raw.slice(idx + "2fa_required:".length, idx + "2fa_required:".length + 64);
        if (/^[a-f0-9]{64}$/.test(pendingToken)) {
          return { requiresTwoFactor: true, pendingToken };
        }
      }
    }

    if (error instanceof AuthError) {
      try {
        const count = await redis.incr(rateLimitKey);
        if (count === 1) await redis.expire(rateLimitKey, 900); // 15-min window
      } catch {}
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
): Promise<
  | { autoLoginToken: string; email: string }
  | { requiresTwoFactor: true; pendingToken: string }
  | { error: string }
> {
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
        data: { email, name, image: picture, emailVerified: new Date(), country: await detectSignupCountry(), profile: { create: {} }, subscription: { create: {} } },
      });
    } else if (!user.emailVerified) {
      await db.user.update({ where: { id: user.id }, data: { emailVerified: new Date() } });
    }

    await db.account.upsert({
      where: { provider_providerAccountId: { provider: "google", providerAccountId: googleId } },
      create: { userId: user.id, type: "oauth", provider: "google", providerAccountId: googleId },
      update: {},
    });

    if (user.twoFactorEnabled && user.twoFactorSecret) {
      const pendingToken = await createPendingTwoFactorToken(user.id);
      return { requiresTwoFactor: true, pendingToken };
    }

    const rawToken = randomBytes(32).toString("hex");
    const tokenHash = createHash("sha256").update(rawToken).digest("hex");
    await db.verificationToken.deleteMany({ where: { identifier: `auto:${email}` } });
    await db.verificationToken.create({
      data: { identifier: `auto:${email}`, token: tokenHash, expires: new Date(Date.now() + 2 * 60 * 1000) },
    });

    return { autoLoginToken: rawToken, email };
  } catch (err) {
    console.error("[signInWithGoogleOneTap] error", err);
    return { error: "Google sign-in failed. Please try again." };
  }
}

export async function sendResetLink(
  email: string,
  recaptchaToken: string
): Promise<{ success: true } | { error: string }> {
  try {
    await verifyRecaptcha(recaptchaToken, "forgot_password");
  } catch (error) {
    console.error("[sendResetLink] reCAPTCHA failed", error);
    return { error: "Something went wrong. Please try again." };
  }

  try {
    const user = await db.user.findUnique({ where: { email }, select: { id: true, name: true } });

    if (user) {
      const resetRateKey = `pwreset:${email.toLowerCase()}`;
      try {
        const count = await redis.incr(resetRateKey);
        if (count === 1) await redis.expire(resetRateKey, 3600);
        if (count > 3) return { success: true }; // Silent — don't reveal limiting
      } catch {} // Redis unavailable — allow through

      await issuePasswordReset(db, { id: user.id, email, name: user.name });
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
  newPassword: string,
  recaptchaToken: string
): Promise<{ success: true } | { error: string }> {
  try {
    await verifyRecaptcha(recaptchaToken, "reset_password");
  } catch (error) {
    console.error("[resetPassword] reCAPTCHA failed", error);
    return { error: "Something went wrong. Please try again." };
  }

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


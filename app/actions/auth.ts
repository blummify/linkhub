"use server";

import { db } from "@/lib/db";
import { postly } from "@/lib/postly";
import bcrypt from "bcryptjs";
import { signIn } from "@/auth";
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
      const left = 5 - newAttempts;
      return { error: `Invalid code. ${left} attempt${left === 1 ? "" : "s"} remaining.` };
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
    const user = await db.user.findUnique({ where: { email }, select: { id: true } });
    if (user) {
      const existing = await db.emailVerification.findUnique({ where: { userId: user.id } });
      if (existing) {
        const elapsed = (Date.now() - existing.createdAt.getTime()) / 1000;
        if (elapsed < 60) return { error: `Please wait ${Math.ceil(60 - elapsed)}s before resending.` };
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

export async function sendResetLink(email: string): Promise<{ success: true } | { error: string }> {
  try {
    const user = await db.user.findUnique({ where: { email }, select: { id: true, name: true } });

    if (user) {
      const rawToken = randomBytes(32).toString("hex");
      const tokenHash = createHash("sha256").update(rawToken).digest("hex");
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      await db.passwordResetToken.deleteMany({ where: { userId: user.id } });
      await db.passwordResetToken.create({ data: { userId: user.id, tokenHash, expiresAt } });

      const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${rawToken}`;
      const name = user.name ?? "there";

      // Fire email after the response is returned — doesn't block the UI
      after(async () => {
        try {
          await postly.send({
            template: process.env.POSTLY_TEMPLATE_FORGOT_PASSWORD!,
            to: [email],
            data: { name, resetUrl, expiresInHours: 1 },
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

// ✅ Resend verification email
export async function resendVerificationEmail(email: string) {
  try {
    const user = await db.user.findUnique({
      where: { email },
    });

    if (!user) {
      return { error: "No account found with this email." };
    }

    if (user.emailVerified) {
      return { error: "This email is already verified." };
    }

    // Generate a secure token
    const token = randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 1000 * 60 * 60 * 24); // 24 hours

    // Store token in VerificationToken table
    await db.verificationToken.upsert({
      where: { identifier_token: { identifier: email, token } },
      create: { identifier: email, token, expires },
      update: { token, expires },
    });

    const verificationUrl = `${process.env.NEXTAUTH_URL}/api/auth/verify-email?token=${token}&email=${encodeURIComponent(email)}`;

    // TODO: send email with verificationUrl using your email provider
    // e.g. sendEmail({ to: email, subject: "Verify your email", body: verificationUrl })
    console.log("Verification URL:", verificationUrl); // remove when email is wired up

    return { success: true };
  } catch (error) {
    console.error("Resend verification error:", error);
    return { error: "Something went wrong. Please try again." };
  }
}
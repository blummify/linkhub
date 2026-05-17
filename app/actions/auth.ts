"use server";

import { db } from "@/lib/db";
import { postly } from "@/lib/postly";
import bcrypt from "bcryptjs";
import { signIn } from "@/auth";
import { AuthError } from "next-auth";
import { createHash, randomBytes } from "crypto";
import {forgotPasswordSchema, resetPasswordSchema} from "@/lib/validation/auth.schema"

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
      const causeMessage = (error as any).cause?.err?.message ?? "";

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
// forgot password actions
export async function forgotPassword(formData: { email: string }) {
  const validatedFields = forgotPasswordSchema.safeParse(formData);
  if (!validatedFields.success) {
    return { error: validatedFields.error.issues[0].message };
  }

  const { email } = validatedFields.data;

  await new Promise((resolve) => setTimeout(resolve, 800));

  try {
    const user = await db.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (!user) {
      return { error: "No account found with that email address." };
    }

    const rawToken = crypto.randomUUID() + crypto.randomUUID();
    const lookupKey = rawToken.slice(0, 8);
    const tokenHash = await bcrypt.hash(rawToken, 10);
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    await db.passwordResetToken.upsert({
      where: { userId: user.id },
      update: { tokenHash, lookupKey, expiresAt, createdAt: new Date() },
      create: { userId: user.id, tokenHash, lookupKey, expiresAt },
    });

    const resetUrl = `${process.env.PUBLIC_EXACT}/reset-password/${rawToken}`;
    console.log(`[forgotPassword] Reset URL for ${email}: ${resetUrl}`);
    // pinned: send reset link via email instead of console for now
    //PUBLIC_EXACT: variable name copied from middleware.ts file

    return {
      success: true,
      message: "If an account exists with this email address, a reset link will be sent.",
    };

  } catch (error) {
    console.error("[forgotPassword] Error:", error);
    return { error: "Something went wrong. Please try again." };
  }
}

// reset password actions
export async function resetPassword(token: string, passwordInput: unknown) {
  const validatedFields = resetPasswordSchema.safeParse(passwordInput);
  if (!validatedFields.success) {
    return { error: validatedFields.error.issues[0].message };
  }

  if (!token || token === "undefined") {
    return { error: "Invalid or missing reset token. Please request a new link." };
  }

  try {
    const lookupKey = token.slice(0, 8);

    const storedToken = await db.passwordResetToken.findUnique({
      where: { lookupKey },
    });

    if (!storedToken) {
      return { error: "Token expired or invalid. Please request a new link." };
    }

    if (storedToken.expiresAt < new Date()) {
      await db.passwordResetToken.delete({ where: { lookupKey } });
      return { error: "Reset link has expired. Please request a new one." };
    }

    const isValid = await bcrypt.compare(token, storedToken.tokenHash);
    if (!isValid) {
      return { error: "Token expired or invalid. Please request a new link." };
    }

    const passwordHash = await bcrypt.hash(validatedFields.data.password, 10);

    await db.user.update({
      where: { id: storedToken.userId },
      data: { passwordHash },
    });

    await db.passwordResetToken.delete({ where: { lookupKey } });

    console.log(`[resetPassword] Password updated for userId: ${storedToken.userId}`); // pinned: loging out after password reset 
    return { success: true };

  } catch (error) {
    console.error("[resetPassword] Error:", error);
    return { error: "An unexpected error occurred. Please try again." };
  }
}
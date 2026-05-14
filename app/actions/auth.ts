"use server";

import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { signIn } from "@/auth";
import { AuthError } from "next-auth";
import { createHash, randomBytes } from "crypto";
import nodemailer from "nodemailer";

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
      return { error: "User already exists" };
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

    // Sign in on the client with `signIn("credentials", …)` so the session cookie is set reliably.
    return { success: true };
  } catch (error) {
    console.error("Registration error:", error);
    return { error: "Something went wrong" };
  }
}

function verificationEmailHtml(code: string): string {
  return `<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#f5f5f5;margin:0;padding:40px 20px;">
    <div style="max-width:480px;margin:0 auto;background:white;border-radius:16px;padding:40px;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
      <h1 style="font-size:24px;font-weight:700;color:#111;margin:0 0 8px;">Verify your email</h1>
      <p style="color:#666;margin:0 0 32px;">Enter this code in LinkHub to activate your account.</p>
      <div style="text-align:center;background:#f0effe;border-radius:12px;padding:24px;margin-bottom:32px;">
        <span style="font-size:40px;font-weight:900;letter-spacing:16px;color:#4F46E5;">${code}</span>
      </div>
      <p style="color:#999;font-size:13px;margin:0;">Expires in 24 hours. If you didn&apos;t create a LinkHub account, ignore this email.</p>
    </div>
  </div>`;
}

function getTransporter(): nodemailer.Transporter {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST ?? "smtp-relay.brevo.com",
    port: Number(process.env.SMTP_PORT ?? "587"),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });
}

async function createAndSendCode(email: string): Promise<{ success: true } | { error: string }> {
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const hashed = createHash("sha256").update(code).digest("hex");
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

  await db.emailVerification.deleteMany({ where: { email } });
  await db.emailVerification.create({ data: { email, code: hashed, expiresAt } });

  try {
    await getTransporter().sendMail({
      from: process.env.SMTP_FROM,
      to: email,
      subject: "Your LinkHub verification code",
      html: verificationEmailHtml(code),
    });
  } catch {
    return { error: "Failed to send verification email. Please try again." };
  }

  return { success: true };
}

export async function sendVerificationCode(email: string): Promise<{ success: true } | { error: string }> {
  try {
    return await createAndSendCode(email);
  } catch {
    return { error: "Something went wrong. Please try again." };
  }
}

export async function verifyEmailCode(
  email: string,
  inputCode: string
): Promise<{ success: true; autoLoginToken: string } | { error: string }> {
  try {
    const record = await db.emailVerification.findUnique({ where: { email } });
    if (!record) return { error: "No verification code found. Request a new one." };

    if (record.expiresAt < new Date()) {
      await db.emailVerification.delete({ where: { email } });
      return { error: "Code expired. Please request a new one." };
    }

    if (createHash("sha256").update(inputCode).digest("hex") !== record.code) {
      const newAttempts = record.attempts + 1;
      if (newAttempts >= 5) {
        await db.emailVerification.delete({ where: { email } });
        return { error: "Too many incorrect attempts. Please request a new code." };
      }
      await db.emailVerification.update({ where: { email }, data: { attempts: newAttempts } });
      const left = 5 - newAttempts;
      return { error: `Invalid code. ${left} attempt${left === 1 ? "" : "s"} remaining.` };
    }

    await db.user.update({ where: { email }, data: { emailVerified: new Date() } });
    await db.emailVerification.delete({ where: { email } });

    const autoLoginToken = randomBytes(32).toString("hex");
    await db.verificationToken.create({
      data: { identifier: `auto:${email}`, token: autoLoginToken, expires: new Date(Date.now() + 2 * 60 * 1000) },
    });

    return { success: true, autoLoginToken };
  } catch {
    return { error: "Something went wrong. Please try again." };
  }
}

export async function resendVerificationCode(email: string): Promise<{ success: true } | { error: string }> {
  try {
    const existing = await db.emailVerification.findUnique({ where: { email } });
    if (existing) {
      const elapsed = (Date.now() - existing.createdAt.getTime()) / 1000;
      if (elapsed < 60) return { error: `Please wait ${Math.ceil(60 - elapsed)}s before resending.` };
    }
    return await createAndSendCode(email);
  } catch {
    return { error: "Something went wrong. Please try again." };
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

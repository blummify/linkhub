"use server";

import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { signIn } from "@/auth";
import { AuthError } from "next-auth";
import crypto from "crypto";

type CredentialsFormData = {
  email: string;
  password: string;
};

type RegisterFormData = CredentialsFormData & {
  name: string;
};

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

    return { success: true };
  } catch (error) {
    console.error("Registration error:", error);
    return { error: "Something went wrong" };
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
    const token = crypto.randomBytes(32).toString("hex");
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
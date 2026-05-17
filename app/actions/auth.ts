"use server";

import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { signIn } from "@/auth";
import { AuthError } from "next-auth";
import {forgotPasswordSchema, resetPasswordSchema} from "@/lib/validation/auth.schema"

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

    // Sign in on the client with `signIn("credentials", …)` so the session cookie is set reliably.
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
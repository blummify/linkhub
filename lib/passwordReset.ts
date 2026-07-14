import { createHash, randomBytes } from "crypto";
import { after } from "next/server";
import type { PrismaClient } from "@prisma/client";
import { postly } from "./postly";

/**
 * Core of the password-reset flow, shared by the public "forgot password"
 * action and the admin portal's "Send reset". Creates a fresh single-use token
 * (invalidating any previous ones) and emails the reset link after the
 * response is returned.
 */

const TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

export function resetBaseUrl(): string {
  return (
    process.env.NEXTAUTH_URL ??
    (process.env.NEXT_PUBLIC_APP_DOMAIN
      ? `https://${process.env.NEXT_PUBLIC_APP_DOMAIN}`
      : "http://localhost:3000")
  );
}

export interface ResetRecipient {
  id: string;
  email: string;
  name: string | null;
}

export async function issuePasswordReset(
  client: Pick<PrismaClient, "passwordResetToken">,
  recipient: ResetRecipient
): Promise<void> {
  const rawToken = randomBytes(32).toString("hex");
  const tokenHash = createHash("sha256").update(rawToken).digest("hex");
  const expiresAt = new Date(Date.now() + TOKEN_TTL_MS);

  await client.passwordResetToken.deleteMany({ where: { userId: recipient.id } });
  await client.passwordResetToken.create({
    data: { userId: recipient.id, tokenHash, expiresAt },
  });

  const resetUrl = `${resetBaseUrl()}/reset-password?token=${rawToken}`;

  // Fire email after the response is returned — doesn't block the caller.
  after(async () => {
    try {
      await postly.send({
        template: process.env.POSTLY_TEMPLATE_FORGOT_PASSWORD!,
        to: [recipient.email],
        data: {
          name: recipient.name ?? "there",
          email: recipient.email,
          resetUrl,
          expiresInHours: 1,
        },
      });
    } catch (err) {
      console.error("[postly] reset link send failed", err);
    }
  });
}

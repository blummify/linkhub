import { createHash, randomBytes } from "crypto";
import { db } from "@/lib/db";

const TWO_FACTOR_LOGIN_TTL_MS = 5 * 60 * 1000;

/**
 * Issues a short-lived `2fa:login:{userId}` VerificationToken and returns the
 * raw (unhashed) pending token. Shared by every sign-in path (credentials,
 * Google OAuth, Google One Tap) to pause sign-in until `verifyTotpLogin` succeeds.
 */
export async function createPendingTwoFactorToken(userId: string): Promise<string> {
  const pendingToken = randomBytes(32).toString("hex");
  const tokenHash = createHash("sha256").update(pendingToken).digest("hex");

  await db.verificationToken.deleteMany({ where: { identifier: `2fa:login:${userId}` } });
  await db.verificationToken.create({
    data: {
      identifier: `2fa:login:${userId}`,
      token: tokenHash,
      expires: new Date(Date.now() + TWO_FACTOR_LOGIN_TTL_MS),
    },
  });

  return pendingToken;
}

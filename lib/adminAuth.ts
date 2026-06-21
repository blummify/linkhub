import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { redis } from "@/lib/redis";
import { SUPER_ADMIN, type Role } from "@/lib/roles";
import { loginSchema } from "@/lib/validation/auth.schema";

/**
 * Super-admin credential verification for the admin subdomain login.
 *
 * Security properties:
 * - **No information leak.** Every failure (unknown email, OAuth-only account,
 *   wrong password, non-SUPER_ADMIN role, malformed input, rate limit) resolves
 *   to the same `null`, so the caller can only ever show a generic error.
 * - **Constant-ish time.** bcrypt.compare always runs — against a dummy hash when
 *   the user or password hash is missing — so response timing can't be used to
 *   enumerate which emails belong to super admins.
 * - **Brute-force resistance.** Failed attempts are rate limited per email,
 *   reusing the app's Redis limiter pattern.
 */

/** Pre-computed bcrypt hash used purely to equalise timing when no real hash exists. */
const DUMMY_HASH = "$2b$10$r.12ojPqkdLUSEB7BaIKiOxmIVP9gJvAEzPuK6BeXBCft./O4Twae";

const MAX_ATTEMPTS = 10;
const WINDOW_SECONDS = 15 * 60;

export type SuperAdminUser = {
  id: string;
  email: string | null;
  name: string | null;
  role: Role;
  emailVerified: Date | null;
};

function rateLimitKey(email: string): string {
  return `admin-login:${email}`;
}

/** Fail-open on Redis errors so a cache outage can't lock the sole admin out. */
async function isRateLimited(key: string): Promise<boolean> {
  try {
    const attempts = await redis.get<number>(key);
    return attempts !== null && attempts >= MAX_ATTEMPTS;
  } catch {
    return false;
  }
}

async function recordFailedAttempt(key: string): Promise<void> {
  try {
    const count = await redis.incr(key);
    if (count === 1) await redis.expire(key, WINDOW_SECONDS);
  } catch {
    // Non-fatal: a failed counter must not block the login response.
  }
}

export async function verifySuperAdminCredentials(
  rawEmail: unknown,
  rawPassword: unknown
): Promise<SuperAdminUser | null> {
  const parsed = loginSchema.safeParse({ email: rawEmail, password: rawPassword });
  if (!parsed.success) return null;

  // Normalise to lower case so casing never causes a self-inflicted lockout; the
  // seed script stores the email the same way.
  const email = parsed.data.email.toLowerCase();
  const { password } = parsed.data;
  const key = rateLimitKey(email);

  if (await isRateLimited(key)) return null;

  const user = await db.user.findUnique({ where: { email } });
  const passwordOk = await bcrypt.compare(password, user?.passwordHash ?? DUMMY_HASH);

  if (!user?.passwordHash || user.role !== SUPER_ADMIN || !passwordOk) {
    await recordFailedAttempt(key);
    return null;
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role as Role,
    emailVerified: user.emailVerified,
  };
}

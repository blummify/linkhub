import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { createHash } from "crypto";
import { headers } from "next/headers";
import authConfig from "./auth.config";
import { db } from "@/lib/db";
import { getCountryFromHeaders, getClientIp } from "@/lib/geo";
import { createPendingTwoFactorToken } from "@/lib/twoFactorChallenge";
import { verifySuperAdminCredentials } from "@/lib/adminAuth";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  trustHost: true,
  adapter: PrismaAdapter(db),
  callbacks: {
    ...authConfig.callbacks,
    async signIn({ user, account }) {
      if (account?.provider === "google" && user.id) {
        const dbUser = await db.user.findUnique({
          where: { id: user.id },
          select: { twoFactorEnabled: true, twoFactorSecret: true },
        });

        if (dbUser?.twoFactorEnabled && dbUser.twoFactorSecret) {
          const pendingToken = await createPendingTwoFactorToken(user.id);
          return `/login?2fa=${pendingToken}`;
        }
      }

      return true;
    },
  },
  events: {
    async signIn({ user }) {
      const id = user?.id;
      if (!id) return;

      // Request headers are best-effort: available when the event runs inside a
      // request scope (route handler / server action), null otherwise.
      let ip: string | null = null;
      let country: string | null = null;
      let userAgent: string | null = null;
      try {
        const hdrs = await headers();
        const get = (name: string) => hdrs.get(name);
        ip = getClientIp(get);
        country = getCountryFromHeaders(get);
        userAgent = get("user-agent");
      } catch {
        // Outside a request scope — record the login without location data.
      }

      try {
        await Promise.all([
          db.user.update({ where: { id }, data: { lastActiveAt: new Date() } }),
          db.loginEvent.create({ data: { userId: id, ip, country, userAgent } }),
          // Backfill country for accounts that predate signup capture.
          ...(country
            ? [db.user.updateMany({ where: { id, country: null }, data: { country } })]
            : []),
        ]);
      } catch {
        // Best-effort bookkeeping — sign-in must never fail because of it.
      }
    },
    async createUser({ user }) {
      const id = user.id;
      if (!id) return;
      await db.profile.upsert({
        where: { userId: id },
        create: { userId: id },
        update: {},
      });
      await db.subscription.upsert({
        where: { userId: id },
        create: { userId: id },
        update: {},
      });
      await db.user.update({
        where: { id },
        data: { emailVerified: new Date() },
      });
    },
  },
  providers: [
    ...authConfig.providers,
    Credentials({
      // Dedicated super-admin login (admin subdomain only). All validation,
      // constant-time password checks, role gating, and rate limiting live in
      // verifySuperAdminCredentials, which returns null for every failure so the
      // UI only ever shows a generic "Invalid credentials".
      id: "admin-credentials",
      name: "Admin Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize(credentials) {
        return verifySuperAdminCredentials(credentials?.email, credentials?.password);
      },
    }),
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        autoLoginToken: { label: "Auto Login Token", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email) return null;
        const email = credentials.email as string;

        if (credentials.autoLoginToken) {
          const tokenHash = createHash("sha256").update(credentials.autoLoginToken as string).digest("hex");
          const record = await db.verificationToken.findUnique({
            where: { token: tokenHash },
          });
          if (!record || record.identifier !== `auto:${email}` || record.expires < new Date()) return null;
          await db.verificationToken.deleteMany({ where: { identifier: `auto:${email}` } });
          const verified = await db.user.findUnique({ where: { email } });
          if (!verified) return null;
          return { id: verified.id, email: verified.email, name: verified.name, role: verified.role, emailVerified: verified.emailVerified };
        }

        if (!credentials?.password) return null;
        const user = await db.user.findUnique({ where: { email } });
        if (!user) return null;
        if (!user.passwordHash) throw new Error("oauth_account_no_password");

        const isValid = await bcrypt.compare(credentials.password as string, user.passwordHash);
        if (!isValid) return null;

        if (!user.emailVerified) {
          throw new Error("email_not_verified");
        }

        if (user.twoFactorEnabled && user.twoFactorSecret) {
          const pendingToken = await createPendingTwoFactorToken(user.id);
          throw new Error(`2fa_required:${pendingToken}`);
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          emailVerified: user.emailVerified,
        };
      },
    }),
  ],
});
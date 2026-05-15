import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import authConfig from "./auth.config";
import { db } from "@/lib/db";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(db),
  events: {
    async createUser({ user }) {
      const id = user.id;
      if (!id) return;
      await db.profile.upsert({
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
          const record = await db.verificationToken.findFirst({
            where: { identifier: `auto:${email}` },
          });
          if (!record || record.expires < new Date()) return null;
          if (record.token !== (credentials.autoLoginToken as string)) return null;
          await db.verificationToken.deleteMany({ where: { identifier: `auto:${email}` } });
          const verified = await db.user.findUnique({ where: { email } });
          if (!verified) return null;
          return { id: verified.id, email: verified.email, name: verified.name, role: verified.role, emailVerified: verified.emailVerified };
        }

        if (!credentials?.password) return null;
        const user = await db.user.findUnique({ where: { email } });
        if (!user || !user.passwordHash) return null;
        const isValid = await bcrypt.compare(credentials.password as string, user.passwordHash);
        if (!isValid) return null;

        // ✅ Block unverified users
        if (!user.emailVerified) {
          throw new Error("email_not_verified");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
});
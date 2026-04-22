import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";

const POST_SIGN_IN_DEFAULT = "/user-dashboard";

export default {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async session({ session, token }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as { role?: string }).role;
      }
      return token;
    },
    /**
     * After OAuth, NextAuth may return users to `callbackUrl` (e.g. /user-admin from a saved link).
     * We send them to the main app dashboard after sign-in instead of the editor route.
     */
    redirect({ url, baseUrl }) {
      const home = `${baseUrl}${POST_SIGN_IN_DEFAULT}`;
      if (url === baseUrl) return home;
      try {
        const target = new URL(url, baseUrl);
        if (target.origin !== new URL(baseUrl).origin) return home;
        const p = target.pathname;
        if (p === "/user-admin" || p.startsWith("/user-admin/")) {
          return home;
        }
        return target.href;
      } catch {
        return home;
      }
    },
  },
  pages: {
    signIn: "/login",
  },
} satisfies NextAuthConfig;

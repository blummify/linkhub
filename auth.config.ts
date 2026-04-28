import type { NextAuthConfig } from "next-auth";
import type { DefaultSession } from "next-auth";
import Google from "next-auth/providers/google";

const POST_SIGN_IN_DEFAULT = "/user-dashboard";

type SessionUser = NonNullable<DefaultSession["user"]> & {
  id: string;
  role: string;
};

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
        const user = session.user as SessionUser;
        user.id = token.sub;
        user.role = (token.role as string) ?? "USER";
        user.name = token.name ?? null;
        user.email = token.email ?? null;
        user.image = token.picture ?? null;
      }
      return session;
    },
    async jwt({ token, user, account, profile }) {
      if (user) {
        token.role = (user as { role?: string }).role ?? "USER";
        token.name = user.name ?? null;
        token.email = user.email ?? null;
        token.picture =
          user.image ??
          (typeof profile === "object" &&
          profile !== null &&
          "picture" in profile &&
          typeof (profile as { picture?: unknown }).picture === "string"
            ? (profile as { picture: string }).picture
            : null);
      }
      if (
        account?.provider === "google" &&
        profile &&
        typeof profile === "object" &&
        "picture" in profile &&
        typeof (profile as { picture?: unknown }).picture === "string"
      ) {
        token.picture = (profile as { picture: string }).picture;
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

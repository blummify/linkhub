import type { NextAuthConfig } from "next-auth";
import type { DefaultSession } from "next-auth";
import Google from "next-auth/providers/google";

const POST_SIGN_IN_DEFAULT = "/user-dashboard";

type SessionUser = NonNullable<DefaultSession["user"]> & {
  id: string;
  role: string;
  emailVerified?: Date | null;
};

export default {
  trustHost: true,
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: { params: { prompt: "select_account" } },
    }),
  ],
  session: { strategy: "jwt", maxAge: 24 * 60 * 60 },
  callbacks: {
    async session({ session, token }) {
      if (token.sub && session.user) {
        const user = session.user as SessionUser;
        user.id = token.sub;
        user.role = (token.role as string) ?? "USER";
        user.name = token.name ?? null;
        user.email = token.email ?? null;
        user.image = token.picture ?? null;
        user.emailVerified = (token.emailVerified as Date | null) ?? null;
      }
      return session;
    },
    async jwt({ token, user, account, profile, trigger, session }) {
      // Propagate client-initiated session updates (e.g. name/email changed on
      // the account page via useSession().update(...)) into the token.
      if (trigger === "update" && session) {
        const patch = session as { name?: unknown; email?: unknown };
        if (typeof patch.name === "string") token.name = patch.name;
        if (typeof patch.email === "string") token.email = patch.email;
      }
      if (user) {
        token.role = user.role ?? "USER";
        token.name = user.name ?? null;
        token.email = user.email ?? null;
        // Google already verifies email ownership; don't require a separate code step
        token.emailVerified =
          user.emailVerified ?? (account?.provider === "google" ? new Date() : null);
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
     * After OAuth, NextAuth may return users to `callbackUrl` (e.g. legacy `/user-admin` from a saved link).
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

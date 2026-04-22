import NextAuth from "next-auth";
import authConfig from "./auth.config";

const { auth } = NextAuth(authConfig);

/** Vercel / browsers may use `/login/`; exact match would fail and treat the route as protected. */
function normalizePathname(pathname: string) {
  if (pathname.length > 1 && pathname.endsWith("/")) {
    return pathname.replace(/\/+$/, "");
  }
  return pathname;
}

const PUBLIC_EXACT = new Set([
  "/",
  "/login",
  "/signup",
  "/features",
  "/pricing",
]);

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const { nextUrl } = req;
  const pathname = normalizePathname(nextUrl.pathname);

  const isApiAuthRoute = pathname.startsWith("/api/auth");
  const isPublicRoute = PUBLIC_EXACT.has(pathname);
  const isAuthRoute = pathname === "/login" || pathname === "/signup";

  if (isApiAuthRoute) return undefined;

  // Always allow /login and /signup (even when signed in) so people can add another
  // account, use incognito expectations, or sign out from the app and return here.
  if (isAuthRoute) return undefined;

  if (!isLoggedIn && !isPublicRoute) {
    return Response.redirect(new URL("/login", nextUrl));
  }

  return undefined;
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};

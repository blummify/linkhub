import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import authConfig from "./auth.config";
import { isPublicHandleRoute } from "./app/constants/reservedHandles";
import { ADMIN_LOGIN_PATH, decideAdminRoute, isAdminHost, isAdminInternalPath } from "./lib/adminRouting";

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
  "/verify-email",
  "/forgot-password",
  "/reset-password"
]);

/** Files in /public — must not require auth or `/_next/image` fetches get HTML (e.g. /login) and fail with "received null". */
const PUBLIC_STATIC_EXT = /\.(ico|png|jpg|jpeg|gif|webp|svg|txt|xml|webmanifest|woff2?)$/i;

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const { nextUrl } = req;
  const pathname = normalizePathname(nextUrl.pathname);

  if (PUBLIC_STATIC_EXT.test(pathname)) return undefined;

  // --- Admin subdomain (admin.{APP_DOMAIN}) ---------------------------------
  // Detect the host, guard for a SUPER_ADMIN session, and rewrite into the
  // internal /admin-portal/* tree. External URLs stay as admin.host/login.
  if (isAdminHost(req.headers.get("host") ?? "")) {
    // TODO: restore before production — bypass auth for UI dev, but still show login page
    const isSuperAdmin = pathname !== ADMIN_LOGIN_PATH;
    const decision = decideAdminRoute({ pathname, isSuperAdmin });
    const host = req.headers.get("host") ?? nextUrl.host;
    const adminBase = `${nextUrl.protocol}//${host}`;
    if (decision.type === "redirect") {
      return Response.redirect(new URL(decision.to, adminBase));
    }
    const rewriteUrl = nextUrl.clone();
    rewriteUrl.pathname = decision.to;
    return NextResponse.rewrite(rewriteUrl);
  }

  // The admin tree is reachable only through the admin subdomain rewrite above;
  // hide it from the main domain so it can't be hit directly.
  if (isAdminInternalPath(pathname)) {
    return new NextResponse(null, { status: 404 });
  }

  const isApiAuthRoute = pathname.startsWith("/api/auth");
  // Paystack webhook calls this without a user session; it authenticates via HMAC signature
  const isWebhookRoute = pathname.startsWith("/api/webhooks");
  const isPublicRoute = PUBLIC_EXACT.has(pathname) || isPublicHandleRoute(pathname);
  const isAuthRoute = pathname === "/login" || pathname === "/signup";

  if (isApiAuthRoute || isWebhookRoute) return undefined;

  // Always allow /login and /signup (even when signed in) so people can add another
  // account, use incognito expectations, or sign out from the app and return here.
  if (isAuthRoute) return undefined;

  // Authenticated users with unverified email can only access public routes.
  if (isLoggedIn && !req.auth?.user.emailVerified && !isPublicRoute) {
    const verifyUrl = new URL("/verify-email", nextUrl);
    if (req.auth?.user.email) verifyUrl.searchParams.set("email", req.auth.user.email);
    verifyUrl.searchParams.set("source", "login");
    return Response.redirect(verifyUrl);
  }

  if (!isLoggedIn && !isPublicRoute) {
    return Response.redirect(new URL("/login", nextUrl));
  }

  return undefined;
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};

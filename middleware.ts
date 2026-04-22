import { auth } from "@/auth";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const { nextUrl } = req;

  const isApiAuthRoute = nextUrl.pathname.startsWith("/api/auth");
  const isPublicRoute = ["/", "/login", "/signup"].includes(nextUrl.pathname);
  const isAuthRoute = ["/login", "/signup"].includes(nextUrl.pathname);

  if (isApiAuthRoute) return undefined;

  if (isAuthRoute) {
    if (isLoggedIn) {
      return Response.redirect(new URL("/user-dashboard", nextUrl));
    }
    return undefined;
  }

  if (!isLoggedIn && !isPublicRoute) {
    return Response.redirect(new URL("/login", nextUrl));
  }

  return undefined;
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};

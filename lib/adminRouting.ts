/**
 * Pure routing helpers for the admin subdomain (admin.{APP_DOMAIN}).
 *
 * Kept free of Next.js / Node imports so the decision logic is trivially unit
 * testable and safe to import from middleware. The middleware is a thin adapter
 * that turns these decisions into Responses.
 */

/** Internal path prefix the admin subdomain is rewritten into (folder app/admin-portal/). */
export const ADMIN_PREFIX = "/admin-portal";

export const ADMIN_LOGIN_PATH = "/login";
export const ADMIN_HOME_PATH = "/dashboard";

export type AdminRouteDecision =
  | { type: "redirect"; to: string }
  | { type: "rewrite"; to: string };

/** The admin app is served from admin.{APP_DOMAIN} (and admin.localhost in dev). */
export function isAdminHost(host: string): boolean {
  return host.split(":")[0].startsWith("admin.");
}

/** True for the internal rewrite tree, which must never be reachable from the main domain. */
export function isAdminInternalPath(pathname: string): boolean {
  return pathname === ADMIN_PREFIX || pathname.startsWith(`${ADMIN_PREFIX}/`);
}

/**
 * Decide what to do with a request on the admin subdomain.
 * - Non-super-admins (anonymous, USER, PRO) only ever reach the login page.
 * - An authenticated super-admin hitting the login page is sent to the dashboard.
 * - Everything allowed is rewritten into the internal /admin-portal/* tree.
 */
export function decideAdminRoute(opts: {
  pathname: string;
  isSuperAdmin: boolean;
}): AdminRouteDecision {
  const { pathname, isSuperAdmin } = opts;
  const isLoginPage = pathname === ADMIN_LOGIN_PATH;

  if (!isSuperAdmin) {
    if (!isLoginPage) return { type: "redirect", to: ADMIN_LOGIN_PATH };
  } else if (isLoginPage) {
    return { type: "redirect", to: ADMIN_HOME_PATH };
  }

  const target = pathname === "/" ? ADMIN_HOME_PATH : pathname;
  return { type: "rewrite", to: `${ADMIN_PREFIX}${target}` };
}

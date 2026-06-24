/**
 * Handles that must never be claimable — every existing top-level route segment
 * (so `/{handle}` never shadows a real app route) plus generic reserved words.
 */
const RESERVED_HANDLES = new Set([
  // (auth) route group
  "login",
  "signup",
  "forgot-password",
  "reset-password",
  "verify-email",
  // top-level marketing/admin pages
  "features",
  "pricing",
  "analytics",
  "super-admin",
  // (dashboard) route group
  "billing",
  "branding",
  "help",
  "links",
  "my-account",
  "user-admin",
  "user-analytics",
  "user-dashboard",
  // generic reserved words
  "admin",
  "api",
  "dashboard",
  "settings",
  "support",
  "about",
  "terms",
  "privacy",
  "blog",
  "docs",
  "static",
  "public",
  "assets",
  "og",
  "www",
]);

export function isReservedHandle(handle: string): boolean {
  return RESERVED_HANDLES.has(handle.toLowerCase());
}

export const HANDLE_REGEX = /^[a-zA-Z0-9_]{3,24}$/;

/** `/{handle}` public profile pages — single path segment, valid handle format, not a reserved app route. */
export function isPublicHandleRoute(pathname: string): boolean {
  const segment = pathname.startsWith("/") ? pathname.slice(1) : pathname;
  if (!segment || segment.includes("/")) return false;
  if (!HANDLE_REGEX.test(segment)) return false;
  return !isReservedHandle(segment);
}

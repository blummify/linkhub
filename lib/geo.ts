import { detectCurrency, type CurrencyCode } from "./currencies";

/**
 * Resolve the client's IP from request headers — `x-forwarded-for` (first hop) with
 * `x-real-ip` as fallback. Only import this from Server Components / Route Handlers.
 */
export function getClientIp(get: (name: string) => string | null): string | null {
  const forwarded = get("x-forwarded-for");
  const ip = (forwarded ? forwarded.split(",")[0] : (get("x-real-ip") ?? "")).trim();
  return ip || null;
}

/**
 * Resolve the client's ISO 3166-1 alpha-2 country code from request headers,
 * or null when nothing identifies one.
 * Only import this from Server Components / Route Handlers — never from client components.
 *
 * Priority:
 *   1. x-vercel-ip-country — injected by Vercel (dev / preview)
 *   2. geoip-lite          — in-process IP lookup, works on any Node.js host (VPS, etc.)
 *   3. accept-language     — browser locale header, universal last resort
 */
export function detectCountryFromHeaders(get: (name: string) => string | null): string | null {
  // 1. Vercel
  const vercel = get("x-vercel-ip-country");
  if (vercel) return vercel.toUpperCase();

  // 2. geoip-lite — Node.js only, bundled MaxMind database
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const geoip = require("geoip-lite") as {
      lookup: (ip: string) => { country?: string } | null;
    };
    const ip = getClientIp(get);
    if (ip) {
      const geo = geoip.lookup(ip);
      if (geo?.country) return geo.country;
    }
  } catch {
    // geoip-lite not available — skip silently
  }

  // 3. accept-language: "en-GH,en;q=0.9" → "GH"
  const lang = get("accept-language") ?? "";
  const match = lang.match(/[a-z]{2}-([A-Z]{2})/);
  return match ? match[1] : null;
}

/**
 * Resolve the visitor's currency from request headers (same source priority as
 * {@link detectCountryFromHeaders}).
 */
export function detectCurrencyFromHeaders(
  get: (name: string) => string | null
): CurrencyCode {
  const country = detectCountryFromHeaders(get);
  return country ? detectCurrency(country) : "USD";
}

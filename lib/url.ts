// The most common TLD — appended to a single-label input that has no dot.
const DEFAULT_TLD = "com";

// Already-schemed if it has scheme:// (http, https, ftp…) or mailto:
function hasScheme(s: string): boolean {
  return /^[a-zA-Z][\w+.-]*:\/\//.test(s) || /^mailto:/i.test(s);
}

/**
 * Prepend `https://` to a bare domain; leave schemed input untouched. A single label
 * with no dot in the host (e.g. "google") gets `.com` appended before the scheme, so
 * "google" → "https://google.com" and "google/path" → "https://google.com/path".
 */
export function normalizeUrl(input: string): string {
  const t = input.trim();
  if (!t) return t;
  if (hasScheme(t)) return t;
  const host = t.split(/[/?#]/)[0]; // host portion, ignoring path/query/hash
  const withTld = host.includes(".") ? t : `${host}.${DEFAULT_TLD}${t.slice(host.length)}`;
  return `https://${withTld}`;
}

/**
 * Schemed input: valid if it parses as http/https (or mailto with a target) — we trust
 * what the user explicitly typed. Bare input: valid if, after normalization, it parses to
 * a dotted hostname with no whitespace/empty labels — so single words become "word.com"
 * (valid) while multi-word junk ("not a url") still fails.
 */
export function isValidUrl(input: string): boolean {
  const t = input.trim();
  if (!t) return false;
  if (hasScheme(t)) {
    try {
      const u = new URL(t);
      if (u.protocol === "mailto:") return u.pathname.length > 0;
      return u.protocol === "http:" || u.protocol === "https:";
    } catch {
      return false;
    }
  }
  try {
    const u = new URL(normalizeUrl(t));
    return /^[^\s.]+(\.[^\s.]+)+$/.test(u.hostname); // label(.label)+ , no spaces/empty parts
  } catch {
    return false;
  }
}

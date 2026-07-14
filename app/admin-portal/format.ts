/** Shared display formatters for admin data (deterministic across locales). */

const DATE_FORMAT = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

/** ISO date string → "24 May 2026". */
export function formatDate(iso: string): string {
  return DATE_FORMAT.format(new Date(iso));
}

/** 8420 → "8,420". */
export function formatNumber(value: number): string {
  return value.toLocaleString("en-US");
}

const DATE_TIME_FORMAT = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
  timeZone: "UTC",
});

/** ISO timestamp → "24 May 2026, 14:32" (UTC). */
export function formatDateTime(iso: string): string {
  return DATE_TIME_FORMAT.format(new Date(iso));
}

/** Reduce a raw User-Agent header to a recognisable browser name. */
export function summarizeUserAgent(userAgent: string): string {
  // Edge and Opera embed "Chrome/", and Chrome embeds "Safari/", so order matters.
  if (/edg\//i.test(userAgent)) return "Edge";
  if (/opr\//i.test(userAgent)) return "Opera";
  if (/chrome\//i.test(userAgent)) return "Chrome";
  if (/version\/.*safari\//i.test(userAgent)) return "Safari";
  if (/firefox\//i.test(userAgent)) return "Firefox";
  return userAgent.length > 40 ? `${userAgent.slice(0, 40)}…` : userAgent;
}

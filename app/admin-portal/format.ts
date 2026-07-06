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

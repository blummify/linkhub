/**
 * Click-analytics helpers.
 *
 * These are intentionally pure and dependency-free so they can be unit-tested
 * and reused across the dashboard. The only source of truth for clicks is the
 * cumulative `Link.clicks` integer (surfaced as a display string in the links
 * store), so everything here derives from that total.
 */

/** Parse a clicks value that may be a number or a display string like "1,240". */
export function parseClicks(value: string | number): number {
  const n = typeof value === "number" ? value : Number(String(value).replace(/,/g, ""));
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 0;
}

/** Sum the clicks across a set of links. */
export function sumClicks(links: { clicks: string }[]): number {
  return links.reduce((total, link) => total + parseClicks(link.clicks), 0);
}

/** Format a clicks total for display, e.g. 1234 -> "1,234". */
export function formatClicks(n: number): string {
  return Math.max(0, Math.floor(n)).toLocaleString("en-US");
}

/**
 * Small deterministic PRNG (mulberry32). Same seed -> same sequence, so the
 * derived chart is stable across re-renders and never reshuffles on the user.
 */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Distribute a cumulative `total` across `days` buckets to form a plausible
 * time series. There is no real per-day history in the DB, so the shape is
 * synthesized — but it is deterministic for a given `(total, days)` and is
 * guaranteed to sum back to exactly `total`.
 */
export function buildClicksSeries(total: number, days: number): number[] {
  const n = Math.max(0, Math.floor(days));
  if (n === 0) return [];

  const safeTotal = Math.max(0, Math.floor(total));
  if (safeTotal === 0) return new Array(n).fill(0);

  // Seed from the inputs so the curve is stable and unique per (total, days).
  const rand = mulberry32(safeTotal * 2654435761 + n);

  // Weight each day, then scale weights to the total.
  const weights = Array.from({ length: n }, () => 0.4 + rand());
  const weightSum = weights.reduce((s, w) => s + w, 0);

  const series = weights.map((w) => Math.floor((w / weightSum) * safeTotal));

  // Assign the rounding remainder to the heaviest-weighted day so the series
  // always sums to exactly `total`.
  let remainder = safeTotal - series.reduce((s, v) => s + v, 0);
  while (remainder > 0) {
    let maxIdx = 0;
    for (let i = 1; i < weights.length; i++) {
      if (weights[i] > weights[maxIdx]) maxIdx = i;
    }
    series[maxIdx] += 1;
    weights[maxIdx] = 0; // don't pile the entire remainder onto one bucket
    remainder -= 1;
    if (weights.every((w) => w === 0)) {
      // Fallback: spread anything left over from the start.
      for (let i = 0; remainder > 0; i = (i + 1) % n) {
        series[i] += 1;
        remainder -= 1;
      }
    }
  }

  return series;
}

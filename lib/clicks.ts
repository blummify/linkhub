/**
 * Click-analytics helpers.
 *
 * These are intentionally pure and dependency-free so they can be unit-tested
 * and reused across the dashboard. All-time totals come from the cumulative
 * `Link.clicks` integer; the per-day time series comes from the `ClickDaily`
 * table (via the `getClicksSeries` action) and is shaped into a fixed-length
 * array by `fillSeries`.
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
 * time series. There is no real per-day history for this shape, so it is
 * synthesized — deterministic for a given `(total, days)` and guaranteed to sum
 * back to exactly `total`.
 *
 * NOTE: real per-day data now powers the main "Clicks over time" chart on
 * `/user-analytics` (via `fillSeries` + `getClicksSeries`). This helper remains
 * only for small DECORATIVE sparklines that don't claim to be a dated axis: the
 * Total Clicks KPI card on the links page and the per-link trend sparklines in
 * the analytics "Top links" list (which have no per-link daily source yet).
 * Prefer `fillSeries` for any real, labeled time series.
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

/** Normalise a Date or date-ish string to a `YYYY-MM-DD` UTC day key. */
function dayKey(value: Date | string): string {
  const d = value instanceof Date ? value : new Date(value);
  return d.toISOString().slice(0, 10);
}

/**
 * Shape per-day `ClickDaily` rows into a fixed-length series of length `days`,
 * ordered oldest -> newest and ending on today (UTC). Missing days are filled
 * with 0, so the chart always has a continuous axis even when no clicks landed
 * on a given day. Rows outside the window are ignored.
 */
export function fillSeries(
  rows: { day: Date | string; count: number }[],
  days: number
): number[] {
  const n = Math.max(0, Math.floor(days));
  if (n === 0) return [];

  const counts = new Map<string, number>();
  for (const row of rows) {
    const key = dayKey(row.day);
    counts.set(key, (counts.get(key) ?? 0) + Math.max(0, Math.floor(row.count)));
  }

  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  const series: number[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setUTCDate(d.getUTCDate() - i);
    series.push(counts.get(d.toISOString().slice(0, 10)) ?? 0);
  }
  return series;
}

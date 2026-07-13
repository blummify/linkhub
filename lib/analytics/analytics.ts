import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { DEVICE_DIMENSIONS } from "./dimensions";

/** Truncates a Date to UTC midnight — the bucket boundary for every `Analytics.date` value. */
export function truncateToUtcDate(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

function toIsoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/**
 * Atomic increment of today's (userId, date, metric, dimension) row. Raw SQL — not
 * `prisma.analytics.upsert()` — to guarantee a single `INSERT ... ON CONFLICT` statement
 * rather than depend on the ORM's upsert compiling to one under concurrent load.
 * Never throws; failures are logged only, matching the existing click-tracking precedent
 * in app/api/r/[id]/route.ts.
 */
export async function incrementMetric(
  userId: string,
  metric: string,
  dimension = "total"
): Promise<void> {
  const date = truncateToUtcDate(new Date());
  try {
    await db.$executeRaw`
      INSERT INTO "Analytics" ("userId", date, metric, dimension, count, "updatedAt")
      VALUES (${userId}, ${date}, ${metric}, ${dimension}, 1, now())
      ON CONFLICT ("userId", date, metric, dimension)
      DO UPDATE SET count = "Analytics".count + 1, "updatedAt" = now()
    `;
  } catch (error) {
    console.error("Error incrementing analytics metric:", error);
  }
}

/**
 * Lifetime total for a metric. Defaults to summing only the device-dimension rows
 * (`mobile`/`desktop`/`tablet`) — an exhaustive partition, since every tracked event
 * writes exactly one of those three, so this gives the true total without needing to
 * know about every dimension category a metric writes (device + referrer + country
 * would otherwise triple-count if summed together).
 */
export async function getMetricTotal(
  userId: string,
  metric: string,
  dimensions: readonly string[] = DEVICE_DIMENSIONS
): Promise<number> {
  const rows = await db.$queryRaw<{ total: number | null }[]>`
    SELECT CAST(SUM(count) AS INTEGER) as total
    FROM "Analytics"
    WHERE "userId" = ${userId} AND metric = ${metric}
      AND dimension IN (${Prisma.join(dimensions)})
  `;
  return rows[0]?.total ?? 0;
}

/**
 * Daily series for the last `days` days (inclusive of today), zero-filled for days with
 * no rows. Defaults to summing only the device-dimension rows (see getMetricTotal) so
 * a metric writing multiple dimension categories per event isn't triple-counted.
 */
export async function getMetricSeries(
  userId: string,
  metric: string,
  days: number,
  dimensions: readonly string[] = DEVICE_DIMENSIONS
): Promise<{ date: string; count: number }[]> {
  const today = truncateToUtcDate(new Date());
  const cutoff = new Date(today);
  cutoff.setUTCDate(cutoff.getUTCDate() - (days - 1));

  const rows = await db.$queryRaw<{ date: Date; total: number | null }[]>`
    SELECT date, CAST(SUM(count) AS INTEGER) as total
    FROM "Analytics"
    WHERE "userId" = ${userId} AND metric = ${metric} AND date >= ${cutoff}
      AND dimension IN (${Prisma.join(dimensions)})
    GROUP BY date
  `;

  const byDate = new Map(rows.map((r) => [toIsoDate(r.date), r.total ?? 0]));

  const series: { date: string; count: number }[] = [];
  const cursor = new Date(cutoff);
  for (let i = 0; i < days; i++) {
    const iso = toIsoDate(cursor);
    series.push({ date: iso, count: byDate.get(iso) ?? 0 });
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return series;
}

type DimensionFilter = { include: readonly string[] } | { exclude: readonly string[] };

/**
 * Sums `count` grouped by dimension, across one or more metrics, optionally scoped to
 * a `[since, until]` UTC date window (both inclusive, either bound optional).
 * `filter.include` selects a known category (DEVICE_DIMENSIONS / SOURCE_DIMENSIONS);
 * `filter.exclude` isolates the open-ended country category via NON_COUNTRY_DIMENSIONS.
 * Powers the Traffic Sources, Devices, and Geography dashboard panels.
 */
export async function getMetricBreakdown(
  userId: string,
  metrics: readonly string[],
  filter: DimensionFilter,
  since?: Date,
  until?: Date
): Promise<{ dimension: string; count: number }[]> {
  const dimensionClause =
    "include" in filter
      ? Prisma.sql`dimension IN (${Prisma.join(filter.include)})`
      : Prisma.sql`dimension NOT IN (${Prisma.join(filter.exclude)})`;
  const sinceClause = since ? Prisma.sql`AND date >= ${since}` : Prisma.empty;
  const untilClause = until ? Prisma.sql`AND date <= ${until}` : Prisma.empty;

  const rows = await db.$queryRaw<{ dimension: string; total: number | null }[]>`
    SELECT dimension, CAST(SUM(count) AS INTEGER) as total
    FROM "Analytics"
    WHERE "userId" = ${userId} AND metric IN (${Prisma.join(metrics)}) AND ${dimensionClause} ${sinceClause} ${untilClause}
    GROUP BY dimension
    ORDER BY total DESC
  `;
  return rows.map((r) => ({ dimension: r.dimension, count: r.total ?? 0 }));
}

/**
 * Daily series between explicit start/end dates (inclusive, UTC), zero-filled for days
 * with no rows. Complements getMetricSeries, which covers "last N days from today" —
 * this variant powers custom date-range selections. Defaults to the device-dimension
 * partition for the same overcounting reasons as getMetricTotal/getMetricSeries.
 */
export async function getMetricSeriesForRange(
  userId: string,
  metric: string,
  start: Date,
  end: Date,
  dimensions: readonly string[] = DEVICE_DIMENSIONS
): Promise<{ date: string; count: number }[]> {
  const rows = await db.$queryRaw<{ date: Date; total: number | null }[]>`
    SELECT date, CAST(SUM(count) AS INTEGER) as total
    FROM "Analytics"
    WHERE "userId" = ${userId} AND metric = ${metric} AND date >= ${start} AND date <= ${end}
      AND dimension IN (${Prisma.join(dimensions)})
    GROUP BY date
  `;

  const byDate = new Map(rows.map((r) => [toIsoDate(r.date), r.total ?? 0]));
  const days = Math.round((end.getTime() - start.getTime()) / 86_400_000) + 1;

  const series: { date: string; count: number }[] = [];
  const cursor = new Date(start);
  for (let i = 0; i < days; i++) {
    const iso = toIsoDate(cursor);
    series.push({ date: iso, count: byDate.get(iso) ?? 0 });
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return series;
}

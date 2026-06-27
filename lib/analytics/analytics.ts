import { db } from "@/lib/db";

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

/** Lifetime total for a metric, summed across every dimension and date. */
export async function getMetricTotal(userId: string, metric: string): Promise<number> {
  const rows = await db.$queryRaw<{ total: number | null }[]>`
    SELECT CAST(SUM(count) AS INTEGER) as total
    FROM "Analytics"
    WHERE "userId" = ${userId} AND metric = ${metric}
  `;
  return rows[0]?.total ?? 0;
}

/**
 * Daily series for the last `days` days (inclusive of today), zero-filled for days with
 * no rows. Sums across whatever dimension rows exist per day, so this keeps working
 * unchanged once a future metric starts writing dimensioned rows instead of "total" ones.
 */
export async function getMetricSeries(
  userId: string,
  metric: string,
  days: number
): Promise<{ date: string; count: number }[]> {
  const today = truncateToUtcDate(new Date());
  const cutoff = new Date(today);
  cutoff.setUTCDate(cutoff.getUTCDate() - (days - 1));

  const rows = await db.$queryRaw<{ date: Date; total: number | null }[]>`
    SELECT date, CAST(SUM(count) AS INTEGER) as total
    FROM "Analytics"
    WHERE "userId" = ${userId} AND metric = ${metric} AND date >= ${cutoff}
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

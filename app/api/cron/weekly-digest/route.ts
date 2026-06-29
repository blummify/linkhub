import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { postly } from "@/lib/postly";
import { getMetricSeries, truncateToUtcDate } from "@/lib/analytics/analytics";
import { ANALYTICS_METRIC } from "@/app/constants/analyticsMetrics";

interface WeekRange {
  from: Date;
  to: Date;
}

function thisWeekRange(): WeekRange {
  const to = truncateToUtcDate(new Date());
  const from = new Date(to);
  from.setUTCDate(from.getUTCDate() - 6);
  return { from, to };
}

function lastWeekRange(): WeekRange {
  const to = truncateToUtcDate(new Date());
  const thisFrom = new Date(to);
  thisFrom.setUTCDate(thisFrom.getUTCDate() - 6);
  const lastTo = new Date(thisFrom);
  lastTo.setUTCDate(lastTo.getUTCDate() - 1);
  const lastFrom = new Date(lastTo);
  lastFrom.setUTCDate(lastFrom.getUTCDate() - 6);
  return { from: lastFrom, to: lastTo };
}

function sumSeries(series: { date: string; count: number }[], from: Date, to: Date): number {
  const fromIso = from.toISOString().slice(0, 10);
  const toIso = to.toISOString().slice(0, 10);
  return series
    .filter((s) => s.date >= fromIso && s.date <= toIso)
    .reduce((acc, s) => acc + s.count, 0);
}

function wowChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const thisWeek = thisWeekRange();
  const lastWeek = lastWeekRange();

  const profiles = await db.profile.findMany({
    where: { notificationsDigest: true },
    select: {
      userId: true,
      user: { select: { email: true, name: true } },
    },
  });

  let sent = 0;
  let skipped = 0;

  for (const profile of profiles) {
    if (!profile.user.email) { skipped++; continue; }

    const [viewSeries, clickRows, topLinkRows] = await Promise.all([
      getMetricSeries(profile.userId, ANALYTICS_METRIC.PROFILE_VIEW, 14),
      db.clickDaily.findMany({
        where: { userId: profile.userId, day: { gte: lastWeek.from } },
        select: { linkId: true, day: true, count: true },
      }),
      db.clickDaily.findMany({
        where: { userId: profile.userId, day: { gte: thisWeek.from, lte: thisWeek.to } },
        select: { linkId: true, count: true, link: { select: { title: true } } },
      }),
    ]);

    const viewsThisWeek = sumSeries(viewSeries, thisWeek.from, thisWeek.to);
    const viewsLastWeek = sumSeries(viewSeries, lastWeek.from, lastWeek.to);

    const clicksThisWeek = clickRows
      .filter((r) => {
        const d = r.day instanceof Date ? r.day.toISOString().slice(0, 10) : String(r.day).slice(0, 10);
        return d >= thisWeek.from.toISOString().slice(0, 10) && d <= thisWeek.to.toISOString().slice(0, 10);
      })
      .reduce((acc, r) => acc + r.count, 0);

    const clicksLastWeek = clickRows
      .filter((r) => {
        const d = r.day instanceof Date ? r.day.toISOString().slice(0, 10) : String(r.day).slice(0, 10);
        return d >= lastWeek.from.toISOString().slice(0, 10) && d <= lastWeek.to.toISOString().slice(0, 10);
      })
      .reduce((acc, r) => acc + r.count, 0);

    if (viewsThisWeek === 0 && clicksThisWeek === 0) { skipped++; continue; }

    // Aggregate clicks per link this week for top link + CTR
    const byLink = new Map<string, { title: string; clicks: number }>();
    for (const row of topLinkRows) {
      const existing = byLink.get(row.linkId);
      byLink.set(row.linkId, {
        title: row.link.title,
        clicks: (existing?.clicks ?? 0) + row.count,
      });
    }

    let topLink: { title: string; clicks: number } | null = null;
    for (const entry of byLink.values()) {
      if (!topLink || entry.clicks > topLink.clicks) topLink = entry;
    }

    // CTR per link: (link clicks this week / profile views this week) × 100
    const linkCtrs = Array.from(byLink.entries()).map(([, { title, clicks }]) => ({
      title,
      clicks,
      ctr: viewsThisWeek > 0 ? ((clicks / viewsThisWeek) * 100).toFixed(1) : "—",
    }));

    try {
      await postly.send({
        template: process.env.POSTLY_TEMPLATE_WEEKLY_DIGEST!,
        to: [profile.user.email],
        data: {
          name: profile.user.name ?? "there",
          viewsThisWeek,
          viewsWow: wowChange(viewsThisWeek, viewsLastWeek),
          clicksThisWeek,
          clicksWow: wowChange(clicksThisWeek, clicksLastWeek),
          topLinkTitle: topLink?.title ?? null,
          topLinkClicks: topLink?.clicks ?? 0,
          linkCtrs,
          unsubscribeUrl: `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/my-account`,
        },
      });
      sent++;
    } catch (error) {
      console.error(`[weekly-digest] Failed to send for ${profile.userId}:`, error);
    }
  }

  return NextResponse.json({ sent, skipped });
}

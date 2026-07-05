import { NextRequest, NextResponse } from "next/server";
import { after } from "next/server";
import { db } from "@/lib/db";
import { incrementMetric } from "@/lib/analytics/analytics";
import { ANALYTICS_METRIC } from "@/app/constants/analyticsMetrics";
import { detectDeviceType } from "@/lib/analytics/device";
import { normalizeReferrer } from "@/lib/analytics/referrer";
import { getCountryFromHeaders } from "@/lib/geo";
import { UNKNOWN_COUNTRY } from "@/lib/analytics/dimensions";
import { APP_DOMAIN } from "@/lib/appConfig";

/** Public click-through redirect for `/{handle}` link cards — tracks `Link.clicks` without blocking the redirect. */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const link = await db.link.findUnique({
    where: { id },
    select: { url: true, userId: true },
  });

  if (!link) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  after(async () => {
    try {
      // Bump the all-time counter and today's per-day bucket. The bucket powers the
      // dashboard time-series chart; `day` is normalised to UTC midnight so all of a
      // day's clicks land in one row.
      const day = new Date();
      day.setUTCHours(0, 0, 0, 0);
      await db.$transaction([
        db.link.update({ where: { id }, data: { clicks: { increment: 1 } } }),
        db.clickDaily.upsert({
          where: { linkId_day: { linkId: id, day } },
          create: { linkId: id, userId: link.userId, day, count: 1 },
          update: { count: { increment: 1 } },
        }),
      ]);
    } catch (error) {
      console.error("Error incrementing link clicks:", error);
    }
  });

  const userAgent = req.headers.get("user-agent");
  const referrer = req.headers.get("referer");
  const country = getCountryFromHeaders((name) => req.headers.get(name));

  after(async () => {
    try {
      const device = detectDeviceType(userAgent);
      const source = normalizeReferrer(referrer, `https://${APP_DOMAIN}`);
      const countryDim = country ?? UNKNOWN_COUNTRY;
      await Promise.all([
        incrementMetric(link.userId, ANALYTICS_METRIC.LINK_CLICK, device),
        incrementMetric(link.userId, ANALYTICS_METRIC.LINK_CLICK, source),
        incrementMetric(link.userId, ANALYTICS_METRIC.LINK_CLICK, countryDim),
      ]);
    } catch (error) {
      console.error("Error recording link click dimensions:", error);
    }
  });

  return NextResponse.redirect(link.url, 307);
}

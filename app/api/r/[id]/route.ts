import { NextRequest, NextResponse } from "next/server";
import { after } from "next/server";
import { db } from "@/lib/db";

/** Public click-through redirect for `/{handle}` link cards — tracks `Link.clicks` without blocking the redirect. */
export async function GET(
  _req: NextRequest,
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

  return NextResponse.redirect(link.url, 307);
}

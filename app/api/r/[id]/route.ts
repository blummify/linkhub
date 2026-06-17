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
    select: { url: true },
  });

  if (!link) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  after(async () => {
    try {
      await db.link.update({ where: { id }, data: { clicks: { increment: 1 } } });
    } catch (error) {
      console.error("Error incrementing link clicks:", error);
    }
  });

  return NextResponse.redirect(link.url, 307);
}

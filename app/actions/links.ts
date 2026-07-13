"use server";

import { after } from "next/server";
import { db } from "@/lib/db";
import { redis } from "@/lib/redis";
import type { LinkRow } from "@/lib/linkRow";
import { auth } from "@/auth";
import { addLinkSchema } from "@/lib/validation/link.schema";
import { LinkStatusValue } from "@/app/constants/linkStatus";
import { isReservedHandle, HANDLE_REGEX } from "@/app/constants/reservedHandles";
import { deleteFromR2 } from "@/lib/r2";
import { fillSeries } from "@/lib/clicks";
import {
  SITEMAP_COUNT_CACHE_KEY, SITEMAP_PAGE_CACHE_KEY_PREFIX,
} from "@/lib/cacheKeys";

const LINKS_TTL = 300;   // 5 minutes
const PROFILE_TTL = 300; // 5 minutes

export async function getLinks(): Promise<LinkRow[]> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const cacheKey = `links:${session.user.id}`;

  // Redis read — falls through silently when credentials are missing
  try {
    const cached = await redis.get<LinkRow[]>(cacheKey);
    if (cached) return cached;
  } catch {}

  // DB query always runs whether Redis is available or not
  try {
    const links = await db.link.findMany({
      where: { userId: session.user.id },
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    });
    try { await redis.set(cacheKey, links, { ex: LINKS_TTL }); } catch {}
    return links;
  } catch (error) {
    console.error("Error fetching links:", error);
    return [];
  }
}

export async function getLinksCount() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  try {
    const count = await db.link.count({
      where: { userId: session.user.id },
    });
    return { count };
  } catch (error) {
    console.error("Error counting links:", error);
    return { count: 0 };
  }
}

/**
 * Real per-day click counts for the signed-in user, as a fixed-length series of
 * length `days` (oldest -> newest, ending today UTC, missing days filled with 0).
 * Powers the dashboard "Clicks over time" chart. Reads from `ClickDaily`; not
 * cached, so it reflects the latest clicks on refresh.
 */
export async function getClicksSeries(days: number): Promise<number[]> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const span = Math.max(1, Math.min(365, Math.floor(days) || 0));

  const since = new Date();
  since.setUTCHours(0, 0, 0, 0);
  since.setUTCDate(since.getUTCDate() - (span - 1));

  try {
    const rows = await db.clickDaily.findMany({
      where: { userId: session.user.id, day: { gte: since } },
      select: { day: true, count: true },
    });
    return fillSeries(rows, span);
  } catch (error) {
    console.error("Error fetching click series:", error);
    return new Array(span).fill(0);
  }
}

/**
 * Real per-day click counts for the signed-in user between explicit start/end
 * dates (inclusive, UTC). Complements getClicksSeries ("last N days from today")
 * for custom date-range selections.
 */
export async function getClicksSeriesForRange(start: Date, end: Date): Promise<number[]> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const days = Math.max(1, Math.round((end.getTime() - start.getTime()) / 86_400_000) + 1);

  try {
    const rows = await db.clickDaily.findMany({
      where: { userId: session.user.id, day: { gte: start, lte: end } },
      select: { day: true, count: true },
    });
    return fillSeries(rows, days);
  } catch (error) {
    console.error("Error fetching click series for range:", error);
    return new Array(days).fill(0);
  }
}

/**
 * Top 5 links by clicks within [start, end] (inclusive, UTC), grouped from
 * ClickDaily. Used for both the 7/30/90/all range pills and custom ranges, so
 * "Top links" reflects the selected window instead of always showing lifetime
 * Link.clicks totals.
 */
export async function getTopLinksForRange(start: Date, end: Date): Promise<{ linkId: string; clicks: number }[]> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  try {
    const rows = await db.clickDaily.groupBy({
      by: ["linkId"],
      where: { userId: session.user.id, day: { gte: start, lte: end } },
      _sum: { count: true },
      orderBy: { _sum: { count: "desc" } },
      take: 5,
    });
    return rows.map((r) => ({ linkId: r.linkId, clicks: r._sum.count ?? 0 }));
  } catch (error) {
    console.error("Error fetching top links for range:", error);
    return [];
  }
}

export async function addLink(data: {
  title: string;
  url: string;
  icon?: string;
  status?: LinkStatusValue;
  thumbnailUrl?: string;
  thumbnailKey?: string;
}) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const parsed = addLinkSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  try {

    const checkExistingLink = await db.link.findFirst({
      where: {url: parsed.data.url, userId: session.user.id},
      select: {id: true},
    });
    if (checkExistingLink) {
      return {error: "You already have a link with this URL."};
    }

    const link = await db.link.create({
      data: { ...parsed.data, userId: session.user.id },
    });
    // Cache invalidation is best-effort — a Redis failure must not mask a successful write
    try { await redis.del(`links:${session.user.id}`); } catch {}
    return { success: true, link };
  } catch (error) {
    console.error("Error adding link:", error);
    return { error: "Failed to add link" };
  }
}

export async function updateLink(id: string, data: {
  title?: string;
  url?: string;
  icon?: string;
  status?: LinkStatusValue;
  thumbnailUrl?: string | null;
  thumbnailKey?: string | null;
}) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  try {
    let oldThumbnailKey: string | null = null;
    if ("thumbnailKey" in data) {
      const current = await db.link.findUnique({
        where: { id, userId: session.user.id },
        select: { thumbnailKey: true },
      });
      oldThumbnailKey = current?.thumbnailKey ?? null;
    }

    const link = await db.link.update({
      where: { id, userId: session.user.id },
      data,
    });

    if (oldThumbnailKey && oldThumbnailKey !== data.thumbnailKey) {
      after(async () => {
        try { await deleteFromR2(oldThumbnailKey!); } catch {}
      });
    }

    try { await redis.del(`links:${session.user.id}`); } catch {}
    return { success: true, link };
  } catch (error) {
    console.error("Error updating link:", error);
    return { error: "Failed to update link" };
  }
}

export async function deleteLink(id: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  try {
    const current = await db.link.findUnique({
      where: { id, userId: session.user.id },
      select: { thumbnailKey: true },
    });

    await db.link.delete({
      where: { id, userId: session.user.id },
    });

    if (current?.thumbnailKey) {
      const key = current.thumbnailKey;
      after(async () => {
        try { await deleteFromR2(key); } catch {}
      });
    }

    try { await redis.del(`links:${session.user.id}`); } catch {}
    return { success: true };
  } catch (error) {
    console.error("Error deleting link:", error);
    return { error: "Failed to delete link" };
  }
}

export async function reorderLinks(orderedIds: string[]) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  try {
    await db.$transaction(
      orderedIds.map((id, index) =>
        db.link.update({
          where: { id, userId: session.user.id },
          data: { order: index },
        })
      )
    );
    try { await redis.del(`links:${session.user.id}`); } catch {}
    return { success: true };
  } catch (error) {
    console.error("Error reordering links:", error);
    return { error: "Failed to save order" };
  }
}

export async function getProfile() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const cacheKey = `profile:${session.user.id}`;

  // Redis read — falls through silently when credentials are missing
  try {
    const cached = await redis.get(cacheKey);
    if (cached) return cached as Awaited<ReturnType<typeof fetchProfile>>;
  } catch {}

  // DB query always runs whether Redis is available or not
  try {
    return await fetchProfile(session.user.id, cacheKey);
  } catch (error) {
    console.error("Error fetching profile:", error);
    return null;
  }
}

async function fetchProfile(userId: string, cacheKey: string) {
  const userSelect = { select: { id: true, name: true, email: true, image: true } } as const;

  let profile = await db.profile.findUnique({
    where: { userId },
    include: { user: userSelect },
  });

  if (!profile) {
    profile = await db.profile.create({
      data: { userId },
      include: { user: userSelect },
    });
  }

  // Best-effort cache write — never let a Redis failure mask a successful DB read
  try { await redis.set(cacheKey, profile, { ex: PROFILE_TTL }); } catch {}
  return profile;
}

export async function claimHandle(handle: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  if (!HANDLE_REGEX.test(handle)) {
    return { error: "Handle must be 3–24 characters: letters, numbers, underscores only." };
  }

  if (isReservedHandle(handle)) {
    return { error: "That handle is reserved. Try another." };
  }

  try {
    const taken = await db.profile.findFirst({ where: { handle }, select: { userId: true } });
    if (taken && taken.userId !== session.user.id) {
      return { error: "That handle is already taken. Try another." };
    }

    await db.profile.update({
      where: { userId: session.user.id },
      data: { handle, hasClaimedHandle: true },
    });

    try {
      await Promise.all([
        redis.del(`profile:${session.user.id}`),
        redis.del(`handlecheck:${handle.toLowerCase()}`),
        await redis.del(SITEMAP_COUNT_CACHE_KEY),
        await redis.del(`${SITEMAP_PAGE_CACHE_KEY_PREFIX}0`), 
// Only page 0 needs invalidation while user count < SITEMAP_SIZE (50k).
// Past that, we need to invalidate the highest page id instead.
      ]);
    } catch {}
    return { success: true };
  } catch (error) {
    console.error("Error claiming handle:", error);
    return { error: "Something went wrong. Please try again." };
  }
}

const HANDLE_CHECK_TTL = 30; // seconds

export async function checkHandleAvailability(handle: string): Promise<{ available: boolean }> {
  const session = await auth();
  if (!session?.user?.id) return { available: false };

  if (!HANDLE_REGEX.test(handle)) return { available: false };
  if (isReservedHandle(handle)) return { available: false };

  const cacheKey = `handlecheck:${handle.toLowerCase()}`;
  try {
    const cached = await redis.get(cacheKey);
    // Use unambiguous string values — Upstash REST can return "0"/"1" as numbers,
    // so numeric-like strings break strict equality. "free"/"taken" are unambiguous.
    if (cached === "free") return { available: true };
    if (cached === "taken") return { available: false };
  } catch {}

  try {
    // Use field-level `not` filter instead of top-level `NOT` operator — the top-level
    // `NOT: { userId }` form can generate malformed SQL with Prisma 7 + @prisma/adapter-pg,
    // causing every query to throw and the catch to return { available: false }.
    const taken = await db.profile.findFirst({
      where: {
        handle,
        userId: { not: session.user.id },
      },
    });
    const available = !taken;
    try { await redis.set(cacheKey, available ? "free" : "taken", { ex: HANDLE_CHECK_TTL }); } catch {}
    return { available };
  } catch {
    return { available: false };
  }
}


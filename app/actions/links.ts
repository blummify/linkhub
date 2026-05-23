"use server";

import { after } from "next/server";
import { db } from "@/lib/db";
import { redis } from "@/lib/redis";
import type { LinkRow } from "@/lib/linkRow";
import { auth } from "@/auth";
import { addLinkSchema } from "@/lib/validation/link.schema";
import { LinkStatusValue } from "@/app/constants/linkStatus";
import { deleteFromR2 } from "@/lib/r2";

const LINKS_TTL = 300;   // 5 minutes
const PROFILE_TTL = 300; // 5 minutes

export async function getLinks(): Promise<LinkRow[]> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const cacheKey = `links:${session.user.id}`;
  try {
    const cached = await redis.get<LinkRow[]>(cacheKey);
    if (cached) return cached;

    const links = await db.link.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    });
    await redis.set(cacheKey, links, { ex: LINKS_TTL });
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
      where: { userId: session.user.id }
    });
    return { count };
  } catch (error) {
    console.error("Error counting links:", error);
    return { count: 0 };
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
    const link = await db.link.create({
      data: { ...data, userId: session.user.id },
    });
    await redis.del(`links:${session.user.id}`);
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

    await redis.del(`links:${session.user.id}`);
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

    await redis.del(`links:${session.user.id}`);
    return { success: true };
  } catch (error) {
    console.error("Error deleting link:", error);
    return { error: "Failed to delete link" };
  }
}

export async function getProfile() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const cacheKey = `profile:${session.user.id}`;
  try {
    const cached = await redis.get(cacheKey);
    if (cached) return cached as Awaited<ReturnType<typeof fetchProfile>>;

    return await fetchProfile(session.user.id, cacheKey);
  } catch (error) {
    console.error("Error fetching profile:", error);
    return null;
  }
}

async function fetchProfile(userId: string, cacheKey: string) {
  let profile = await db.profile.findUnique({
    where: { userId },
    include: { user: true },
  });

  if (!profile) {
    profile = await db.profile.create({
      data: { userId },
      include: { user: true },
    });
  }

  await redis.set(cacheKey, profile, { ex: PROFILE_TTL });
  return profile;
}

const HANDLE_REGEX = /^[a-zA-Z0-9_]{3,24}$/;

export async function claimHandle(handle: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  if (!HANDLE_REGEX.test(handle)) {
    return { error: "Handle must be 3–24 characters: letters, numbers, underscores only." };
  }

  try {
    const taken = await db.profile.findFirst({ where: { handle } });
    if (taken && taken.userId !== session.user.id) {
      return { error: "That handle is already taken. Try another." };
    }

    await db.profile.update({
      where: { userId: session.user.id },
      data: { handle, hasClaimedHandle: true },
    });

    await redis.del(`profile:${session.user.id}`);
    return { success: true };
  } catch (error) {
    console.error("Error claiming handle:", error);
    return { error: "Something went wrong. Please try again." };
  }
}

export async function dismissHandleClaim() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  try {
    await db.profile.update({
      where: { userId: session.user.id },
      data: { hasClaimedHandle: true },
    });
    await redis.del(`profile:${session.user.id}`);
    return { success: true };
  } catch (error) {
    console.error("Error dismissing handle claim:", error);
    return { error: "Something went wrong." };
  }
}

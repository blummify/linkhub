export const dynamic = "force-dynamic";

import type { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { redis } from "@/lib/redis";
import {
  SITEMAP_COUNT_CACHE_KEY as COUNT_CACHE_KEY,
  SITEMAP_PAGE_CACHE_KEY_PREFIX as PAGE_CACHE_KEY_PREFIX,
} from "@/lib/cacheKeys";

const SITEMAP_SIZE = 45000;
const BASE_URL = process.env.NEXTAUTH_URL ?? "https://linkhub.app";
const STATIC_LASTMOD = new Date();

// Cache count of profiles to avoid count queries on every sitemap request
const COUNT_CACHE_TTL = 3600; // 1 hour

// Static marketing pages 
const STATIC_ENTRIES: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: STATIC_LASTMOD, changeFrequency: "weekly", priority: 1 },
    { url: `${BASE_URL}/pricing`, lastModified: STATIC_LASTMOD, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE_URL}/features`, lastModified: STATIC_LASTMOD, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE_URL}/login`, lastModified: STATIC_LASTMOD, changeFrequency: "yearly", priority: 0.5 },
    { url: `${BASE_URL}/signup`, lastModified: STATIC_LASTMOD, changeFrequency: "yearly", priority: 0.6 },
];

export async function generateSitemaps() {
  let count: number;
  try {
    const cached = await redis.get<number>(COUNT_CACHE_KEY);
    if(cached !== null){
      count = cached;
    } else {
      count = await db.profile.count({
        where: {hasClaimedHandle: true, NOT: {handle:null}},
      });
      await redis.set(COUNT_CACHE_KEY, count, { ex: COUNT_CACHE_TTL });
    }
  } 
  catch {
    count = await db.profile.count({
      where: {hasClaimedHandle: true, NOT: {handle:null}},
    });
  }

  const pages = Math.max(1, Math.ceil(count / SITEMAP_SIZE));
  return Array.from({length: pages}, (_, id) => ({id}));
}

export default async function sitemap({
  id,
}: {
  id: number;
}): Promise<MetadataRoute.Sitemap> {
  const pageId = Number.isFinite(Number(id)) ? Math.max(0, Math.trunc(Number(id))) : 0;
  const cacheKey = `${PAGE_CACHE_KEY_PREFIX}${pageId}`;
  let profileEntries: MetadataRoute.Sitemap;

  try {
    const cached = await redis.get<MetadataRoute.Sitemap>(cacheKey);
    if (cached) {
      profileEntries = cached;
    } else {
      const profiles = await db.profile.findMany({
        where: { hasClaimedHandle: true, NOT: { handle: null } },
        select: { handle: true, updatedAt: true },
        skip: pageId * SITEMAP_SIZE,
        take: SITEMAP_SIZE,
        orderBy: { createdAt: "asc" },
      });

      profileEntries = profiles.map((p) => ({
        url: `${BASE_URL}/${p.handle}`,
        lastModified: p.updatedAt,
        changeFrequency: "weekly" as const,
        priority: 0.9,
      }));

      await redis.set(cacheKey, profileEntries, { ex: COUNT_CACHE_TTL });
    }
  }
  catch {
    const profiles = await db.profile.findMany({
      where: { hasClaimedHandle: true, NOT: { handle: null } },
      select: { handle: true, updatedAt: true },
      skip: pageId * SITEMAP_SIZE,
      take: SITEMAP_SIZE,
      orderBy: { createdAt: "asc" },
    });
    profileEntries = profiles.map((p) => ({
      url: `${BASE_URL}/${p.handle}`,
      lastModified: p.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.9,
    }));
  }

  return pageId === 0 ? [...STATIC_ENTRIES, ...profileEntries] : profileEntries;
}
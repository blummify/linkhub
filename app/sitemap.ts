import type { MetadataRoute } from "next";
import { db } from "@/lib/db";

const SITEMAP_SIZE = 45000;

// Static marketing pages 
function getStaticEntries(base:string): MetadataRoute.Sitemap {
  return [
    { url: base, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${base}/pricing`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/features`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/login`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.5 },
    { url: `${base}/signup`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.6 },
  ];
}

// sitemap to generate base on profile count
export async function generateSitemaps() {
  const count = await db.profile.count({
    where: { hasClaimedHandle: true },
  });
  const pages = Math.max(1, Math.ceil(count / SITEMAP_SIZE));
  return Array.from({ length: pages }, (_, id) => ({ id }));
}

export default async function sitemap({
  id,
}: {
  id: number;
}): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXTAUTH_URL ?? "https://linkhub.app";

  const profiles = await db.profile.findMany({
    where: { hasClaimedHandle: true },
    select: { handle: true, updatedAt: true },
    skip: id * SITEMAP_SIZE,
    take: SITEMAP_SIZE,
    orderBy: { createdAt: "asc" },
  });

  const profileEntries: MetadataRoute.Sitemap = profiles
    .filter((p): p is { handle: string; updatedAt: Date } => !!p.handle)
    .map((p) => ({
      url: `${base}/${p.handle}`,
      lastModified: p.updatedAt,
      changeFrequency: "weekly",
      priority: 0.9,
    }));

  // Only static marketing pages in the first sitemap file (id: 0)
  return id === 0
    ? [...getStaticEntries(base), ...profileEntries]
    : profileEntries;
}

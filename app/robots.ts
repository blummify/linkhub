import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXTAUTH_URL ?? "https://linkhub.app";
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/user-dashboard/",
          "/user-admin/",
          "/admin/",
          "/super-admin/",
          "/branding/",
          "/account/",
          "/billing/",
        ],
      },
    ],
    // generateSitemaps() already auto-paginates children at /sitemap/[id].xml as
    // profiles grow (skip/take by SITEMAP_SIZE) — children scale with zero code change.
    // The only non-scaling piece is THIS entry point: it advertises page 0 only.
    // Deferred: reclaim /sitemap.xml from the [handle] route to serve a self-listing
    // sitemap index, then point robots here once. See PR notes.
    sitemap: `${base}/sitemap/0.xml`,
  };
}

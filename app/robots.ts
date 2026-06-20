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
    sitemap: `${base}/sitemap.xml`,
  };
}

import { NextRequest, NextResponse } from "next/server";

const PEXELS_VIDEO_IDS: Record<string, number> = {
  "rain":  3571264,
  "smoke": 4320605,
};

const videoUrlCache = new Map<string, string>();

async function resolveVideoUrl(slug: string): Promise<string | null> {
  const cached = videoUrlCache.get(slug);
  if (cached) return cached;

  const pexelsId = PEXELS_VIDEO_IDS[slug] ?? (/^\d+$/.test(slug) ? parseInt(slug, 10) : null);
  if (!pexelsId) return null;

  const res = await fetch(`https://api.pexels.com/videos/videos/${pexelsId}`, {
    headers: { Authorization: process.env.PEXELS_API_KEY ?? "" },
  });
  if (!res.ok) return null;

  const data = await res.json() as {
    video_files?: Array<{ quality: string; link: string; width?: number }>;
  };

  const files = data.video_files ?? [];
  // Prefer sd for fast loading; fall back to hd or any available
  const file =
    files.find((f) => f.quality === "sd") ??
    files.find((f) => f.quality === "hd") ??
    files[0];
  if (!file) return null;

  videoUrlCache.set(slug, file.link);
  return file.link;
}

export async function GET(request: NextRequest) {
  const slug = request.nextUrl.searchParams.get("id");
  if (!slug) return new NextResponse("Not found", { status: 404 });

  const isNumeric = /^\d+$/.test(slug);
  if (!isNumeric && !(slug in PEXELS_VIDEO_IDS)) {
    return new NextResponse("Not found", { status: 404 });
  }

  const videoUrl = await resolveVideoUrl(slug);
  if (!videoUrl) return new NextResponse("Video unavailable", { status: 502 });

  // Redirect browser directly to the CDN URL — avoids streaming every byte
  // through Next.js. The CDN link is token-signed so Referer doesn't matter.
  return NextResponse.redirect(videoUrl, {
    status: 302,
    headers: { "Cache-Control": "public, max-age=3600" },
  });
}

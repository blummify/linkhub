import { NextRequest, NextResponse } from "next/server";

const PEXELS_VIDEO_IDS: Record<string, number> = {
  "ocean-waves": 1409899,
  "particles":   3129957,
  "rain":        3571264,
  "aurora":      4818030,
  "city-lights": 11533613,
  "smoke":       4320605,
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
    video_files?: Array<{ quality: string; link: string }>;
  };

  const files = data.video_files ?? [];
  const file =
    files.find((f) => f.quality === "hd") ??
    files.find((f) => f.quality === "sd") ??
    files[0];
  if (!file) return null;

  videoUrlCache.set(slug, file.link);
  return file.link;
}

export async function GET(request: NextRequest) {
  const slug = request.nextUrl.searchParams.get("id");
  if (!slug) return new NextResponse("Not found", { status: 404 });

  // Accept pre-defined slugs OR raw numeric Pexels video IDs (from search)
  const isNumeric = /^\d+$/.test(slug);
  if (!isNumeric && !(slug in PEXELS_VIDEO_IDS)) {
    return new NextResponse("Not found", { status: 404 });
  }

  const videoUrl = await resolveVideoUrl(slug);
  if (!videoUrl) return new NextResponse("Video unavailable", { status: 502 });

  const fetchHeaders: HeadersInit = {};
  const range = request.headers.get("range");
  if (range) fetchHeaders["Range"] = range;

  const upstream = await fetch(videoUrl, { headers: fetchHeaders });

  const responseHeaders = new Headers({
    "Content-Type": "video/mp4",
    "Accept-Ranges": "bytes",
    "Cache-Control": "public, max-age=86400, stale-while-revalidate=3600",
  });

  const contentLength = upstream.headers.get("content-length");
  const contentRange  = upstream.headers.get("content-range");
  if (contentLength) responseHeaders.set("Content-Length", contentLength);
  if (contentRange)  responseHeaders.set("Content-Range",  contentRange);

  return new NextResponse(upstream.body, {
    status: upstream.status,
    headers: responseHeaders,
  });
}

import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (!q) return NextResponse.json({ videos: [] });

  const res = await fetch(
    `https://api.pexels.com/videos/search?query=${encodeURIComponent(q)}&per_page=12&orientation=landscape`,
    { headers: { Authorization: process.env.PEXELS_API_KEY ?? "" } }
  );

  if (!res.ok) return NextResponse.json({ videos: [] }, { status: res.status });

  const data = await res.json() as {
    videos?: Array<{
      id: number;
      image: string;
      video_files: Array<{ quality: string; link: string }>;
    }>;
  };

  const videos = (data.videos ?? []).map((v) => ({
    id: String(v.id),
    name: "",
    thumbnailUrl: v.image,
    videoUrl: `/api/video-proxy?id=${v.id}`,
  }));

  return NextResponse.json({ videos });
}

import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (!q) return NextResponse.json({ photos: [] });

  const key = process.env.UNSPLASH_ACCESS_KEY;
  if (!key) return NextResponse.json({ photos: [], error: "missing_key" });

  const res = await fetch(
    `https://api.unsplash.com/search/photos?query=${encodeURIComponent(q)}&per_page=12&orientation=landscape`,
    { headers: { Authorization: `Client-ID ${key}` } }
  );

  if (!res.ok) return NextResponse.json({ photos: [] }, { status: res.status });

  const data = await res.json() as {
    results?: Array<{
      id: string;
      alt_description: string | null;
      urls: { regular: string; small: string };
    }>;
  };

  const photos = (data.results ?? []).map((p) => ({
    id: p.id,
    name: p.alt_description ?? "",
    url: `${p.urls.regular}&w=1600&q=80`,
    thumbnailUrl: p.urls.small,
  }));

  return NextResponse.json({ photos });
}

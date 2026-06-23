import { db } from "@/lib/db";
import { redis } from "@/lib/redis";
import { HANDLE_REGEX, isReservedHandle } from "@/app/constants/reservedHandles";
import { LinkStatus } from "@/app/constants/linkStatus";

const PUBLIC_PROFILE_TTL = 60; // seconds — short, since this is public/SEO-facing and edits should show up quickly

export interface PublicProfileLink {
  id: string;
  title: string;
  url: string;
  icon: string | null;
  thumbnailUrl: string | null;
}

export interface PublicProfile {
  userId: string;
  displayName: string | null;
  bio: string | null;
  avatarUrl: string | null;
  themeId: string;
  accentColor: string | null;
  buttonStyle: string | null;
  fontFamily: string | null;
  backgroundType: string;
  backgroundValue: string;
  cardStyle: string;
  userName: string | null;
  links: PublicProfileLink[];
}

/** Public, unauthenticated lookup for `/{handle}` — never throws, returns null for any unresolvable handle. */
export async function getPublicProfileByHandle(handle: string): Promise<PublicProfile | null> {
  if (!HANDLE_REGEX.test(handle) || isReservedHandle(handle)) return null;

  const cacheKey = `public-profile:${handle.toLowerCase()}`;

  try {
    const cached = await redis.get<PublicProfile>(cacheKey);
    if (cached) return cached;
  } catch {}

  try {
    const profile = await db.profile.findUnique({
      where: { handle },
      select: {
        displayName: true,
        bio: true,
        avatarUrl: true,
        themeId: true,
        accentColor: true,
        buttonStyle: true,
        fontFamily: true,
        backgroundType: true,
        backgroundValue: true,
        cardStyle: true,
        hasClaimedHandle: true,
        user: {
          select: {
            id: true,
            name: true,
            links: {
              where: { status: LinkStatus.PUBLISHED },
              orderBy: [{ order: "asc" }, { createdAt: "desc" }],
              select: { id: true, title: true, url: true, icon: true, thumbnailUrl: true },
            },
          },
        },
      },
    });

    if (!profile || !profile.hasClaimedHandle) return null;

    const result: PublicProfile = {
      userId: profile.user.id,
      displayName: profile.displayName,
      bio: profile.bio,
      avatarUrl: profile.avatarUrl,
      themeId: profile.themeId,
      accentColor: profile.accentColor,
      buttonStyle: profile.buttonStyle,
      fontFamily: profile.fontFamily,
      backgroundType: profile.backgroundType,
      backgroundValue: profile.backgroundValue,
      cardStyle: profile.cardStyle,
      userName: profile.user.name,
      links: profile.user.links,
    };

    try { await redis.set(cacheKey, result, { ex: PUBLIC_PROFILE_TTL }); } catch {}
    return result;
  } catch (error) {
    console.error("Error fetching public profile:", error);
    return null;
  }
}

/** Call after any mutation that changes what `/{handle}` renders (branding, avatar, links). */
export async function invalidatePublicProfileCache(handle: string | null | undefined): Promise<void> {
  if (!handle) return;
  try { await redis.del(`public-profile:${handle.toLowerCase()}`); } catch {}
}

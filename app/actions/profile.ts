"use server";

import { after } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { redis } from "@/lib/redis";
import { deleteFromR2 } from "@/lib/r2";

export async function updateBranding(data: {
  displayName?: string;
  bio?: string;
  themeId?: string;
  accentColor?: string;
  buttonStyle?: string;
  fontFamily?: string;
}): Promise<{ success: true } | { error: string }> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  try {
    await db.profile.update({
      where: { userId: session.user.id },
      data: {
        ...(data.displayName !== undefined && { displayName: data.displayName }),
        ...(data.bio         !== undefined && { bio:         data.bio         }),
        ...(data.themeId     !== undefined && { themeId:     data.themeId     }),
        ...(data.accentColor !== undefined && { accentColor: data.accentColor }),
        ...(data.buttonStyle !== undefined && { buttonStyle: data.buttonStyle }),
        ...(data.fontFamily  !== undefined && { fontFamily:  data.fontFamily  }),
      },
    });
    try { await redis.del(`profile:${session.user.id}`); } catch {}
    return { success: true };
  } catch {
    return { error: "Failed to save changes. Please try again." };
  }
}

/**
 * Persists a new avatar URL + key to the user's profile.
 * Automatically cleans up the previous R2 object (if any) after the DB write,
 * without blocking the response.
 */
export async function updateAvatarUrl(
  avatarUrl: string | null,
  avatarKey: string | null
): Promise<{ success: true } | { error: string }> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  try {
    const current = await db.profile.findUnique({
      where: { userId: session.user.id },
      select: { avatarKey: true },
    });

    await db.profile.update({
      where: { userId: session.user.id },
      data: { avatarUrl, avatarKey },
    });

    // Non-blocking: delete the old R2 object after the response is sent
    const oldKey = current?.avatarKey;
    if (oldKey && oldKey !== avatarKey) {
      after(async () => {
        try {
          await deleteFromR2(oldKey);
        } catch {
          // Logged inside deleteFromR2; orphan is a minor storage cost, not fatal
        }
      });
    }

    await redis.del(`profile:${session.user.id}`);
    return { success: true };
  } catch {
    return { error: "Failed to save avatar. Please try again." };
  }
}

/**
 * Clears the avatar from the user's profile and deletes the R2 object.
 */
export async function removeAvatar(): Promise<{ success: true } | { error: string }> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  try {
    const current = await db.profile.findUnique({
      where: { userId: session.user.id },
      select: { avatarKey: true },
    });

    await db.profile.update({
      where: { userId: session.user.id },
      data: { avatarUrl: null, avatarKey: null },
    });

    // TODO: also clean up when the user account is deleted (batch delete by userId prefix)
    const oldKey = current?.avatarKey;
    if (oldKey) {
      after(async () => {
        try {
          await deleteFromR2(oldKey);
        } catch {
          // Logged inside deleteFromR2
        }
      });
    }

    await redis.del(`profile:${session.user.id}`);
    return { success: true };
  } catch {
    return { error: "Failed to remove avatar. Please try again." };
  }
}

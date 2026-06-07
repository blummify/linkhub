"use server";

import { after } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { redis } from "@/lib/redis";
import { deleteFromR2 } from "@/lib/r2";

// ── Validation helpers ────────────────────────────────────────────────────────
const HEX_RE = /^#[0-9a-fA-F]{6}$/;
const VALID_CARD_STYLES   = new Set(["filled", "ghost", "soft", "shadow"]);
const VALID_BODY_FONTS    = new Set(["Geist", "DM Sans", "Inter", "Geist Mono"]);
const VALID_LAYOUTS       = new Set(["classic", "minimal", "centered"]);
const VALID_LINK_DENSITY  = new Set(["default", "comfortable", "compact"]);
const VALID_BUTTON_STYLES = new Set(["rounded", "pill", "sharp"]);
const VALID_BG_TYPES      = new Set(["gradient", "image", "video"]);
const VALID_EFFECT_IDS    = new Set([
  "starParticles", "snowfall", "aurora", "bokeh", "rain", "confetti", "floatingEmoji",
  "glassmorphism", "neonBorders", "gradientBorder", "shimmer", "textGlow", "pulseRing",
]);

function isValidHex(v: unknown): v is string {
  return typeof v === "string" && HEX_RE.test(v);
}

function validateEditorInput(data: {
  accentColor: string;
  buttonStyle: string;
  backgroundType: string;
  cardStyle: string;
  bodyFont: string;
  overlayColor: string;
  overlayOpacity: number;
  profileLayout: string;
  linkDensity: string;
  effects: string;
  textColor: string | null;
}): string | null {
  if (!isValidHex(data.accentColor))
    return "Invalid accent color.";
  if (!VALID_BUTTON_STYLES.has(data.buttonStyle))
    return "Invalid button style.";
  if (!VALID_BG_TYPES.has(data.backgroundType))
    return "Invalid background type.";
  if (!VALID_CARD_STYLES.has(data.cardStyle))
    return "Invalid card style.";
  if (!VALID_BODY_FONTS.has(data.bodyFont))
    return "Invalid body font.";
  if (!isValidHex(data.overlayColor))
    return "Invalid overlay color.";
  if (!Number.isInteger(data.overlayOpacity) || data.overlayOpacity < 0 || data.overlayOpacity > 100)
    return "Invalid overlay opacity.";
  if (!VALID_LAYOUTS.has(data.profileLayout))
    return "Invalid profile layout.";
  if (!VALID_LINK_DENSITY.has(data.linkDensity))
    return "Invalid link density.";
  if (data.textColor !== null && !isValidHex(data.textColor))
    return "Invalid text color.";
  if (data.effects) {
    const ids = data.effects.split(",");
    for (const id of ids) {
      if (!VALID_EFFECT_IDS.has(id)) return `Invalid effect: ${id}`;
    }
  }
  return null;
}

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
  } catch (err) {
    console.error("[updateBranding] failed:", err);
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

/**
 * Saves the full custom theme from the Open Editor.
 * Gated behind an active paid subscription (Hub or Studio).
 * Free users receive { requiresUpgrade: true } — nothing is written.
 */
export async function saveEditorTheme(data: {
  themeId: string;
  accentColor: string;
  buttonStyle: string;
  fontFamily: string;
  backgroundType: "gradient" | "image" | "video";
  backgroundValue: string;
  backgroundKey: string | null;
  effects: string;
  textColor: string | null;
  cardStyle: string;
  bodyFont: string;
  overlayColor: string;
  overlayOpacity: number;
  profileLayout: string;
  linkDensity: string;
}): Promise<{ success: true } | { requiresUpgrade: true } | { error: string }> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const validationError = validateEditorInput(data);
  if (validationError) return { error: validationError };

  const sub = await db.subscription.findUnique({
    where: { userId: session.user.id },
    select: { planId: true },
  });

  if (!sub || sub.planId === "free") {
    return { requiresUpgrade: true };
  }

  try {
    const current = await db.profile.findUnique({
      where: { userId: session.user.id },
      select: { backgroundKey: true },
    });

    await db.profile.update({
      where: { userId: session.user.id },
      data: {
        themeId:         data.themeId,
        accentColor:     data.accentColor,
        buttonStyle:     data.buttonStyle,
        fontFamily:      data.fontFamily,
        backgroundType:  data.backgroundType,
        backgroundValue: data.backgroundValue,
        backgroundKey:   data.backgroundKey,
        effects:         data.effects,
        textColor:       data.textColor,
        cardStyle:       data.cardStyle,
        bodyFont:        data.bodyFont,
        overlayColor:    data.overlayColor,
        overlayOpacity:  data.overlayOpacity,
        layout:          data.profileLayout,
        linkDensity:     data.linkDensity,
      },
    });

    // Non-blocking cleanup of old background R2 asset
    const oldKey = current?.backgroundKey;
    if (oldKey && oldKey !== data.backgroundKey) {
      after(async () => {
        try { await deleteFromR2(oldKey); } catch {}
      });
    }

    await redis.del(`profile:${session.user.id}`);
    return { success: true };
  } catch (err) {
    console.error("[saveEditorTheme] failed:", err);
    return { error: "Failed to save theme. Please try again." };
  }
}

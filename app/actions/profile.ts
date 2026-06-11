"use server";

import { after } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { redis } from "@/lib/redis";
import { deleteFromR2 } from "@/lib/r2";
import { postly } from "@/lib/postly";
import { VALID_FONT_VALUES } from "@/app/constants/editorFonts";
import { BACKGROUND_GRADIENTS } from "@/app/constants/editorBackgroundGradients";

const HEX_RE         = /^#[0-9a-fA-F]{6}$/;
const SOLID_COLOR_RE = /^solid:#[0-9a-fA-F]{6}$/;

const VALID_CARD_STYLES   = new Set(["filled", "ghost", "soft", "shadow"]);
const VALID_LAYOUTS       = new Set(["classic", "minimal", "centered"]);
const VALID_LINK_DENSITY  = new Set(["default", "comfortable", "compact"]);
const VALID_BUTTON_STYLES = new Set(["rounded", "pill", "sharp"]);
const VALID_BG_TYPES      = new Set(["gradient", "image", "video"]);
const VALID_GRADIENT_IDS  = new Set(BACKGROUND_GRADIENTS.map((g) => g.id));
const VALID_VIDEO_SLUGS   = new Set(["rain", "smoke"]);
const VALID_EFFECT_IDS    = new Set([
  "starParticles", "snowfall", "aurora", "bokeh", "rain", "confetti", "floatingEmoji",
  "glassmorphism", "neonBorders", "gradientBorder", "shimmer", "textGlow", "pulseRing",
]);

const MAX_CUSTOM_THEMES = 20;

function isValidHex(v: unknown): v is string {
  return typeof v === "string" && HEX_RE.test(v);
}

function validateEditorInput(data: {
  accentColor: string;
  buttonStyle: string;
  backgroundType: string;
  backgroundValue: string;
  backgroundKey: string | null;
  fontFamily: string;
  cardStyle: string;
  bodyFont: string;
  overlayColor: string;
  overlayOpacity: number;
  profileLayout: string;
  linkDensity: string;
  effects: string;
  textColor: string | null;
  customThemeName: string;
}): string | null {
  if (!isValidHex(data.accentColor))
    return "Invalid accent color.";
  if (!VALID_BUTTON_STYLES.has(data.buttonStyle))
    return "Invalid button style.";
  if (!VALID_BG_TYPES.has(data.backgroundType))
    return "Invalid background type.";

  // Validate backgroundValue per type
  if (data.backgroundType === "gradient") {
    if (!VALID_GRADIENT_IDS.has(data.backgroundValue) && !SOLID_COLOR_RE.test(data.backgroundValue))
      return "Invalid background value.";
  } else if (data.backgroundType === "image") {
    const r2Base = (process.env.CLOUDFLARE_R2_PUBLIC_URL ?? "").replace(/\/$/, "");
    if (!r2Base || !data.backgroundValue.startsWith(`${r2Base}/`))
      return "Invalid image URL.";
  } else if (data.backgroundType === "video") {
    if (!VALID_VIDEO_SLUGS.has(data.backgroundValue))
      return "Invalid video background.";
  }

  // backgroundKey must be under the backgrounds/ prefix
  if (data.backgroundKey !== null && !data.backgroundKey.startsWith("backgrounds/"))
    return "Invalid background key.";

  if (!VALID_CARD_STYLES.has(data.cardStyle))
    return "Invalid card style.";
  if (!VALID_FONT_VALUES.has(data.bodyFont))
    return "Invalid body font.";
  if (!VALID_FONT_VALUES.has(data.fontFamily))
    return "Invalid heading font.";
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
  if (typeof data.customThemeName !== "string" || data.customThemeName.length > 60)
    return "Theme name must be 60 characters or fewer.";
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
        activeCustomThemeId: null,
      },
    });
    try { await redis.del(`profile:${session.user.id}`); } catch {}
    return { success: true };
  } catch (err) {
    console.error("[updateBranding] failed:", err);
    return { error: "Failed to save changes. Please try again." };
  }
}

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

    const oldKey = current?.avatarKey;
    if (oldKey && oldKey !== avatarKey) {
      after(async () => {
        try {
          await deleteFromR2(oldKey);
        } catch {}
      });
    }

    await redis.del(`profile:${session.user.id}`);
    return { success: true };
  } catch {
    return { error: "Failed to save avatar. Please try again." };
  }
}

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

    const oldKey = current?.avatarKey;
    if (oldKey) {
      after(async () => {
        try {
          await deleteFromR2(oldKey);
        } catch {}
      });
    }

    await redis.del(`profile:${session.user.id}`);
    return { success: true };
  } catch {
    return { error: "Failed to remove avatar. Please try again." };
  }
}

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
  customThemeName: string;
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
    const [current, themeCount] = await Promise.all([
      db.profile.findUnique({
        where: { userId: session.user.id },
        select: { backgroundKey: true },
      }),
      db.customTheme.count({ where: { userId: session.user.id } }),
    ]);

    if (themeCount >= MAX_CUSTOM_THEMES) {
      return { error: `You've reached the limit of ${MAX_CUSTOM_THEMES} saved themes. Delete one to continue.` };
    }

    const customTheme = await db.customTheme.create({
      data: {
        userId:          session.user.id,
        name:            data.customThemeName.trim() || "My Theme",
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
        profileLayout:   data.profileLayout,
        linkDensity:     data.linkDensity,
      },
    });

    await db.profile.update({
      where: { userId: session.user.id },
      data: {
        themeId:            data.themeId,
        accentColor:        data.accentColor,
        buttonStyle:        data.buttonStyle,
        fontFamily:         data.fontFamily,
        backgroundType:     data.backgroundType,
        backgroundValue:    data.backgroundValue,
        backgroundKey:      data.backgroundKey,
        effects:            data.effects,
        textColor:          data.textColor,
        cardStyle:          data.cardStyle,
        bodyFont:           data.bodyFont,
        overlayColor:       data.overlayColor,
        overlayOpacity:     data.overlayOpacity,
        layout:             data.profileLayout,
        linkDensity:        data.linkDensity,
        customThemeName:    data.customThemeName.trim() || "My Theme",
        activeCustomThemeId: customTheme.id,
      },
    });

    const oldKey = current?.backgroundKey;
    if (oldKey && oldKey !== data.backgroundKey) {
      // Only delete if no CustomTheme still references this key (the new theme we
      // just created uses data.backgroundKey, so we're checking the old key)
      const stillReferenced = await db.customTheme.findFirst({
        where: { userId: session.user.id, backgroundKey: oldKey },
        select: { id: true },
      });
      if (!stillReferenced) {
        after(async () => {
          try { await deleteFromR2(oldKey); } catch {}
        });
      }
    }

    await redis.del(`profile:${session.user.id}`);
    return { success: true };
  } catch (err) {
    console.error("[saveEditorTheme] failed:", err);
    return { error: "Failed to save theme. Please try again." };
  }
}

export async function getUserCustomThemes() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  return db.customTheme.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });
}

export async function deleteCustomTheme(
  id: string
): Promise<{ success: true } | { error: string }> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  try {
    const theme = await db.customTheme.findUnique({
      where: { id, userId: session.user.id },
      select: { backgroundKey: true },
    });
    if (!theme) return { error: "Theme not found." };

    const profile = await db.profile.findUnique({
      where: { userId: session.user.id },
      select: { activeCustomThemeId: true, backgroundKey: true },
    });

    await db.customTheme.delete({ where: { id, userId: session.user.id } });

    if (profile?.activeCustomThemeId === id) {
      await db.profile.update({
        where: { userId: session.user.id },
        data: { activeCustomThemeId: null },
      });
    }

    if (theme.backgroundKey) {
      const key = theme.backgroundKey;
      // Skip R2 deletion if Profile still references this file
      const profileUsesKey = profile?.backgroundKey === key;
      if (!profileUsesKey) {
        // Skip R2 deletion if another CustomTheme still references this file
        // (the record we deleted is already gone, so no need to exclude by id)
        const otherRef = await db.customTheme.findFirst({
          where: { userId: session.user.id, backgroundKey: key },
          select: { id: true },
        });
        if (!otherRef) {
          after(async () => {
            try { await deleteFromR2(key); } catch {}
          });
        }
      }
    }

    try { await redis.del(`profile:${session.user.id}`); } catch {}
    return { success: true };
  } catch (err) {
    console.error("[deleteCustomTheme] failed:", err);
    return { error: "Failed to delete theme. Please try again." };
  }
}

export async function applyCustomTheme(
  id: string
): Promise<{ success: true; theme: Awaited<ReturnType<typeof getUserCustomThemes>>[number] } | { error: string }> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  try {
    const [theme, currentProfile] = await Promise.all([
      db.customTheme.findUnique({ where: { id, userId: session.user.id } }),
      db.profile.findUnique({
        where: { userId: session.user.id },
        select: { backgroundKey: true },
      }),
    ]);
    if (!theme) return { error: "Theme not found." };

    await db.profile.update({
      where: { userId: session.user.id },
      data: {
        themeId:            theme.themeId,
        accentColor:        theme.accentColor,
        buttonStyle:        theme.buttonStyle,
        fontFamily:         theme.fontFamily,
        backgroundType:     theme.backgroundType,
        backgroundValue:    theme.backgroundValue,
        backgroundKey:      theme.backgroundKey,
        effects:            theme.effects,
        textColor:          theme.textColor,
        cardStyle:          theme.cardStyle,
        bodyFont:           theme.bodyFont,
        overlayColor:       theme.overlayColor,
        overlayOpacity:     theme.overlayOpacity,
        layout:             theme.profileLayout,
        linkDensity:        theme.linkDensity,
        customThemeName:    theme.name,
        activeCustomThemeId: theme.id,
      },
    });

    // Clean up the old Profile background if it's no longer referenced anywhere
    const oldKey = currentProfile?.backgroundKey;
    if (oldKey && oldKey !== theme.backgroundKey) {
      const stillReferenced = await db.customTheme.findFirst({
        where: { userId: session.user.id, backgroundKey: oldKey },
        select: { id: true },
      });
      if (!stillReferenced) {
        after(async () => {
          try { await deleteFromR2(oldKey); } catch {}
        });
      }
    }

    try { await redis.del(`profile:${session.user.id}`); } catch {}
    return { success: true, theme };
  } catch (err) {
    console.error("[applyCustomTheme] failed:", err);
    return { error: "Failed to apply theme. Please try again." };
  }
}

export async function sendEditorLink(): Promise<{ success: true } | { error: string }> {
  try {
    const session = await auth();
    if (!session?.user?.id) return { error: "Unauthorized" };

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { email: true, name: true },
    });
    if (!user?.email) return { error: "No email on file." };

    const baseUrl =
      process.env.NEXTAUTH_URL ??
      (process.env.NEXT_PUBLIC_APP_DOMAIN
        ? `https://${process.env.NEXT_PUBLIC_APP_DOMAIN}`
        : "http://localhost:3000");
    const editorUrl = `${baseUrl}/branding/editor`;

    // Intent signal for PRO funnel — wire to your analytics pipeline here
    after(async () => {
      try {
        await db.user.update({
          where: { id: session.user.id },
          data: { updatedAt: new Date() },
        });
      } catch {}
    });

    await postly.send({
      template: "linkhub-editor-link",
      to: [user.email],
      data: { name: user.name ?? "there", editorUrl },
    });

    return { success: true };
  } catch (err) {
    console.error("[sendEditorLink]", err);
    return { error: "Couldn't send the email right now. Please try again." };
  }
}

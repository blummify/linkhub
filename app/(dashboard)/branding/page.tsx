import { type Metadata } from "next";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import type { BrandingAppearanceState } from "@/lib/brandingState";
import AppearanceClient from "./AppearanceClient";

export const metadata: Metadata = {
  title: "Branding",
  description: "Customize your public profile to reflect your brand's unique style.",
};

export default async function BrandingPage() {
  const session = await auth();
  let initialState: Partial<BrandingAppearanceState> | null = null;
  let initialAvatarUrl: string | null = null;
  let initialActiveCustomThemeId: string | null = null;
  let initialCustomThemes: Awaited<ReturnType<typeof db.customTheme.findMany>> = [];

  if (session?.user?.id) {
    const [profile, customThemes] = await Promise.all([
      db.profile.findUnique({
        where: { userId: session.user.id },
        select: {
          displayName: true, handle: true, bio: true,
          themeId: true, accentColor: true, buttonStyle: true, fontFamily: true,
          backgroundType: true, backgroundValue: true, backgroundKey: true,
          effects: true, textColor: true, cardStyle: true, bodyFont: true,
          overlayColor: true, overlayOpacity: true, layout: true,
          linkDensity: true, customThemeName: true,
          avatarUrl: true, activeCustomThemeId: true,
        },
      }),
      db.customTheme.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    initialCustomThemes = customThemes;

    if (profile) {
      initialAvatarUrl = profile.avatarUrl ?? null;
      initialActiveCustomThemeId = profile.activeCustomThemeId ?? null;
      initialState = {
        displayName:    profile.displayName ?? undefined,
        handle:         profile.handle ?? undefined,
        bio:            profile.bio ?? undefined,
        themeId:        profile.themeId ?? undefined,
        accentColor:    profile.accentColor ?? undefined,
        buttonStyle:    profile.buttonStyle ?? undefined,
        fontFamily:     profile.fontFamily ?? undefined,
        backgroundType: (profile.backgroundType as BrandingAppearanceState["backgroundType"]) ?? "gradient",
        backgroundValue: profile.backgroundValue ?? "midnight",
        backgroundKey:  profile.backgroundKey ?? null,
        effects:        profile.effects ? profile.effects.split(",").filter(Boolean) : [],
        textColor:      profile.textColor ?? null,
        cardStyle:      profile.cardStyle ?? "filled",
        bodyFont:       profile.bodyFont ?? "Geist",
        overlayColor:   profile.overlayColor ?? "#000000",
        overlayOpacity: profile.overlayOpacity ?? 0,
        profileLayout:  profile.layout ?? "classic",
        linkDensity:    profile.linkDensity ?? "default",
        customThemeName: profile.customThemeName ?? "My Theme",
      };
    }
  }

  return (
    <AppearanceClient
      initialState={initialState}
      initialAvatarUrl={initialAvatarUrl}
      initialActiveCustomThemeId={initialActiveCustomThemeId}
      initialCustomThemes={initialCustomThemes}
    />
  );
}

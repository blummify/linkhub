import { type Metadata } from "next";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import type { BrandingAppearanceState } from "@/lib/brandingState";
import { EditorClient } from "./EditorClient";

export const metadata: Metadata = {
  title: "Open Editor",
  description: "Design your own custom theme with backgrounds, effects, and more.",
};

export default async function EditorPage() {
  const session = await auth();
  let isPaidUser = false;
  let initialState: Partial<BrandingAppearanceState> | null = null;

  if (session?.user?.id) {
    const [sub, profile] = await Promise.all([
      db.subscription.findUnique({
        where: { userId: session.user.id },
        select: { planId: true },
      }),
      db.profile.findUnique({
        where: { userId: session.user.id },
        select: {
          themeId: true, accentColor: true, buttonStyle: true, fontFamily: true,
          backgroundType: true, backgroundValue: true, backgroundKey: true,
          effects: true, textColor: true, cardStyle: true, bodyFont: true,
          overlayColor: true, overlayOpacity: true, layout: true,
          linkDensity: true, customThemeName: true,
        },
      }),
    ]);

    isPaidUser = !!sub && sub.planId !== "free";

    if (profile) {
      initialState = {
        themeId:         profile.themeId ?? undefined,
        accentColor:     profile.accentColor ?? undefined,
        buttonStyle:     profile.buttonStyle ?? undefined,
        fontFamily:      profile.fontFamily ?? undefined,
        backgroundType:  (profile.backgroundType as BrandingAppearanceState["backgroundType"]) ?? "gradient",
        backgroundValue: profile.backgroundValue ?? "midnight",
        backgroundKey:   profile.backgroundKey ?? null,
        effects:         profile.effects ? profile.effects.split(",").filter(Boolean) : [],
        textColor:       profile.textColor ?? null,
        cardStyle:       profile.cardStyle ?? "filled",
        bodyFont:        profile.bodyFont ?? "Geist",
        overlayColor:    profile.overlayColor ?? "#000000",
        overlayOpacity:  profile.overlayOpacity ?? 0,
        profileLayout:   profile.layout ?? "classic",
        linkDensity:     profile.linkDensity ?? "default",
        customThemeName: profile.customThemeName ?? "My Theme",
      };
    }
  }

  return <EditorClient isPaidUser={isPaidUser} initialState={initialState} />;
}

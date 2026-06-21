import { type Metadata } from "next";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import type { BrandingAppearanceState } from "@/lib/brandingState";
import UserAdminClient from "../user-admin/UserAdminClient";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Manage and organize your digital presence.",
};

export default async function UserDashboardPage() {
  const session = await auth();
  let initialState: Partial<BrandingAppearanceState> | null = null;

  if (session?.user?.id) {
    const profile = await db.profile.findUnique({
      where: { userId: session.user.id },
      select: {
        displayName: true, handle: true, bio: true,
        themeId: true, accentColor: true, buttonStyle: true, fontFamily: true,
        backgroundType: true, backgroundValue: true, backgroundKey: true,
        effects: true, textColor: true, cardStyle: true, bodyFont: true,
        overlayColor: true, overlayOpacity: true, layout: true,
        linkDensity: true, customThemeName: true,
      },
    });

    if (profile) {
      initialState = {
        displayName:     profile.displayName ?? undefined,
        handle:          profile.handle ?? undefined,
        bio:             profile.bio ?? undefined,
        themeId:         profile.themeId ?? undefined,
        accentColor:     profile.accentColor ?? undefined,
        buttonStyle:     profile.buttonStyle ?? undefined,
        fontFamily:      profile.fontFamily ?? undefined,
        backgroundType:  (profile.backgroundType as BrandingAppearanceState["backgroundType"]) ?? "gradient",
        backgroundValue: profile.backgroundValue ?? "",
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

  return <UserAdminClient initialState={initialState} />;
}

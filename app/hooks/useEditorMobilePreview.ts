"use client";

import { useMemo } from "react";
import type { MobilePreviewProps } from "@/app/components/MobilePreview";
import { useBrandingStore } from "@/store/brandingStore";
import { useShallow } from "zustand/react/shallow";
import { brandingStateToMobileAppearance, brandingPublicUrl } from "@/lib/brandingState";

/** Live mobile preview props driven by shared branding state */
export function useEditorMobilePreview(
  overrides?: Partial<MobilePreviewProps>
): Pick<MobilePreviewProps, "appearance" | "publicUrl" | "showHeaderChrome" | "syncLabel"> &
  Partial<MobilePreviewProps> {
  const state = useBrandingStore(useShallow((s) => ({
    themeId: s.themeId,
    displayName: s.displayName,
    handle: s.handle,
    bio: s.bio,
    accentColor: s.accentColor,
    buttonStyle: s.buttonStyle,
    fontFamily: s.fontFamily,
    userPickedTheme: s.userPickedTheme,
    backgroundType: s.backgroundType,
    backgroundValue: s.backgroundValue,
    backgroundKey: s.backgroundKey,
    effects: s.effects,
    textColor: s.textColor,
    cardStyle: s.cardStyle,
    bodyFont: s.bodyFont,
    overlayColor: s.overlayColor,
    overlayOpacity: s.overlayOpacity,
    profileLayout: s.profileLayout,
    linkDensity: s.linkDensity,
  })));
  const handle = useBrandingStore((s) => s.handle);

  const appearance = useMemo(
    () => brandingStateToMobileAppearance(state),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [state.themeId, state.displayName, state.bio, state.accentColor, state.buttonStyle, state.fontFamily]
  );

  const publicUrl = brandingPublicUrl(handle);

  return {
    appearance,
    publicUrl,
    showHeaderChrome: false,
    syncLabel: null,
    ...overrides,
  };
}

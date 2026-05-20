"use client";

import { useMemo } from "react";
import type { MobilePreviewProps } from "@/app/components/MobilePreview";
import { useBrandingAppearance } from "@/app/components/BrandingAppearanceContext";
import { brandingStateToMobileAppearance } from "@/lib/brandingState";

/** Live mobile preview props driven by shared branding state */
export function useEditorMobilePreview(
  overrides?: Partial<MobilePreviewProps>
): Pick<MobilePreviewProps, "appearance" | "publicUrl" | "showHeaderChrome" | "syncLabel"> &
  Partial<MobilePreviewProps> {
  const { state, publicUrl } = useBrandingAppearance();

  const appearance = useMemo(
    () => brandingStateToMobileAppearance(state),
    [state]
  );

  return {
    appearance,
    publicUrl,
    showHeaderChrome: false,
    syncLabel: null,
    ...overrides,
  };
}

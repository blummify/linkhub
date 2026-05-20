import type { MobilePreviewProps } from "../components/MobilePreview";
import { DEFAULT_APPEARANCE } from "../components/MobilePreview";
import { brandingStateToMobileAppearance } from "@/lib/brandingState";
import { getDefaultBrandingState } from "@/lib/brandingState";
import { PROFILE_PUBLIC_URL } from "./profile";

/** Preview column on `/links`, `/appearance`, and `/user-dashboard` (aligned layout + centering). */
export const EDITOR_PREVIEW_COLUMN_CLASS =
  "px-5 py-10 sm:px-8 sm:py-12 lg:px-10 lg:py-14 lg:!items-center";

/** SSR / static fallback when branding context is unavailable */
export const EDITOR_MOBILE_PREVIEW_SHARED: Pick<
  MobilePreviewProps,
  "appearance" | "publicUrl" | "showHeaderChrome" | "syncLabel"
> = {
  appearance: brandingStateToMobileAppearance(getDefaultBrandingState()),
  publicUrl: PROFILE_PUBLIC_URL,
  showHeaderChrome: false,
  syncLabel: null,
};

/** @deprecated Use DEFAULT_APPEARANCE or branding state — kept for imports */
export { DEFAULT_APPEARANCE };

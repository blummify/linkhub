import type { MobilePreviewProps } from "../components/MobilePreview";
import { DEFAULT_APPEARANCE } from "../components/MobilePreview";
import { PROFILE_PUBLIC_URL } from "./profile";

/** Preview column on `/links`, `/appearance`, and `/user-admin` (aligned layout + centering). */
export const EDITOR_PREVIEW_COLUMN_CLASS =
  "px-5 py-10 sm:px-8 sm:py-12 lg:px-10 lg:py-14 lg:!items-center";

/** Shared MobilePreview props for `/links` and `/appearance` so width and chrome stay identical. */
export const EDITOR_MOBILE_PREVIEW_SHARED: Pick<
  MobilePreviewProps,
  "appearance" | "publicUrl" | "showHeaderChrome" | "syncLabel"
> = {
  appearance: DEFAULT_APPEARANCE,
  publicUrl: PROFILE_PUBLIC_URL,
  showHeaderChrome: true,
  syncLabel: "Syncing with live profile",
};

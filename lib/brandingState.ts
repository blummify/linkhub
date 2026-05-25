import {
  BRANDING_THEMES,
  DEFAULT_THEME,
  type BrandingTheme,
} from "@/app/constants/brandingThemes";
import { normalizeBrandingButtonShape } from "@/app/constants/brandingButtonShapes";
import {
  brandingHeadingFontStack,
  brandingHeadlinePreviewStyle,
} from "@/app/constants/brandingFonts";
import type { AppearanceState } from "@/app/components/MobilePreview";

export const BRANDING_STORAGE_KEY = "linkhub-branding-v2";
const BRANDING_STORAGE_KEY_LEGACY = "linkhub-branding-v1";

export interface BrandingAppearanceState {
  themeId: string;
  displayName: string;
  handle: string;
  bio: string;
  accentColor: string;
  buttonStyle: string;
  fontFamily: string;
  /** Set when the user picks a theme (not an old default) */
  userPickedTheme?: boolean;
}

export interface PreviewAppearance {
  bgStyle?: string;
  dark?: boolean;
  titleColor?: string;
  buttonStyle?: string;
  headlineFont?: string;
}

export function getDefaultBrandingState(): BrandingAppearanceState {
  return {
    themeId: DEFAULT_THEME.id,
    displayName: "Your Name",
    handle: "",
    bio: "Connecting with your community.",
    accentColor: DEFAULT_THEME.screen.titleColor,
    buttonStyle: "rounded",
    fontFamily: "Instrument Serif",
  };
}

function normalizeBrandingState(
  parsed: Partial<BrandingAppearanceState>
): BrandingAppearanceState {
  const defaults = getDefaultBrandingState();
  const merged: BrandingAppearanceState = { ...defaults, ...parsed };

  if (!merged.userPickedTheme && merged.themeId === "midnight") {
    merged.themeId = defaults.themeId;
    merged.accentColor = defaults.accentColor;
  }

  return merged;
}

export function getBrandingThemeById(themeId: string): BrandingTheme {
  const normalized =
    themeId === "default" || themeId === "custom" ? DEFAULT_THEME.id : themeId;
  return BRANDING_THEMES.find((t) => t.id === normalized) ?? DEFAULT_THEME;
}

export function brandingStateToPreviewAppearance(
  state: BrandingAppearanceState
): PreviewAppearance {
  const theme = getBrandingThemeById(state.themeId);
  return {
    bgStyle: theme.screen.bgStyle,
    dark: theme.screen.dark,
    titleColor: state.accentColor,
    buttonStyle: state.buttonStyle,
    headlineFont: brandingHeadingFontStack(state.fontFamily),
  };
}

/** Maps shared branding state → `MobilePreview` appearance */
export function brandingStateToMobileAppearance(
  state: BrandingAppearanceState
): AppearanceState {
  const theme = getBrandingThemeById(state.themeId);
  const solidBg = theme.screen.bgStyle.startsWith("linear")
    ? "#ffffff"
    : theme.screen.bgStyle;

  return {
    profileTitle: state.displayName,
    profileBio: state.bio,
    profileLayout: "classic",
    themeId: state.themeId,
    wallpaperStyle: "fill",
    bgColor: solidBg,
    bgStyle: theme.screen.bgStyle,
    dark: theme.screen.dark,
    textColor: theme.preview.color,
    buttonStyle: "flat",
    buttonShadow: "none",
    buttonRoundness: normalizeBrandingButtonShape(state.buttonStyle),
    fontFamily: state.fontFamily,
    bodyFontFamily: "Geist",
    headlineStyle: brandingHeadlinePreviewStyle(state.fontFamily),
    titleSize: "small",
    titleColor: state.accentColor,
    footerStyle: "minimal",
  };
}

export function loadBrandingState(): BrandingAppearanceState {
  if (typeof window === "undefined") return getDefaultBrandingState();
  try {
    let raw = localStorage.getItem(BRANDING_STORAGE_KEY);
    if (!raw) {
      raw = localStorage.getItem(BRANDING_STORAGE_KEY_LEGACY);
      if (raw) {
        const migrated = normalizeBrandingState(
          JSON.parse(raw) as Partial<BrandingAppearanceState>
        );
        localStorage.setItem(BRANDING_STORAGE_KEY, JSON.stringify(migrated));
        localStorage.removeItem(BRANDING_STORAGE_KEY_LEGACY);
        return migrated;
      }
      return getDefaultBrandingState();
    }
    return normalizeBrandingState(
      JSON.parse(raw) as Partial<BrandingAppearanceState>
    );
  } catch {
    return getDefaultBrandingState();
  }
}

export function saveBrandingState(state: BrandingAppearanceState): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(BRANDING_STORAGE_KEY, JSON.stringify(state));
    window.dispatchEvent(
      new CustomEvent("linkhub-branding-change", { detail: state })
    );
  } catch {
    /* storage unavailable */
  }
}

export function brandingPublicUrl(handle: string): string {
  const slug = handle.trim();
  return `${process.env.NEXT_PUBLIC_APP_DOMAIN ?? "linkhub.co"}/${slug}`;
}

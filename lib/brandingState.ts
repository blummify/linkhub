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
  /** Editor background fields */
  backgroundType: "gradient" | "image" | "video";
  backgroundValue: string;
  backgroundKey: string | null;
  /** Comma-separated effect IDs */
  effects: string[];
  /** Editor v2 fields */
  textColor: string | null;
  cardStyle: string;
  bodyFont: string;
  overlayColor: string;
  overlayOpacity: number;
  profileLayout: string;
  linkDensity: string;
  customThemeName: string;
}

export interface PreviewAppearance {
  bgStyle?: string;
  dark?: boolean;
  titleColor?: string;
  buttonStyle?: string;
  headlineFont?: string;
  textColor?: string | null;
  cardStyle?: string;
  bodyFont?: string;
  overlayColor?: string;
  overlayOpacity?: number;
  profileLayout?: string;
  linkDensity?: string;
}

export function getDefaultBrandingState(): BrandingAppearanceState {
  return {
    themeId: DEFAULT_THEME.id,
    displayName: "",
    handle: "",
    bio: "",
    accentColor: DEFAULT_THEME.screen.titleColor,
    buttonStyle: "rounded",
    fontFamily: "Instrument Serif",
    backgroundType: "gradient",
    backgroundValue: "midnight",
    backgroundKey: null,
    effects: [],
    textColor: null,
    cardStyle: "filled",
    bodyFont: "Geist",
    overlayColor: "#000000",
    overlayOpacity: 0,
    profileLayout: "classic",
    linkDensity: "default",
    customThemeName: "My Theme",
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

  // Coerce missing fields from older persisted blobs
  if (!merged.backgroundType) merged.backgroundType = defaults.backgroundType;
  if (!merged.backgroundValue) merged.backgroundValue = defaults.backgroundValue;
  if (merged.backgroundKey === undefined) merged.backgroundKey = null;
  if (!Array.isArray(merged.effects)) merged.effects = [];
  if (merged.textColor === undefined) merged.textColor = null;
  if (!merged.cardStyle) merged.cardStyle = defaults.cardStyle;
  if (!merged.bodyFont) merged.bodyFont = defaults.bodyFont;
  if (!merged.overlayColor) merged.overlayColor = defaults.overlayColor;
  if (typeof merged.overlayOpacity !== "number") merged.overlayOpacity = 0;
  if (!merged.profileLayout) merged.profileLayout = defaults.profileLayout;
  if (!merged.linkDensity) merged.linkDensity = defaults.linkDensity;
  if (!merged.customThemeName) merged.customThemeName = defaults.customThemeName;

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
    textColor: state.textColor ?? null,
    cardStyle: state.cardStyle,
    bodyFont: state.bodyFont,
    overlayColor: state.overlayColor,
    overlayOpacity: state.overlayOpacity,
    profileLayout: state.profileLayout,
    linkDensity: state.linkDensity,
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
  return `${process.env.NEXT_PUBLIC_APP_DOMAIN ?? "getlinkhub.app"}/${slug}`;
}

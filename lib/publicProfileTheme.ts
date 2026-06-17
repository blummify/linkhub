import { getBrandingThemeById } from "@/lib/brandingState";
import { getGradientById } from "@/app/constants/editorBackgroundGradients";
import { previewLinkBorderRadiusPx } from "@/app/constants/brandingButtonShapes";
import { brandingHeadingFontStack } from "@/app/constants/brandingFonts";

export interface ProfileThemeInput {
  themeId: string;
  accentColor: string | null;
  buttonStyle: string | null;
  fontFamily: string | null;
  backgroundType: string;
  backgroundValue: string;
  cardStyle: string;
}

/** CSS custom-property "theme contract" for the public profile page — see public-profile.css. */
export type ProfileThemeTokens = Record<string, string>;

/**
 * Mirrors `DashboardPreviewPanel`'s background resolution exactly — `backgroundType`/
 * `backgroundValue` override the theme's own default background, just like the
 * dashboard's own live branding preview. This only affects `--p-bg` itself.
 */
function resolveBackground(
  theme: ReturnType<typeof getBrandingThemeById>,
  backgroundType: string,
  backgroundValue: string
): string {
  if (backgroundType === "gradient") {
    if (backgroundValue.startsWith("solid:")) return backgroundValue.replace("solid:", "");
    const gradient = getGradientById(backgroundValue);
    if (gradient) return gradient.value;
    return theme.screen.bgStyle;
  }
  if (backgroundType === "image" || backgroundType === "video") return "#0b1020";
  return theme.screen.bgStyle;
}

interface CardColors {
  bg: string;
  border: string;
  text: string;
  shadow: string;
}

/**
 * Mirrors `PhoneScreenContent`'s card color logic exactly. Critically, `dark` here is
 * the *theme's own* darkness (`theme.screen.dark`), not the background-override dark —
 * `PhoneScreenContent` is given the unmodified `appearance` object (themeId-only `dark`),
 * never the override used for the background panel itself.
 */
function resolveCardColors(cardStyle: string, dark: boolean): CardColors {
  if (cardStyle === "ghost") {
    return {
      bg: "transparent",
      border: dark ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.18)",
      text: dark ? "rgba(255,255,255,0.88)" : "#0b1020",
      shadow: "none",
    };
  }
  if (cardStyle === "soft") {
    return {
      bg: "soft", // resolved by caller once accent is known
      border: "transparent",
      text: dark ? "rgba(255,255,255,0.88)" : "#0b1020",
      shadow: "none",
    };
  }
  return {
    bg: dark ? "rgba(255,255,255,0.08)" : "white",
    border: dark ? "rgba(255,255,255,0.10)" : "#eef0f7",
    text: dark ? "rgba(255,255,255,0.88)" : "#0b1020",
    shadow: cardStyle === "shadow" ? "0 4px 12px rgba(0,0,0,0.12)" : dark ? "none" : "0 2px 6px rgba(15,23,42,0.04)",
  };
}

export function computeProfileThemeTokens(profile: ProfileThemeInput): ProfileThemeTokens {
  const theme = getBrandingThemeById(profile.themeId);
  const dark = theme.screen.dark; // drives every PhoneScreenContent-derived color below
  const bg = resolveBackground(theme, profile.backgroundType, profile.backgroundValue);
  const accent = profile.accentColor ?? theme.screen.titleColor;
  const subtitle = dark ? "rgba(255,255,255,0.5)" : "#6b75a3";

  const card = resolveCardColors(profile.cardStyle, dark);
  if (card.bg === "soft") card.bg = `color-mix(in srgb, ${accent} 12%, transparent)`;

  return {
    "--p-bg": bg,
    "--p-accent": accent,
    "--p-muted": subtitle,
    "--p-bio": subtitle,
    "--p-avatar-bg": "linear-gradient(135deg, #3b46e0, #7a85ff)",
    "--p-avatar-text": "white",
    "--p-social-bg": dark ? "rgba(255,255,255,0.1)" : "white",
    "--p-social-text": subtitle,
    "--p-card-bg": card.bg,
    "--p-card-text": card.text,
    "--p-card-border": card.border,
    "--p-card-shadow": card.shadow,
    "--p-footer-muted": "#6b75a3",
    "--p-footer-brand": "#3b46e0",
    "--p-heading": brandingHeadingFontStack(profile.fontFamily ?? "Instrument Serif"),
    "--p-heading-style": theme.preview.nameFontStyle ?? "italic",
    "--p-btn-radius": `${previewLinkBorderRadiusPx(profile.buttonStyle ?? "rounded")}px`,
  };
}

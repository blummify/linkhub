import {
  BRANDING_FONT_DM_SERIF,
  BRANDING_FONT_PLAYFAIR,
  BRANDING_FONT_SPACE,
} from "./brandingFonts";

export interface BrandingTheme {
  id: string;
  name: string;
  isPro?: boolean;
  tag?: string;
  tagType?: "popular" | "new" | "pro" | "minimal" | "editorial" | "playful" | "bold" | "dark";
  preview: {
    bg: string;
    color: string;
    avatarBg: string;
    avatarColor: string;
    btnBg: string;
    btnBorder?: string;
    btnColor: string;
    btnRadius?: number;
    nameFont?: string;
    nameFontStyle?: string;
  };
  screen: {
    bgStyle: string;
    dark: boolean;
    titleColor: string;
  };
}

export const BRANDING_THEMES: BrandingTheme[] = [
  {
    id: "midnight",
    name: "Midnight",
    tag: "Popular", tagType: "popular",
    preview: {
      bg: "linear-gradient(180deg, #0b1020 0%, #1a2244 100%)",
      color: "white",
      avatarBg: "linear-gradient(135deg, #3b46e0, #7a85ff)", avatarColor: "white",
      btnBg: "rgba(255,255,255,0.08)", btnBorder: "rgba(255,255,255,0.12)", btnColor: "white",
      btnRadius: 6,
    },
    screen: { bgStyle: "linear-gradient(180deg, #0b1020 0%, #1a2244 100%)", dark: true, titleColor: "white" },
  },
  {
    id: "cream",
    name: "Cream & Espresso",
    tag: "Editorial", tagType: "editorial",
    preview: {
      bg: "#f5efe6",
      color: "#2c1810",
      avatarBg: "#2c1810", avatarColor: "#f5efe6",
      btnBg: "white", btnBorder: "#e0d6c4", btnColor: "#2c1810",
      nameFont: BRANDING_FONT_PLAYFAIR, nameFontStyle: "italic",
    },
    screen: { bgStyle: "#f5efe6", dark: false, titleColor: "#2c1810" },
  },
  {
    id: "monochrome",
    name: "Monochrome",
    tag: "Minimal", tagType: "minimal",
    preview: {
      bg: "white",
      color: "#0b1020",
      avatarBg: "#0b1020", avatarColor: "white",
      btnBg: "#0b1020", btnColor: "white",
      btnRadius: 0,
    },
    screen: { bgStyle: "white", dark: false, titleColor: "#0b1020" },
  },
  {
    id: "sunset",
    name: "Sunset",
    tag: "New", tagType: "new",
    preview: {
      bg: "linear-gradient(135deg, #ff7e5f 0%, #feb47b 100%)",
      color: "#3d1f0f",
      avatarBg: "rgba(255,255,255,0.85)", avatarColor: "#ff7e5f",
      btnBg: "rgba(255,255,255,0.85)", btnColor: "#3d1f0f",
      btnRadius: 99,
    },
    screen: { bgStyle: "linear-gradient(180deg, #ffd3b3 0%, #ff7e5f 60%, #c44569 100%)", dark: false, titleColor: "#3d1f0f" },
  },
  {
    id: "forest",
    name: "Deep Forest",
    tag: "Pro", tagType: "pro",
    isPro: true,
    preview: {
      bg: "linear-gradient(180deg, #0d2818 0%, #1a4a2e 100%)",
      color: "#d4e8d4",
      avatarBg: "linear-gradient(135deg, #7eae89, #d4e8d4)", avatarColor: "#0d2818",
      btnBg: "rgba(212,232,212,0.1)", btnBorder: "rgba(212,232,212,0.25)", btnColor: "#d4e8d4",
      btnRadius: 6,
      nameFont: BRANDING_FONT_DM_SERIF,
    },
    screen: { bgStyle: "linear-gradient(180deg, #0d2818 0%, #1a4a2e 100%)", dark: true, titleColor: "#d4e8d4" },
  },
  {
    id: "paper",
    name: "Paper Grain",
    tag: "Minimal", tagType: "minimal",
    preview: {
      bg: "#f4f1ea",
      color: "#2a2a2a",
      avatarBg: "white", avatarColor: "#2a2a2a",
      btnBg: "white", btnBorder: "#2a2a2a", btnColor: "#2a2a2a",
      btnRadius: 6,
    },
    screen: { bgStyle: "#f4f1ea", dark: false, titleColor: "#2a2a2a" },
  },
  {
    id: "cyber",
    name: "Cyber Terminal",
    tag: "Pro", tagType: "pro",
    isPro: true,
    preview: {
      bg: "#000",
      color: "#00ffaa",
      avatarBg: "transparent", avatarColor: "#00ffaa",
      btnBg: "transparent", btnBorder: "#00ffaa", btnColor: "#00ffaa",
      btnRadius: 0,
      nameFont: BRANDING_FONT_SPACE,
    },
    screen: { bgStyle: "#000", dark: true, titleColor: "#00ffaa" },
  },
  {
    id: "bubblegum",
    name: "Bubblegum",
    tag: "Playful", tagType: "playful",
    preview: {
      bg: "linear-gradient(135deg, #ffd6e8 0%, #c4e0ff 100%)",
      color: "#4a1f4a",
      avatarBg: "white", avatarColor: "#d6336c",
      btnBg: "white", btnColor: "#4a1f4a",
      btnRadius: 99,
    },
    screen: { bgStyle: "linear-gradient(135deg, #ffd6e8 0%, #c4e0ff 100%)", dark: false, titleColor: "#4a1f4a" },
  },
  {
    id: "editorial",
    name: "Editorial",
    tag: "New", tagType: "new",
    preview: {
      bg: "white",
      color: "#1a1a1a",
      avatarBg: "#1a1a1a", avatarColor: "white",
      btnBg: "transparent", btnBorder: "#1a1a1a", btnColor: "#1a1a1a",
      btnRadius: 0,
      nameFont: BRANDING_FONT_DM_SERIF,
    },
    screen: { bgStyle: "white", dark: false, titleColor: "#1a1a1a" },
  },
];

/** Default until the user picks another theme */
export const DEFAULT_THEME =
  BRANDING_THEMES.find((t) => t.id === "monochrome") ?? BRANDING_THEMES[0];

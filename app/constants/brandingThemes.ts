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

  /* ── Pro themes (shown in editor template grid) ── */
  {
    id: "ocean-drift",
    name: "Ocean Drift",
    tag: "Pro", tagType: "pro",
    isPro: true,
    preview: {
      bg: "linear-gradient(180deg, #0c4a6e 0%, #075985 100%)",
      color: "#bae6fd",
      avatarBg: "rgba(186,230,253,0.15)", avatarColor: "#bae6fd",
      btnBg: "rgba(186,230,253,0.08)", btnBorder: "rgba(186,230,253,0.2)", btnColor: "#bae6fd",
      btnRadius: 8,
    },
    screen: { bgStyle: "linear-gradient(180deg, #0c4a6e 0%, #075985 100%)", dark: true, titleColor: "#bae6fd" },
  },
  {
    id: "city-pulse",
    name: "City Pulse",
    tag: "Pro", tagType: "pro",
    isPro: true,
    preview: {
      bg: "linear-gradient(180deg, #1c1917 0%, #292524 100%)",
      color: "#fef3c7",
      avatarBg: "linear-gradient(135deg, #f59e0b, #ef4444)", avatarColor: "white",
      btnBg: "rgba(254,243,199,0.08)", btnBorder: "rgba(254,243,199,0.18)", btnColor: "#fef3c7",
      btnRadius: 4,
      nameFont: BRANDING_FONT_SPACE,
    },
    screen: { bgStyle: "linear-gradient(180deg, #1c1917 0%, #292524 100%)", dark: true, titleColor: "#f59e0b" },
  },
  {
    id: "stardust",
    name: "Stardust",
    tag: "Pro", tagType: "pro",
    isPro: true,
    preview: {
      bg: "linear-gradient(180deg, #1e1b4b 0%, #312e81 100%)",
      color: "#e0e7ff",
      avatarBg: "linear-gradient(135deg, #818cf8, #c4b5fd)", avatarColor: "white",
      btnBg: "rgba(224,231,255,0.08)", btnBorder: "rgba(224,231,255,0.18)", btnColor: "#e0e7ff",
      btnRadius: 8,
      nameFont: BRANDING_FONT_DM_SERIF,
    },
    screen: { bgStyle: "linear-gradient(180deg, #1e1b4b 0%, #312e81 100%)", dark: true, titleColor: "#818cf8" },
  },
  {
    id: "fireflies",
    name: "Fireflies",
    tag: "Pro", tagType: "pro",
    isPro: true,
    preview: {
      bg: "linear-gradient(180deg, #052e16 0%, #064e3b 100%)",
      color: "#bbf7d0",
      avatarBg: "linear-gradient(135deg, #4ade80, #86efac)", avatarColor: "#052e16",
      btnBg: "rgba(187,247,208,0.08)", btnBorder: "rgba(187,247,208,0.2)", btnColor: "#bbf7d0",
      btnRadius: 6,
    },
    screen: { bgStyle: "linear-gradient(180deg, #052e16 0%, #064e3b 100%)", dark: true, titleColor: "#4ade80" },
  },
  {
    id: "snowfall",
    name: "Snow Fall",
    tag: "Pro", tagType: "pro",
    isPro: true,
    preview: {
      bg: "linear-gradient(180deg, #1e293b 0%, #334155 100%)",
      color: "#f1f5f9",
      avatarBg: "rgba(241,245,249,0.1)", avatarColor: "#f1f5f9",
      btnBg: "rgba(241,245,249,0.07)", btnBorder: "rgba(241,245,249,0.18)", btnColor: "#f1f5f9",
      btnRadius: 6,
    },
    screen: { bgStyle: "linear-gradient(180deg, #1e293b 0%, #334155 100%)", dark: true, titleColor: "#f1f5f9" },
  },
  {
    id: "glass-card",
    name: "Glass Card",
    tag: "Pro", tagType: "pro",
    isPro: true,
    preview: {
      bg: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
      color: "white",
      avatarBg: "rgba(255,255,255,0.2)", avatarColor: "white",
      btnBg: "rgba(255,255,255,0.15)", btnBorder: "rgba(255,255,255,0.3)", btnColor: "white",
      btnRadius: 12,
    },
    screen: { bgStyle: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)", dark: true, titleColor: "white" },
  },
  /* ── Additional free themes ── */
  {
    id: "latte",
    name: "Latte",
    tag: "Minimal", tagType: "minimal",
    preview: {
      bg: "#fdf6ec",
      color: "#3b1f0c",
      avatarBg: "#3b1f0c", avatarColor: "#fdf6ec",
      btnBg: "#3b1f0c", btnColor: "#fdf6ec",
      btnRadius: 4,
      nameFont: BRANDING_FONT_PLAYFAIR,
    },
    screen: { bgStyle: "#fdf6ec", dark: false, titleColor: "#3b1f0c" },
  },
  {
    id: "neon-city",
    name: "Neon City",
    tag: "Bold", tagType: "bold",
    preview: {
      bg: "#09090b",
      color: "#f0abfc",
      avatarBg: "linear-gradient(135deg, #e879f9, #a21caf)", avatarColor: "white",
      btnBg: "transparent", btnBorder: "#e879f9", btnColor: "#f0abfc",
      btnRadius: 0,
      nameFont: BRANDING_FONT_SPACE,
    },
    screen: { bgStyle: "#09090b", dark: true, titleColor: "#e879f9" },
  },
  {
    id: "sakura",
    name: "Sakura",
    tag: "Playful", tagType: "playful",
    preview: {
      bg: "linear-gradient(135deg, #fce7f3 0%, #fdf2f8 100%)",
      color: "#9d174d",
      avatarBg: "white", avatarColor: "#ec4899",
      btnBg: "white", btnBorder: "#fbcfe8", btnColor: "#9d174d",
      btnRadius: 99,
    },
    screen: { bgStyle: "linear-gradient(135deg, #fce7f3 0%, #fdf2f8 100%)", dark: false, titleColor: "#9d174d" },
  },
  {
    id: "obsidian",
    name: "Obsidian",
    tag: "Dark", tagType: "dark",
    preview: {
      bg: "#09090b",
      color: "#a1a1aa",
      avatarBg: "#27272a", avatarColor: "#a1a1aa",
      btnBg: "#18181b", btnBorder: "#3f3f46", btnColor: "#a1a1aa",
      btnRadius: 6,
    },
    screen: { bgStyle: "#09090b", dark: true, titleColor: "#a1a1aa" },
  },
  {
    id: "golden-hour",
    name: "Golden Hour",
    tag: "Editorial", tagType: "editorial",
    preview: {
      bg: "linear-gradient(180deg, #fffbeb 0%, #fef3c7 100%)",
      color: "#78350f",
      avatarBg: "#78350f", avatarColor: "#fffbeb",
      btnBg: "transparent", btnBorder: "#78350f", btnColor: "#78350f",
      btnRadius: 0,
      nameFont: BRANDING_FONT_PLAYFAIR, nameFontStyle: "italic",
    },
    screen: { bgStyle: "linear-gradient(180deg, #fffbeb 0%, #fef3c7 100%)", dark: false, titleColor: "#b45309" },
  },
  {
    id: "dusk",
    name: "Dusk",
    tag: "Dark", tagType: "dark",
    preview: {
      bg: "linear-gradient(180deg, #0f0c29 0%, #302b63 50%, #24243e 100%)",
      color: "#c4b5fd",
      avatarBg: "rgba(196,181,253,0.15)", avatarColor: "#c4b5fd",
      btnBg: "rgba(196,181,253,0.08)", btnBorder: "rgba(196,181,253,0.2)", btnColor: "#c4b5fd",
      btnRadius: 8,
      nameFont: BRANDING_FONT_DM_SERIF,
    },
    screen: { bgStyle: "linear-gradient(180deg, #0f0c29 0%, #302b63 50%, #24243e 100%)", dark: true, titleColor: "#c4b5fd" },
  },
];

/** Default until the user picks another theme */
export const DEFAULT_THEME =
  BRANDING_THEMES.find((t) => t.id === "monochrome") ?? BRANDING_THEMES[0];

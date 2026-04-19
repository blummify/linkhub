import type { AppearanceState } from "../components/MobilePreview";
import { DEFAULT_APPEARANCE } from "../components/MobilePreview";

export type ThemePresetId = "indigo-mint" | "sunset-glow" | "midnight-oasis" | "cloud-white";

export interface ThemePreset {
  id: ThemePresetId;
  label: string;
  appearance: AppearanceState;
}

/** Full appearance snapshots for each Theme presets row on `/appearance` — drives `MobilePreview`. */
export const THEME_PRESETS: ThemePreset[] = [
  {
    id: "indigo-mint",
    label: "Indigo Mint",
    appearance: {
      ...DEFAULT_APPEARANCE,
      themeId: "indigo-mint",
      bgColor: "#f4f2fc",
      textColor: "#334155",
      titleColor: "#0f172a",
    },
  },
  {
    id: "sunset-glow",
    label: "Sunset Glow",
    appearance: {
      ...DEFAULT_APPEARANCE,
      themeId: "sunset-glow",
      bgColor: "#fff1e0",
      textColor: "#7c2d12",
      titleColor: "#431407",
    },
  },
  {
    id: "midnight-oasis",
    label: "Midnight Oasis",
    appearance: {
      ...DEFAULT_APPEARANCE,
      themeId: "midnight-oasis",
      bgColor: "#1a1b22",
      textColor: "#cbd5e1",
      titleColor: "#f1f5f9",
    },
  },
  {
    id: "cloud-white",
    label: "Cloud White",
    appearance: {
      ...DEFAULT_APPEARANCE,
      themeId: "cloud-white",
      bgColor: "#ffffff",
      textColor: "#475569",
      titleColor: "#0f172a",
    },
  },
];

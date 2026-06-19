/** Fixed per-platform colors for link icons — shared by `LinkIcon` and `PhoneLinkIcon` (never accent/theme-tinted). */
export const LINK_ICON_COLORS: Record<string, { bg: string; fg: string }> = {
  website: { bg: "linear-gradient(135deg,#eef1ff,#dbe2ff)", fg: "#2a37c0" },
  instagram: { bg: "linear-gradient(135deg,#ffe9f1,#ffd9e6)", fg: "#d6336c" },
  youtube: { bg: "linear-gradient(135deg,#fff1f0,#ffd9d6)", fg: "#c0392b" },
  twitter: { bg: "linear-gradient(135deg,#e9f3ff,#d2e6ff)", fg: "#1565d8" },
  spotify: { bg: "linear-gradient(135deg,#e9fff0,#d2f5e3)", fg: "#1db954" },
};

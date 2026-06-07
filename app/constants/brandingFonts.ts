/** Font stacks for `/branding` — aligned with linkhub-branding.html */

export const BRANDING_FONT_SANS =
  'var(--branding-font-sans, "Geist", -apple-system, sans-serif)';
export const BRANDING_FONT_MONO =
  'var(--branding-font-mono, "Geist Mono", ui-monospace, monospace)';
export const BRANDING_FONT_SERIF = "var(--branding-font-serif)";
export const BRANDING_FONT_PLAYFAIR =
  'var(--branding-font-playfair, "Playfair Display", Georgia, serif)';
export const BRANDING_FONT_DM_SERIF =
  'var(--branding-font-dm-serif, "DM Serif Display", Georgia, serif)';
export const BRANDING_FONT_SPACE =
  'var(--branding-font-space, "Space Grotesk", sans-serif)';

export const BRANDING_HEADING_FONT_OPTIONS = [
  {
    id: "instrument",
    name: "Instrument Serif",
    type: "Serif",
    value: "Instrument Serif",
    stack: BRANDING_FONT_SERIF,
    previewStyle: { fontStyle: "italic" as const, fontSize: 16 },
  },
  {
    id: "geist",
    name: "Geist",
    type: "Sans",
    value: "Geist",
    stack: BRANDING_FONT_SANS,
    previewStyle: { fontWeight: 600 },
  },
  {
    id: "dm-serif",
    name: "DM Serif",
    type: "Display",
    value: "DM Serif Display",
    stack: BRANDING_FONT_DM_SERIF,
  },
  {
    id: "space",
    name: "Space Grotesk",
    type: "Mono-ish",
    value: "Space Grotesk",
    stack: BRANDING_FONT_SPACE,
    previewStyle: { fontWeight: 700 },
  },
] as const;

export function brandingHeadingFontStack(name: string): string {
  const opt = BRANDING_HEADING_FONT_OPTIONS.find((f) => f.value === name);
  if (opt) return opt.stack;
  // Arbitrary Google Font selected via FontPicker — fall back gracefully
  if (name) return `"${name}", ui-serif, Georgia, serif`;
  return BRANDING_FONT_SERIF;
}

export function isBrandingHeadlineFont(name: string): boolean {
  return BRANDING_HEADING_FONT_OPTIONS.some((f) => f.value === name);
}

/** Inline styles for live preview headlines — matches DashboardPreviewPanel */
export function brandingHeadlinePreviewStyle(name: string): {
  fontStyle?: "normal" | "italic";
  fontWeight?: number;
  letterSpacing?: string;
} {
  const opt = BRANDING_HEADING_FONT_OPTIONS.find((f) => f.value === name);
  if (!opt) return {};
  const preview = "previewStyle" in opt ? opt.previewStyle : undefined;
  if (!preview) return { fontWeight: 400 };
  return {
    ...("fontStyle" in preview && preview.fontStyle
      ? { fontStyle: preview.fontStyle }
      : {}),
    fontWeight: "fontWeight" in preview ? preview.fontWeight : 400,
    letterSpacing: "-0.01em",
  };
}

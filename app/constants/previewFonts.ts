/** Options shown on `/appearance` — must match `next/font` variables in `app/layout.tsx`. */
export const HEADLINE_FONT_OPTIONS = ["Inter", "Manrope", "Playfair Display", "Outfit"] as const;
export type HeadlineFontOption = (typeof HEADLINE_FONT_OPTIONS)[number];

export const BODY_FONT_OPTIONS = ["Inter", "Roboto", "Open Sans"] as const;
export type BodyFontOption = (typeof BODY_FONT_OPTIONS)[number];

export function headlineFontStack(name: string): string {
  switch (name) {
    case "Inter":
      return "var(--next-font-inter), ui-sans-serif, system-ui, sans-serif";
    case "Manrope":
      return "var(--next-font-manrope), ui-sans-serif, system-ui, sans-serif";
    case "Playfair Display":
      return "var(--font-playfair), Georgia, ui-serif, serif";
    case "Outfit":
      return "var(--font-outfit), ui-sans-serif, system-ui, sans-serif";
    default:
      return "var(--next-font-inter), ui-sans-serif, system-ui, sans-serif";
  }
}

export function bodyFontStack(name: string): string {
  switch (name) {
    case "Inter":
      return "var(--next-font-inter), ui-sans-serif, system-ui, sans-serif";
    case "Roboto":
      return "var(--font-roboto), ui-sans-serif, system-ui, sans-serif";
    case "Open Sans":
      return "var(--font-open-sans), ui-sans-serif, system-ui, sans-serif";
    default:
      return "var(--next-font-inter), ui-sans-serif, system-ui, sans-serif";
  }
}

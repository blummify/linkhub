/**
 * Client-side Google Fonts loader.
 * Injects <link> elements into <head> — safe to call multiple times for the
 * same font (deduped via `loadedFonts` Set).
 */

const loadedFonts = new Set<string>();
let pickerSubsetLoaded = false;

const GOOGLE_FONTS_BASE = "https://fonts.googleapis.com/css2";

function injectLink(href: string): void {
  if (typeof document === "undefined") return;
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = href;
  document.head.appendChild(link);
}

/**
 * Load a single Google Font with common weights for use in the editor preview.
 * Skips fonts that are already bundled in globals.css.
 */
export function loadGoogleFont(fontValue: string): void {
  if (typeof document === "undefined") return;
  if (loadedFonts.has(fontValue)) return;
  loadedFonts.add(fontValue);

  const family = fontValue.replace(/ /g, "+");
  // Request regular + medium + semibold + bold weights; italic axis where available
  const href = `${GOOGLE_FONTS_BASE}?family=${family}:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap`;
  injectLink(href);
}

/**
 * Batch-load all picker fonts with a character subset just large enough to
 * render font names in their own typeface (A-Z a-z space).
 * Called once when the FontPicker mounts; avoids loading full glyph sets.
 */
export function loadPickerFonts(googleFamilies: string[]): void {
  if (typeof document === "undefined") return;
  if (pickerSubsetLoaded) return;
  pickerSubsetLoaded = true;

  // Filter to non-preloaded fonts
  const toLoad = googleFamilies.filter(Boolean);
  if (!toLoad.length) return;

  const familyParams = toLoad.map((f) => `family=${f}`).join("&");
  // text= limits download to only the characters needed to show font names
  const subset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz 0123456789";
  const href = `${GOOGLE_FONTS_BASE}?${familyParams}&display=block&text=${encodeURIComponent(subset)}`;
  injectLink(href);
}

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

export function loadGoogleFont(fontValue: string): void {
  if (typeof document === "undefined") return;
  if (loadedFonts.has(fontValue)) return;
  loadedFonts.add(fontValue);

  const family = fontValue.replace(/ /g, "+");
  const href = `${GOOGLE_FONTS_BASE}?family=${family}:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap`;
  injectLink(href);
}

export function loadPickerFonts(googleFamilies: string[]): void {
  if (typeof document === "undefined") return;
  if (pickerSubsetLoaded) return;
  pickerSubsetLoaded = true;

  const toLoad = googleFamilies.filter(Boolean);
  if (!toLoad.length) return;

  const familyParams = toLoad.map((f) => `family=${f}`).join("&");
  const subset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz 0123456789";
  const href = `${GOOGLE_FONTS_BASE}?${familyParams}&display=block&text=${encodeURIComponent(subset)}`;
  injectLink(href);
}

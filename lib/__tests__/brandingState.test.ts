import { describe, expect, it, beforeEach, vi } from "vitest";
import {
  BRANDING_STORAGE_KEY,
  brandingPublicUrl,
  brandingStateToMobileAppearance,
  brandingStateToPreviewAppearance,
  getBrandingThemeById,
  getDefaultBrandingState,
  loadBrandingState,
  saveBrandingState,
} from "@/lib/brandingState";
import { DEFAULT_THEME } from "@/app/constants/brandingThemes";

describe("brandingState", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("getDefaultBrandingState uses monochrome theme", () => {
    const state = getDefaultBrandingState();
    expect(state.themeId).toBe("monochrome");
    expect(state.fontFamily).toBe("Instrument Serif");
  });

  it("getBrandingThemeById maps legacy default to monochrome", () => {
    expect(getBrandingThemeById("default").id).toBe(DEFAULT_THEME.id);
    expect(getBrandingThemeById("custom").id).toBe(DEFAULT_THEME.id);
  });

  it("migrates legacy midnight without userPickedTheme", () => {
    localStorage.setItem(
      "linkhub-branding-v1",
      JSON.stringify({ themeId: "midnight", displayName: "Test" })
    );
    const loaded = loadBrandingState();
    expect(loaded.themeId).toBe("monochrome");
    expect(localStorage.getItem(BRANDING_STORAGE_KEY)).toBeTruthy();
    expect(localStorage.getItem("linkhub-branding-v1")).toBeNull();
  });

  it("keeps midnight when user explicitly picked it", () => {
    saveBrandingState({
      ...getDefaultBrandingState(),
      themeId: "midnight",
      userPickedTheme: true,
    });
    expect(loadBrandingState().themeId).toBe("midnight");
  });

  it("brandingStateToMobileAppearance maps theme and fonts", () => {
    const state = getDefaultBrandingState();
    const appearance = brandingStateToMobileAppearance(state);
    expect(appearance.profileTitle).toBe(state.displayName);
    expect(appearance.themeId).toBe("monochrome");
    expect(appearance.bodyFontFamily).toBe("Geist");
    expect(appearance.headlineStyle?.fontStyle).toBe("italic");
  });

  it("brandingStateToMobileAppearance maps button shape to buttonRoundness", () => {
    const pill = brandingStateToMobileAppearance({
      ...getDefaultBrandingState(),
      buttonStyle: "pill",
    });
    expect(pill.buttonRoundness).toBe("pill");

    const square = brandingStateToMobileAppearance({
      ...getDefaultBrandingState(),
      buttonStyle: "square",
    });
    expect(square.buttonRoundness).toBe("square");
  });

  it("brandingStateToPreviewAppearance includes headline font stack", () => {
    const preview = brandingStateToPreviewAppearance(getDefaultBrandingState());
    expect(preview.bgStyle).toBe("white");
    expect(preview.dark).toBe(false);
    expect(preview.headlineFont).toContain("branding-font-serif");
  });

  it("brandingPublicUrl builds slug from handle", () => {
    expect(brandingPublicUrl("joel")).toBe("getlinkhub.app/joel");
    expect(brandingPublicUrl("  ")).toBe("getlinkhub.app/");
  });

  it("saveBrandingState dispatches custom event", () => {
    const handler = vi.fn();
    window.addEventListener("linkhub-branding-change", handler);
    const state = getDefaultBrandingState();
    saveBrandingState(state);
    expect(handler).toHaveBeenCalled();
    window.removeEventListener("linkhub-branding-change", handler);
  });
});

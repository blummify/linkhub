import { describe, it, expect } from "vitest";
import { computeProfileThemeTokens, type ProfileThemeInput } from "../publicProfileTheme";

const BASE: ProfileThemeInput = {
  themeId: "monochrome",
  accentColor: null,
  buttonStyle: "rounded",
  fontFamily: "Instrument Serif",
  backgroundType: "gradient",
  backgroundValue: "midnight",
  cardStyle: "filled",
};

describe("computeProfileThemeTokens", () => {
  it("lets backgroundType/backgroundValue override the theme's own --p-bg — mirrors DashboardPreviewPanel", () => {
    // themeId "monochrome" is light, but backgroundValue "midnight" is a dark gradient —
    // this exact combination is what the user's real account had.
    const tokens = computeProfileThemeTokens(BASE);
    expect(tokens["--p-bg"]).toContain("#0b1020");
  });

  it("card/text colors come from the theme's OWN darkness, not the background override (matches PhoneScreenContent, which is given the unmodified theme-only `dark` flag)", () => {
    // Same dark-background+light-theme combo as above: cards must still render
    // light-theme colors (white bg, dark text), exactly like the dashboard preview.
    const tokens = computeProfileThemeTokens(BASE);
    expect(tokens["--p-card-bg"]).toBe("white");
    expect(tokens["--p-card-text"]).toBe("#0b1020");
    expect(tokens["--p-muted"]).toBe("#6b75a3");
  });

  it("falls back to the theme's own background when no gradient override matches", () => {
    const tokens = computeProfileThemeTokens({ ...BASE, themeId: "paper", backgroundValue: "not-a-real-gradient-id" });
    expect(tokens["--p-bg"]).toBe("#f4f1ea"); // BRANDING_THEMES "paper".screen.bgStyle
  });

  it("uses a literal solid:#hex background", () => {
    const tokens = computeProfileThemeTokens({ ...BASE, backgroundValue: "solid:#112233" });
    expect(tokens["--p-bg"]).toBe("#112233");
  });

  it("falls back to a hardcoded dark background for image/video types (matches DashboardPreviewPanel)", () => {
    const image = computeProfileThemeTokens({ ...BASE, backgroundType: "image", backgroundValue: "https://example.com/bg.jpg" });
    const video = computeProfileThemeTokens({ ...BASE, backgroundType: "video", backgroundValue: "https://example.com/bg.mp4" });
    expect(image["--p-bg"]).toBe("#0b1020");
    expect(video["--p-bg"]).toBe("#0b1020");
  });

  it("resolves card colors per cardStyle for a genuinely dark theme (ghost/soft/filled)", () => {
    const filled = computeProfileThemeTokens({ ...BASE, themeId: "midnight" });
    const ghost = computeProfileThemeTokens({ ...BASE, themeId: "midnight", cardStyle: "ghost" });
    const soft = computeProfileThemeTokens({ ...BASE, themeId: "midnight", cardStyle: "soft", accentColor: "#ff0000" });

    expect(filled["--p-card-bg"]).toBe("rgba(255,255,255,0.08)");
    expect(ghost["--p-card-bg"]).toBe("transparent");
    expect(soft["--p-card-bg"]).toContain("#ff0000");
  });

  it("uses fixed avatar/icon-adjacent colors regardless of theme (matches PhoneScreenContent's hardcoded avatar gradient)", () => {
    const midnight = computeProfileThemeTokens({ ...BASE, themeId: "midnight" });
    const paper = computeProfileThemeTokens({ ...BASE, themeId: "paper" });
    expect(midnight["--p-avatar-bg"]).toBe(paper["--p-avatar-bg"]);
    expect(midnight["--p-avatar-bg"]).toBe("linear-gradient(135deg, #3b46e0, #7a85ff)");
  });

  it("uses fixed footer colors regardless of theme (matches PhoneScreenContent's hardcoded footer)", () => {
    const midnight = computeProfileThemeTokens({ ...BASE, themeId: "midnight" });
    const paper = computeProfileThemeTokens({ ...BASE, themeId: "paper" });
    expect(midnight["--p-footer-muted"]).toBe("#6b75a3");
    expect(midnight["--p-footer-brand"]).toBe("#3b46e0");
    expect(midnight["--p-footer-muted"]).toBe(paper["--p-footer-muted"]);
  });

  it("falls back to the theme's own title color when accentColor is unset", () => {
    const tokens = computeProfileThemeTokens({ ...BASE, themeId: "midnight", accentColor: null });
    expect(tokens["--p-accent"]).toBe("white"); // BRANDING_THEMES "midnight".screen.titleColor
  });

  it("uses the explicit accentColor when set, even over the theme default", () => {
    const tokens = computeProfileThemeTokens({ ...BASE, accentColor: "#ff0000" });
    expect(tokens["--p-accent"]).toBe("#ff0000");
  });

  it("derives --p-btn-radius from buttonStyle", () => {
    const square = computeProfileThemeTokens({ ...BASE, buttonStyle: "square" });
    const pill = computeProfileThemeTokens({ ...BASE, buttonStyle: "pill" });
    expect(square["--p-btn-radius"]).toBe("0px");
    expect(pill["--p-btn-radius"]).toBe("999px");
  });

  it("derives --p-heading from fontFamily, defaulting to Instrument Serif", () => {
    const withFont = computeProfileThemeTokens({ ...BASE, fontFamily: "Geist" });
    const withoutFont = computeProfileThemeTokens({ ...BASE, fontFamily: null });
    expect(withFont["--p-heading"]).not.toBe(withoutFont["--p-heading"]);
  });
});

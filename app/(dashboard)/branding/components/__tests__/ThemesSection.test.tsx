import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ThemesSection } from "../ThemesSection";

const { MOCK_THEMES } = vi.hoisted(() => ({
  MOCK_THEMES: [
    {
      id: "monochrome",
      name: "Monochrome",
      tag: "Popular",
      tagType: "popular",
      isPro: false,
      screen: { dark: false },
      preview: {
        bg: "#ffffff",
        color: "#0b1020",
        avatarBg: "#eef0f7",
        avatarColor: "#0b1020",
        nameFont: "inherit",
        nameFontStyle: "normal",
        btnRadius: 8,
        btnBg: "#0b1020",
        btnColor: "#ffffff",
      },
    },
    {
      id: "cream",
      name: "Cream",
      tag: "Minimal",
      tagType: "minimal",
      isPro: false,
      screen: { dark: false },
      preview: {
        bg: "#fffaf0",
        color: "#0b1020",
        avatarBg: "#f3e7d0",
        avatarColor: "#0b1020",
        nameFont: "inherit",
        nameFontStyle: "normal",
        btnRadius: 8,
        btnBg: "#0b1020",
        btnColor: "#ffffff",
      },
    },
    {
      id: "forest",
      name: "Deep Forest",
      tag: "Pro",
      tagType: "pro",
      isPro: true,
      screen: { dark: true },
      preview: {
        bg: "#0b1020",
        color: "#ffffff",
        avatarBg: "#1f2937",
        avatarColor: "#ffffff",
        nameFont: "inherit",
        nameFontStyle: "normal",
        btnRadius: 8,
        btnBg: "#ffffff",
        btnColor: "#0b1020",
      },
    },
  ],
}));

vi.mock("@/app/constants/brandingThemes", () => ({
  BRANDING_THEMES: MOCK_THEMES,
}));

vi.mock("@/app/actions/profile", () => ({
  sendEditorLink: vi.fn().mockResolvedValue({ success: true }),
}));

describe("ThemesSection", () => {
  it("renders theme cards and category chips", () => {
    render(
      <ThemesSection
        selectedThemeId="monochrome"
        displayName="Alex"
        handle="alex"
        onSelect={vi.fn()}
        compact
      />
    );
    expect(screen.getAllByText("Monochrome").length).toBeGreaterThan(0);
    expect(screen.getByText("All themes")).toBeInTheDocument();
  });

  it("calls onSelect for free themes", () => {
    const onSelect = vi.fn();
    const cream = MOCK_THEMES.find((t) => t.id === "cream")!;
    render(
      <ThemesSection
        selectedThemeId="monochrome"
        displayName="Alex"
        handle="alex"
        onSelect={onSelect}
        compact
      />
    );
    fireEvent.click(screen.getByText(cream.name));
    expect(onSelect).toHaveBeenCalledWith(
      expect.objectContaining({ id: "cream" })
    );
  });

  it("calls onSelect for pro themes (upgrade gate is at save time, not click time)", () => {
    const onSelect = vi.fn();
    render(
      <ThemesSection
        selectedThemeId="monochrome"
        displayName="Alex"
        handle="alex"
        onSelect={onSelect}
        compact
      />
    );
    fireEvent.click(screen.getByText("Deep Forest"));
    expect(onSelect).toHaveBeenCalledWith(
      expect.objectContaining({ id: "forest", isPro: true })
    );
    expect(screen.queryByText(/is a Pro theme/i)).not.toBeInTheDocument();
  });
});

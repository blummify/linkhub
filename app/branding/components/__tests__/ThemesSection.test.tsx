import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ThemesSection } from "../ThemesSection";
import { BRANDING_THEMES } from "@/app/constants/brandingThemes";

describe("ThemesSection", () => {
  it("renders theme cards and category chips", () => {
    render(
      <ThemesSection
        selectedThemeId="monochrome"
        displayName="Alex"
        handle="alex"
        onSelect={vi.fn()}
      />
    );
    expect(screen.getAllByText("Monochrome").length).toBeGreaterThan(0);
    expect(screen.getByText("All themes")).toBeInTheDocument();
  });

  it("calls onSelect for free themes", () => {
    const onSelect = vi.fn();
    const cream = BRANDING_THEMES.find((t) => t.id === "cream")!;
    render(
      <ThemesSection
        selectedThemeId="monochrome"
        displayName="Alex"
        handle="alex"
        onSelect={onSelect}
      />
    );
    fireEvent.click(screen.getByText(cream.name));
    expect(onSelect).toHaveBeenCalledWith(
      expect.objectContaining({ id: "cream" })
    );
  });

  it("opens pro modal instead of selecting pro themes", () => {
    const onSelect = vi.fn();
    render(
      <ThemesSection
        selectedThemeId="monochrome"
        displayName="Alex"
        handle="alex"
        onSelect={onSelect}
      />
    );
    fireEvent.click(screen.getByText("Deep Forest"));
    expect(onSelect).not.toHaveBeenCalled();
    expect(screen.getByText(/is a Pro theme/i)).toBeInTheDocument();
  });
});

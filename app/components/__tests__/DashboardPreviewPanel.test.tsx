import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { DashboardPreviewPanel } from "../DashboardPreviewPanel";

describe("DashboardPreviewPanel", () => {
  it("renders display name and device toggles", () => {
    render(<DashboardPreviewPanel />);
    // displayName comes from useBrandingStore mock: "Your Name"
    expect(screen.getByText("Your Name")).toBeInTheDocument();
    expect(screen.getByText(/Mobile/)).toBeInTheDocument();
    expect(screen.getByText(/Desktop/)).toBeInTheDocument();
  });

  it("renders theme footer with the resolved theme name when showThemeFooter is set", () => {
    render(<DashboardPreviewPanel showThemeFooter />);
    // themeId "default" resolves to DEFAULT_THEME which is "monochrome" → "Monochrome"
    expect(screen.getByText(/Monochrome/)).toBeInTheDocument();
  });
});

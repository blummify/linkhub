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

  it("uses edge-to-edge mobile preview in sheet mode (no device frame)", () => {
    const { container } = render(<DashboardPreviewPanel width="100%" />);
    expect(container.querySelector('[data-preview-frame="edge"]')).toBeInTheDocument();
    expect(container.querySelector('[data-preview-frame="device"]')).not.toBeInTheDocument();
    expect(container.querySelector("[data-preview-notch]")).not.toBeInTheDocument();
  });

  it("hides desktop header actions and shows bottom share CTA in sheet mode", () => {
    render(<DashboardPreviewPanel width="100%" />);
    expect(screen.queryByTitle("Open in new tab")).not.toBeInTheDocument();
    expect(screen.queryByTitle("Share")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Share my page" })).toBeInTheDocument();
  });

  it("keeps desktop panel header actions and device frame", () => {
    const { container } = render(<DashboardPreviewPanel width={420} />);
    expect(screen.getByTitle("Open in new tab")).toBeInTheDocument();
    expect(screen.getByTitle("Share")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Share my page" })).not.toBeInTheDocument();
    expect(container.querySelector('[data-preview-frame="device"]')).toBeInTheDocument();
  });
});

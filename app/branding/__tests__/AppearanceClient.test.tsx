import { describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import AppearanceClient from "../AppearanceClient";
import { renderWithSidebarAndBranding } from "@/app/test-utils/renderWithProviders";

vi.mock("@/app/components/CollapsibleSidebar", () => ({
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock("@/app/components/DashboardPreviewPanel", () => ({
  DashboardPreviewPanel: () => <div data-testid="preview-panel" />,
}));

describe("AppearanceClient", () => {
  it("renders branding page heading and sections", () => {
    renderWithSidebarAndBranding(<AppearanceClient />);
    expect(screen.getByText(/Make it/i)).toBeInTheDocument();
    expect(screen.getByText(/yours/i)).toBeInTheDocument();
    expect(screen.getByText("Your profile")).toBeInTheDocument();
    expect(screen.getByText("Themes & templates")).toBeInTheDocument();
    expect(screen.getByText("Quick tune")).toBeInTheDocument();
    expect(screen.getByTestId("preview-panel")).toBeInTheDocument();
  });
});

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

vi.mock("@/app/actions/links", () => ({
  getProfile: vi.fn().mockResolvedValue(null),
}));

vi.mock("@/app/actions/profile", () => ({
  updateAvatarUrl: vi.fn().mockResolvedValue({ success: true }),
  removeAvatar: vi.fn().mockResolvedValue({ success: true }),
}));

vi.mock("@/app/actions/upload", () => ({
  deleteOrphanedUpload: vi.fn().mockResolvedValue({ success: true }),
}));

vi.mock("@/lib/hooks/useFileUpload", () => ({
  useFileUpload: () => ({
    upload: vi.fn().mockResolvedValue(null),
    isUploading: false,
    progress: 0,
    error: null,
    reset: vi.fn(),
  }),
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

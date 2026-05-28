import { describe, expect, it, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import UserAdminClient from "../UserAdminClient";
import { renderWithSidebarAndBranding } from "@/app/test-utils/renderWithProviders";

vi.mock("@/app/components/CollapsibleSidebar", () => ({
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock("@/app/components/DashboardPreviewPanel", () => ({
  DashboardPreviewPanel: () => <div data-testid="preview-panel" />,
}));

vi.mock("@/app/actions/links", () => ({
  getLinks: vi.fn().mockResolvedValue([]),
  getProfile: vi.fn().mockResolvedValue({
    handle: "alex",
    bio: "Bio",
    themeId: "default",
    hasClaimedHandle: true,
    user: { name: "Alex", email: "alex@example.com" },
  }),
  addLink: vi.fn(),
  updateLink: vi.fn(),
  deleteLink: vi.fn(),
  claimHandle: vi.fn(),
  dismissHandleClaim: vi.fn(),
  checkHandleAvailability: vi.fn().mockResolvedValue({ available: true }),
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

describe("UserAdminClient", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders manage links section after load", async () => {
    renderWithSidebarAndBranding(<UserAdminClient />);
    await waitFor(() => {
      expect(
        screen.getByText(/Manage and organize your digital presence/i)
      ).toBeInTheDocument();
    });
    expect(screen.getByTestId("preview-panel")).toBeInTheDocument();
  });
});

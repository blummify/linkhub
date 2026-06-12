import { describe, expect, it, vi, beforeEach } from "vitest";
import { fireEvent, screen, waitFor } from "@testing-library/react";
import UserAdminClient from "../UserAdminClient";
import { renderWithSidebarAndBranding } from "@/app/test-utils/renderWithProviders";
import { useUIStore } from "@/store/uiStore";
import { useLinksStore } from "@/store/linksStore";

// Override the global fixed-state uiStore mock with a real Zustand store so the
// shortcut handler (uses getState) and these tests (use setState/getState) work.
vi.mock("@/store/uiStore", async () => {
  const { create } = await vi.importActual<typeof import("zustand")>("zustand");
  const useUIStore = create<Record<string, unknown>>((set) => ({
    showLinkModal: false,
    editingLink: null,
    pendingDelete: null,
    showPalette: false,
    openAddLink: () => set({ showLinkModal: true, editingLink: null }),
    openEditLink: (link: unknown, index: number) =>
      set({ showLinkModal: true, editingLink: { link, index } }),
    closeLinkModal: () => set({ showLinkModal: false }),
    setPendingDelete: (pendingDelete: unknown) => set({ pendingDelete }),
    openPalette: () => set({ showPalette: true }),
    closePalette: () => set({ showPalette: false }),
  }));
  return { useUIStore };
});

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
    useUIStore.setState({
      showLinkModal: false,
      editingLink: null,
      pendingDelete: null,
      showPalette: false,
    });
    useLinksStore.getState().links = [];
    useLinksStore.getState().isLoading = false;
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

  it("hides the mobile Add link FAB when there are no links", async () => {
    renderWithSidebarAndBranding(<UserAdminClient />);
    await waitFor(() => {
      expect(
        screen.getByText(/Manage and organize your digital presence/i)
      ).toBeInTheDocument();
    });
    expect(screen.queryByRole("button", { name: /^add link$/i })).not.toBeInTheDocument();
  });

  it("shows the mobile Add link FAB when links exist", async () => {
    useLinksStore.getState().links = [
      { id: "1", title: "Site", url: "https://example.com", clicks: "0" },
    ];
    renderWithSidebarAndBranding(<UserAdminClient />);
    await waitFor(() => {
      expect(screen.getByText("Site")).toBeInTheDocument();
    });
    expect(screen.getByRole("button", { name: /^add link$/i })).toBeInTheDocument();
  });

  describe('"N" keyboard shortcut', () => {
    async function renderLoaded() {
      renderWithSidebarAndBranding(<UserAdminClient />);
      await waitFor(() => {
        expect(
          screen.getByText(/Manage and organize your digital presence/i)
        ).toBeInTheDocument();
      });
    }

    it('opens the add-link modal when "n" is pressed', async () => {
      await renderLoaded();
      expect(useUIStore.getState().showLinkModal).toBe(false);

      fireEvent.keyDown(document.body, { key: "n" });

      expect(useUIStore.getState().showLinkModal).toBe(true);
      expect(useUIStore.getState().editingLink).toBeNull();
    });

    it("ignores the shortcut while typing in a field", async () => {
      await renderLoaded();
      const input = document.createElement("input");
      document.body.appendChild(input);
      input.focus();

      fireEvent.keyDown(input, { key: "n" });

      expect(useUIStore.getState().showLinkModal).toBe(false);
      input.remove();
    });

    it("ignores the shortcut while another overlay is open", async () => {
      await renderLoaded();
      useUIStore.setState({ showPalette: true });

      fireEvent.keyDown(document.body, { key: "n" });

      expect(useUIStore.getState().showLinkModal).toBe(false);
    });

    it("ignores the shortcut when a modifier key is held", async () => {
      await renderLoaded();

      fireEvent.keyDown(document.body, { key: "n", metaKey: true });
      fireEvent.keyDown(document.body, { key: "n", ctrlKey: true });

      expect(useUIStore.getState().showLinkModal).toBe(false);
    });
  });
});

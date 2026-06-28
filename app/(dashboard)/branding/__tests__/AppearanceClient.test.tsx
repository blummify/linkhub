import { describe, expect, it, vi, beforeEach } from "vitest";
import { screen, fireEvent, within, waitFor } from "@testing-library/react";
import { toast } from "sonner";
import AppearanceClient from "../AppearanceClient";
import { renderWithSidebarAndBranding } from "@/app/test-utils/renderWithProviders";
import { claimHandle } from "@/app/actions/links";
import { updateBranding } from "@/app/actions/profile";

const { brandingState, useBrandingStoreMock } = vi.hoisted(() => {
  const baseline = {
    themeId: "default",
    displayName: "Your Name",
    handle: "",
    bio: "",
    accentColor: "#3b46e0",
    buttonStyle: "rounded",
    fontFamily: "Instrument Serif",
    userPickedTheme: false,
    backgroundType: "gradient" as const,
    backgroundValue: "midnight",
    backgroundKey: null,
    effects: [] as string[],
    textColor: null,
    cardStyle: "filled",
    bodyFont: "Geist",
    overlayColor: "#000000",
    overlayOpacity: 0,
    profileLayout: "classic",
    linkDensity: "default",
    customThemeName: "My Theme",
  };

  const state = {
    ...baseline,
    _baseline: { ...baseline },
    isDirty: false,
    hydrated: true,
    setDisplayName: vi.fn((v: string) => {
      state.displayName = v;
    }),
    setHandle: vi.fn(),
    setBio: vi.fn(),
    setAccentColor: vi.fn(),
    setButtonStyle: vi.fn(),
    setFontFamily: vi.fn(),
    selectTheme: vi.fn(),
    randomTheme: vi.fn(),
    reset: vi.fn(() => {
      Object.assign(state, { ...state._baseline, isDirty: false });
    }),
    markSaved: vi.fn(),
    syncFromDb: vi.fn((data: Partial<typeof baseline>) => {
      Object.assign(state, data);
      Object.assign(state._baseline, data);
    }),
  };

  const useBrandingStoreMock = Object.assign(
    (selector?: (s: typeof state) => unknown) =>
      selector ? selector(state) : state,
    { getState: () => state }
  );

  return { brandingState: state, useBrandingStoreMock };
});

vi.mock("@/store/brandingStore", () => ({
  useBrandingStore: useBrandingStoreMock,
}));

vi.mock("@/app/components/CollapsibleSidebar", () => ({
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock("@/app/components/DashboardPreviewPanel", () => ({
  DashboardPreviewPanel: () => <div data-testid="preview-panel" />,
}));

// Heavy children not exercised by these tests — stub them so the render stays
// cheap and deterministic (the real ThemesSection alone renders every theme
// with live previews, which blew the 5s timeout under parallel-worker load).
vi.mock("../components/ThemesSection", () => ({
  ThemesSection: () => <div data-testid="themes-section" />,
}));

vi.mock("@/app/components/CommandPalette", () => ({
  CommandPalette: () => null,
}));

vi.mock("@/app/components/ClaimHandleModal", () => ({
  ClaimHandleModal: () => null,
}));

vi.mock("@/app/actions/links", () => ({
  getProfile: vi.fn().mockResolvedValue(null),
  claimHandle: vi.fn().mockResolvedValue({ success: true }),
  checkHandleAvailability: vi.fn().mockResolvedValue({ available: true }),
}));

vi.mock("@/app/actions/profile", () => ({
  updateAvatarUrl: vi.fn().mockResolvedValue({ success: true }),
  removeAvatar: vi.fn().mockResolvedValue({ success: true }),
  updateBranding: vi.fn().mockResolvedValue({ success: true }),
  getUserCustomThemes: vi.fn().mockResolvedValue([]),
  applyCustomTheme: vi.fn().mockResolvedValue({ success: true, theme: {} }),
  deleteCustomTheme: vi.fn().mockResolvedValue({ success: true }),
}));

vi.mock("@/app/actions/upload", () => ({
  deleteOrphanedUpload: vi.fn().mockResolvedValue({ success: true }),
}));

vi.mock("sonner", () => ({
  toast: { error: vi.fn(), success: vi.fn() },
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

function resetBrandingState() {
  const baseline = brandingState._baseline;
  Object.assign(brandingState, {
    ...baseline,
    _baseline: { ...baseline },
    isDirty: false,
  });
}

describe("AppearanceClient", () => {
  beforeEach(() => {
    resetBrandingState();
    vi.clearAllMocks();
    document.documentElement.removeAttribute("data-dirty-save-visible");
  });

  it("renders branding page heading and sections", () => {
    renderWithSidebarAndBranding(<AppearanceClient />);
    expect(screen.getByText(/Make it/i)).toBeInTheDocument();
    expect(screen.getByText(/yours/i)).toBeInTheDocument();
    expect(screen.getByText("Your profile")).toBeInTheDocument();
    expect(screen.getByText("Themes & templates")).toBeInTheDocument();
    expect(screen.getByText("Quick tune")).toBeInTheDocument();
    expect(screen.getByTestId("preview-panel")).toBeInTheDocument();
  });

  it("renders a single desktop save toolbar in the page header", () => {
    renderWithSidebarAndBranding(<AppearanceClient />);
    expect(screen.getAllByTestId("dirty-save-toolbar")).toHaveLength(1);
    expect(screen.getByRole("button", { name: /Save changes/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Reset" })).toBeInTheDocument();
  });

  it("does not render a desktop bottom save bar", () => {
    brandingState.displayName = "Edited name";
    renderWithSidebarAndBranding(<AppearanceClient />);
    expect(screen.getAllByTestId("dirty-save-bar")).toHaveLength(1);
    expect(screen.getByTestId("dirty-save-bar").className).toContain("lg:hidden");
  });

  it("hides mobile dirty save bar when the form is clean", () => {
    renderWithSidebarAndBranding(<AppearanceClient />);
    expect(screen.getByTestId("dirty-save-bar")).toHaveAttribute("aria-hidden", "true");
  });

  it("shows mobile dirty save bar when the form is dirty", () => {
    brandingState.displayName = "New name";
    renderWithSidebarAndBranding(<AppearanceClient />);
    expect(screen.getByTestId("dirty-save-bar")).toHaveAttribute("aria-hidden", "false");
  });

  it("shows unsaved indicator in desktop toolbar when dirty", () => {
    brandingState.displayName = "New name";
    renderWithSidebarAndBranding(<AppearanceClient />);
    expect(screen.getByTestId("dirty-save-toolbar")).toHaveTextContent("Unsaved changes");
    expect(screen.getByRole("button", { name: /Save changes/i })).toBeEnabled();
  });

  it("disables desktop save controls when clean", () => {
    renderWithSidebarAndBranding(<AppearanceClient />);
    expect(screen.getByTestId("dirty-save-toolbar")).not.toHaveTextContent("Unsaved changes");
    expect(screen.getByRole("button", { name: /Save changes/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Reset" })).toBeDisabled();
  });

  it("sets data-dirty-save-visible on the document when dirty", () => {
    brandingState.displayName = "New name";
    renderWithSidebarAndBranding(<AppearanceClient />);
    expect(document.documentElement.hasAttribute("data-dirty-save-visible")).toBe(true);
  });

  it("confirms before resetting unsaved changes", () => {
    brandingState.displayName = "Edited name";
    renderWithSidebarAndBranding(<AppearanceClient />);

    const toolbar = screen.getByTestId("dirty-save-toolbar");
    fireEvent.click(within(toolbar).getByRole("button", { name: "Reset" }));

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Discard changes?")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Discard changes" }));
    fireEvent.animationEnd(screen.getByTestId("modal-panel"));
    expect(brandingState.reset).toHaveBeenCalled();
  });

  it("persists a changed handle via claimHandle on save", async () => {
    brandingState._baseline.handle = "oldhandle";
    brandingState.handle = "newhandle";
    renderWithSidebarAndBranding(<AppearanceClient />);

    fireEvent.click(screen.getByRole("button", { name: /Save changes/i }));

    await waitFor(() => expect(claimHandle).toHaveBeenCalledWith("newhandle"));
    expect(updateBranding).toHaveBeenCalled();
    await waitFor(() => expect(brandingState.markSaved).toHaveBeenCalled());
  });

  it("skips claimHandle when the handle is unchanged", async () => {
    brandingState._baseline.handle = "samehandle";
    brandingState.handle = "samehandle";
    brandingState.displayName = "New name";
    renderWithSidebarAndBranding(<AppearanceClient />);

    fireEvent.click(screen.getByRole("button", { name: /Save changes/i }));

    await waitFor(() => expect(updateBranding).toHaveBeenCalled());
    expect(claimHandle).not.toHaveBeenCalled();
    expect(brandingState.markSaved).toHaveBeenCalled();
  });

  it("shows an error and reverts the handle when claimHandle fails", async () => {
    vi.mocked(claimHandle).mockResolvedValueOnce({ error: "That handle is already taken. Try another." });
    brandingState._baseline.handle = "oldhandle";
    brandingState.handle = "takenhandle";
    renderWithSidebarAndBranding(<AppearanceClient />);

    fireEvent.click(screen.getByRole("button", { name: /Save changes/i }));

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith("That handle is already taken. Try another.")
    );
    expect(brandingState.syncFromDb).toHaveBeenCalledWith({ handle: "oldhandle" });
    expect(updateBranding).not.toHaveBeenCalled();
    expect(brandingState.markSaved).not.toHaveBeenCalled();
  });

  it("surfaces an error without marking saved when a save action throws", async () => {
    vi.mocked(updateBranding).mockRejectedValueOnce(new Error("Unauthorized"));
    brandingState.displayName = "New name";
    renderWithSidebarAndBranding(<AppearanceClient />);

    fireEvent.click(screen.getByRole("button", { name: /Save changes/i }));

    await waitFor(() => expect(toast.error).toHaveBeenCalled());
    expect(brandingState.markSaved).not.toHaveBeenCalled();
  });
});

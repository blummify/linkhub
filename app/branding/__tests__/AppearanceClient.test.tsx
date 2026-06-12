import { describe, expect, it, vi, beforeEach } from "vitest";
import { screen, fireEvent, within } from "@testing-library/react";
import AppearanceClient from "../AppearanceClient";
import { renderWithSidebarAndBranding } from "@/app/test-utils/renderWithProviders";

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

  it("does not show save controls in the page header", () => {
    brandingState.displayName = "Edited name";
    renderWithSidebarAndBranding(<AppearanceClient />);

    const heading = screen.getByRole("heading", { name: /Make it/i });
    const headerSection = heading.closest("div")?.parentElement;
    expect(headerSection).toBeTruthy();
    expect(within(headerSection!).queryByRole("button", { name: /save/i })).not.toBeInTheDocument();
    expect(within(headerSection!).queryByRole("button", { name: /reset/i })).not.toBeInTheDocument();
  });

  it("hides dirty save bars when the form is clean", () => {
    renderWithSidebarAndBranding(<AppearanceClient />);
    const bars = screen.getAllByTestId("dirty-save-bar");
    expect(bars).toHaveLength(2);
    bars.forEach((bar) => expect(bar).toHaveAttribute("aria-hidden", "true"));
  });

  it("shows dirty save bars when the form is dirty", () => {
    brandingState.displayName = "New name";
    renderWithSidebarAndBranding(<AppearanceClient />);

    const bars = screen.getAllByTestId("dirty-save-bar");
    expect(bars).toHaveLength(2);
    bars.forEach((bar) => expect(bar).toHaveAttribute("aria-hidden", "false"));
  });

  it("pins the desktop save bar to the center column", () => {
    brandingState.displayName = "Edited name";
    renderWithSidebarAndBranding(<AppearanceClient />);

    const desktopBar = screen
      .getAllByTestId("dirty-save-bar")
      .find((el) => el.className.includes("lg:flex"));
    expect(desktopBar?.style.left).toBe("256px");
    expect(desktopBar?.style.right).toBe("420px");
  });

  it("confirms before resetting unsaved changes", () => {
    brandingState.displayName = "Edited name";
    renderWithSidebarAndBranding(<AppearanceClient />);

    const resetButtons = screen.getAllByRole("button", { name: "Reset" });
    fireEvent.click(resetButtons[0]);

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Discard changes?")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Discard changes" }));
    fireEvent.animationEnd(screen.getByTestId("modal-panel"));
    expect(brandingState.reset).toHaveBeenCalled();
  });
});

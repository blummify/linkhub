import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { EditorClient } from "../EditorClient";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

const mockStore = {
  themeId: "monochrome",
  accentColor: "#3b46e0",
  buttonStyle: "rounded",
  fontFamily: "inter",
  backgroundType: "gradient",
  backgroundValue: "midnight",
  backgroundKey: null,
  effects: [],
  displayName: "Test User",
  handle: "testuser",
  // new fields added in editor v2
  textColor: null,
  cardStyle: "filled",
  bodyFont: "Geist",
  overlayColor: "#000000",
  overlayOpacity: 0,
  profileLayout: "classic",
  linkDensity: "default",
  // actions
  syncFromDb: vi.fn(),
  markSaved: vi.fn(),
  setBackground: vi.fn(),
  toggleEffect: vi.fn(),
  setAccentColor: vi.fn(),
  setButtonStyle: vi.fn(),
  setFontFamily: vi.fn(),
  selectTheme: vi.fn(),
};

vi.mock("@/store/brandingStore", () => ({
  useBrandingStore: () => mockStore,
}));

vi.mock("@/app/actions/profile", () => ({
  saveEditorTheme: vi.fn().mockResolvedValue({ success: true }),
}));

vi.mock("../components/EditorShell", () => ({
  EditorShell: ({ onSave }: { onSave: () => void; isSaving: boolean }) => (
    <div>
      <span>Editor shell</span>
      <button type="button" onClick={onSave}>Save changes</button>
    </div>
  ),
}));

vi.mock("../components/EntryScreen", () => ({
  EntryScreen: ({
    selected,
    onSelect,
    onOpen,
  }: {
    selected: string;
    onSelect: (m: string) => void;
    onOpen: () => void;
  }) => (
    <div>
      <span>Entry screen</span>
      <button type="button" onClick={() => onSelect("template")}>Template</button>
      <button type="button" onClick={() => onSelect("scratch")}>Scratch</button>
      <button type="button" onClick={onOpen}>Open the Editor</button>
      <span data-testid="selected">{selected}</span>
    </div>
  ),
}));

vi.mock("../components/EditorUpgradeModal", () => ({
  EditorUpgradeModal: ({ onClose }: { onClose: () => void }) => (
    <div role="dialog">
      <span>Upgrade modal</span>
      <button type="button" onClick={onClose}>Keep editing</button>
    </div>
  ),
}));

describe("EditorClient", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders entry screen by default", () => {
    render(<EditorClient />);
    expect(screen.getByText("Entry screen")).toBeInTheDocument();
  });

  it("transitions to editor shell when Open the Editor is clicked", () => {
    render(<EditorClient />);
    fireEvent.click(screen.getByText("Open the Editor"));
    expect(screen.getByText("Editor shell")).toBeInTheDocument();
  });

  it("changes start mode selection", () => {
    render(<EditorClient />);
    expect(screen.getByTestId("selected").textContent).toBe("template");
    fireEvent.click(screen.getByText("Scratch"));
    expect(screen.getByTestId("selected").textContent).toBe("scratch");
  });

  it("shows upgrade modal when save returns requiresUpgrade", async () => {
    const { saveEditorTheme } = await import("@/app/actions/profile");
    (saveEditorTheme as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ requiresUpgrade: true });

    render(<EditorClient />);
    fireEvent.click(screen.getByText("Open the Editor"));
    fireEvent.click(screen.getByText("Save changes"));

    expect(await screen.findByRole("dialog")).toBeInTheDocument();
  });

  it("closes upgrade modal when Keep editing is clicked", async () => {
    const { saveEditorTheme } = await import("@/app/actions/profile");
    (saveEditorTheme as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ requiresUpgrade: true });

    render(<EditorClient />);
    fireEvent.click(screen.getByText("Open the Editor"));
    fireEvent.click(screen.getByText("Save changes"));

    const dialog = await screen.findByRole("dialog");
    fireEvent.click(screen.getByText("Keep editing"));
    expect(dialog).not.toBeInTheDocument();
  });

  it("shows error banner when save returns an error", async () => {
    const { saveEditorTheme } = await import("@/app/actions/profile");
    (saveEditorTheme as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      error: "Failed to save theme. Please try again.",
    });

    render(<EditorClient />);
    fireEvent.click(screen.getByText("Open the Editor"));
    fireEvent.click(screen.getByText("Save changes"));

    expect(await screen.findByRole("alert")).toBeInTheDocument();
    expect(await screen.findByText(/Failed to save theme/)).toBeInTheDocument();
  });

  it("dismisses error banner when the dismiss button is clicked", async () => {
    const { saveEditorTheme } = await import("@/app/actions/profile");
    (saveEditorTheme as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      error: "Failed to save theme. Please try again.",
    });

    render(<EditorClient />);
    fireEvent.click(screen.getByText("Open the Editor"));
    fireEvent.click(screen.getByText("Save changes"));

    const alert = await screen.findByRole("alert");
    fireEvent.click(screen.getByLabelText("Dismiss error"));
    expect(alert).not.toBeInTheDocument();
  });

  it("shows error banner on unexpected thrown error during save", async () => {
    const { saveEditorTheme } = await import("@/app/actions/profile");
    (saveEditorTheme as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error("Network error"));

    render(<EditorClient />);
    fireEvent.click(screen.getByText("Open the Editor"));
    fireEvent.click(screen.getByText("Save changes"));

    expect(await screen.findByRole("alert")).toBeInTheDocument();
    expect(await screen.findByText(/Something went wrong/)).toBeInTheDocument();
  });

  it("calls markSaved and navigates on successful save", async () => {
    const { saveEditorTheme } = await import("@/app/actions/profile");
    (saveEditorTheme as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ success: true });

    render(<EditorClient />);
    fireEvent.click(screen.getByText("Open the Editor"));
    fireEvent.click(screen.getByText("Save changes"));

    await screen.findByText("Editor shell");
    expect(mockStore.markSaved).toHaveBeenCalledOnce();
  });
});

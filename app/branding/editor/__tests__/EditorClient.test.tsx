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
  // editor v2 fields
  textColor: null,
  cardStyle: "filled",
  bodyFont: "Geist",
  overlayColor: "#000000",
  overlayOpacity: 0,
  profileLayout: "classic",
  linkDensity: "default",
  customThemeName: "My Theme",
  // store state
  isDirty: false,
  // actions
  syncFromDb: vi.fn(),
  markSaved: vi.fn(),
  setBackground: vi.fn(),
  toggleEffect: vi.fn(),
  setAccentColor: vi.fn(),
  setButtonStyle: vi.fn(),
  setFontFamily: vi.fn(),
  setCustomThemeName: vi.fn(),
};

vi.mock("@/store/brandingStore", () => ({
  useBrandingStore: () => mockStore,
}));

vi.mock("@/app/actions/profile", () => ({
  saveEditorTheme: vi.fn().mockResolvedValue({ success: true }),
}));

// EditorShell exposes both "Save" (opens save modal) and "Cancel"
vi.mock("../components/EditorShell", () => ({
  EditorShell: ({
    onSave,
    onCancel,
  }: {
    isDirty: boolean;
    isSaving: boolean;
    onSave: () => void;
    onCancel: () => void;
  }) => (
    <div>
      <span>Editor shell</span>
      <button type="button" onClick={onSave}>Save</button>
      <button type="button" onClick={onCancel}>Cancel</button>
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
    <div role="dialog" aria-label="upgrade">
      <span>Upgrade modal</span>
      <button type="button" onClick={onClose}>Keep editing</button>
    </div>
  ),
}));

// SaveThemeModal: renders a "Confirm save" button that calls onSave with a name
vi.mock("../components/SaveThemeModal", () => ({
  SaveThemeModal: ({
    initialName,
    onCancel,
    onSave,
  }: {
    initialName: string;
    isSaving: boolean;
    onCancel: () => void;
    onSave: (name: string) => void;
  }) => (
    <div role="dialog" aria-label="save-theme">
      <span>Save theme modal</span>
      <input data-testid="theme-name" defaultValue={initialName} />
      <button type="button" onClick={() => onSave(initialName)}>Confirm save</button>
      <button type="button" onClick={onCancel}>Cancel save</button>
    </div>
  ),
}));

// DiscardModal
vi.mock("../components/DiscardModal", () => ({
  DiscardModal: ({
    onKeepEditing,
    onDiscard,
  }: {
    onKeepEditing: () => void;
    onDiscard: () => void;
  }) => (
    <div role="dialog" aria-label="discard">
      <span>Discard modal</span>
      <button type="button" onClick={onKeepEditing}>Keep editing</button>
      <button type="button" onClick={onDiscard}>Discard</button>
    </div>
  ),
}));

// Helper: open the editor
function openEditor() {
  render(<EditorClient />);
  fireEvent.click(screen.getByText("Open the Editor"));
}

describe("EditorClient", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockStore.isDirty = false;
  });

  // ── Entry screen ────────────────────────────────────────────────────────────

  it("renders entry screen by default", () => {
    render(<EditorClient />);
    expect(screen.getByText("Entry screen")).toBeInTheDocument();
  });

  it("transitions to editor shell when Open the Editor is clicked", () => {
    openEditor();
    expect(screen.getByText("Editor shell")).toBeInTheDocument();
  });

  it("changes start mode selection", () => {
    render(<EditorClient />);
    expect(screen.getByTestId("selected").textContent).toBe("template");
    fireEvent.click(screen.getByText("Scratch"));
    expect(screen.getByTestId("selected").textContent).toBe("scratch");
  });

  // ── Save flow ───────────────────────────────────────────────────────────────

  it("opens save theme modal when Save is clicked", () => {
    openEditor();
    fireEvent.click(screen.getByText("Save"));
    expect(screen.getByText("Save theme modal")).toBeInTheDocument();
  });

  it("dismisses save modal when Cancel save is clicked", () => {
    openEditor();
    fireEvent.click(screen.getByText("Save"));
    fireEvent.click(screen.getByText("Cancel save"));
    expect(screen.queryByText("Save theme modal")).not.toBeInTheDocument();
  });

  it("calls saveEditorTheme and markSaved on successful save", async () => {
    const { saveEditorTheme } = await import("@/app/actions/profile");
    (saveEditorTheme as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ success: true });

    openEditor();
    fireEvent.click(screen.getByText("Save"));
    fireEvent.click(screen.getByText("Confirm save"));

    await screen.findByText("Editor shell");
    expect(saveEditorTheme).toHaveBeenCalledOnce();
    expect(mockStore.markSaved).toHaveBeenCalledOnce();
  });

  it("shows upgrade modal when save returns requiresUpgrade", async () => {
    const { saveEditorTheme } = await import("@/app/actions/profile");
    (saveEditorTheme as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ requiresUpgrade: true });

    openEditor();
    fireEvent.click(screen.getByText("Save"));
    fireEvent.click(screen.getByText("Confirm save"));

    expect(await screen.findByLabelText("upgrade")).toBeInTheDocument();
  });

  it("closes upgrade modal when Keep editing is clicked", async () => {
    const { saveEditorTheme } = await import("@/app/actions/profile");
    (saveEditorTheme as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ requiresUpgrade: true });

    openEditor();
    fireEvent.click(screen.getByText("Save"));
    fireEvent.click(screen.getByText("Confirm save"));

    const dialog = await screen.findByLabelText("upgrade");
    fireEvent.click(screen.getByText("Keep editing"));
    expect(dialog).not.toBeInTheDocument();
  });

  it("shows error banner when save returns an error", async () => {
    const { saveEditorTheme } = await import("@/app/actions/profile");
    (saveEditorTheme as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      error: "Failed to save theme. Please try again.",
    });

    openEditor();
    fireEvent.click(screen.getByText("Save"));
    fireEvent.click(screen.getByText("Confirm save"));

    expect(await screen.findByRole("alert")).toBeInTheDocument();
    expect(await screen.findByText(/Failed to save theme/)).toBeInTheDocument();
  });

  it("dismisses error banner when the dismiss button is clicked", async () => {
    const { saveEditorTheme } = await import("@/app/actions/profile");
    (saveEditorTheme as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      error: "Failed to save theme. Please try again.",
    });

    openEditor();
    fireEvent.click(screen.getByText("Save"));
    fireEvent.click(screen.getByText("Confirm save"));

    const alert = await screen.findByRole("alert");
    fireEvent.click(screen.getByLabelText("Dismiss error"));
    expect(alert).not.toBeInTheDocument();
  });

  it("shows error banner on unexpected thrown error during save", async () => {
    const { saveEditorTheme } = await import("@/app/actions/profile");
    (saveEditorTheme as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error("Network error"));

    openEditor();
    fireEvent.click(screen.getByText("Save"));
    fireEvent.click(screen.getByText("Confirm save"));

    expect(await screen.findByRole("alert")).toBeInTheDocument();
    expect(await screen.findByText(/Something went wrong/)).toBeInTheDocument();
  });

  // ── Cancel / discard flow ───────────────────────────────────────────────────

  it("navigates to /branding when Cancel clicked with no dirty changes", () => {
    const pushMock = vi.fn();
    vi.doMock("next/navigation", () => ({ useRouter: () => ({ push: pushMock }) }));

    openEditor();
    mockStore.isDirty = false;
    fireEvent.click(screen.getByText("Cancel"));
    // no discard modal shown
    expect(screen.queryByLabelText("discard")).not.toBeInTheDocument();
  });

  it("shows discard modal when Cancel clicked with dirty changes", () => {
    mockStore.isDirty = true;
    openEditor();
    fireEvent.click(screen.getByText("Cancel"));
    expect(screen.getByLabelText("discard")).toBeInTheDocument();
  });

  it("closes discard modal when Keep editing is clicked", () => {
    mockStore.isDirty = true;
    openEditor();
    fireEvent.click(screen.getByText("Cancel"));
    fireEvent.click(screen.getByText("Keep editing"));
    expect(screen.queryByLabelText("discard")).not.toBeInTheDocument();
  });
});

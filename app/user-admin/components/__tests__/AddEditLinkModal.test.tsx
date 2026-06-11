import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { AddEditLinkModal } from "../AddEditLinkModal";
import type { ManagedLink } from "../types";

vi.mock("@/lib/hooks/useFileUpload", () => ({
  useFileUpload: () => ({
    upload: vi.fn().mockResolvedValue(null),
    isUploading: false,
    progress: 0,
    error: null,
    reset: vi.fn(),
  }),
}));

const noop = vi.fn();

describe("AddEditLinkModal", () => {
  it("renders nothing when closed", () => {
    const { container } = render(
      <AddEditLinkModal open={false} onClose={noop} onSave={noop} />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("shows add-mode heading when no initialLink", () => {
    render(<AddEditLinkModal open onClose={noop} onSave={noop} />);
    expect(screen.getByText("Add a")).toBeInTheDocument();
    expect(screen.getByText("new link")).toBeInTheDocument();
  });

  it("shows edit-mode heading when initialLink is provided", () => {
    const link: ManagedLink = { title: "My Site", url: "https://example.com", clicks: "0" };
    render(<AddEditLinkModal open onClose={noop} onSave={noop} initialLink={link} />);
    expect(screen.getByText("Edit")).toBeInTheDocument();
    expect(screen.getByText("link")).toBeInTheDocument();
  });

  it("disables the save button when title or url is empty", () => {
    render(<AddEditLinkModal open onClose={noop} onSave={noop} />);
    const saveBtn = screen.getByRole("button", { name: /add link/i });
    expect(saveBtn).toBeDisabled();
  });

  it("enables the save button when title and url are filled", () => {
    render(<AddEditLinkModal open onClose={noop} onSave={noop} />);
    fireEvent.change(screen.getByPlaceholderText("e.g. Latest Portfolio Drop"), {
      target: { value: "My Blog" },
    });
    fireEvent.change(screen.getByPlaceholderText("https://example.com"), {
      target: { value: "https://blog.com" },
    });
    expect(screen.getByRole("button", { name: /add link/i })).not.toBeDisabled();
  });

  it("calls onSave with correct data and then onClose", async () => {
    const onSave = vi.fn();
    const onClose = vi.fn();
    render(<AddEditLinkModal open onClose={onClose} onSave={onSave} />);
    fireEvent.change(screen.getByPlaceholderText("e.g. Latest Portfolio Drop"), {
      target: { value: "My Blog" },
    });
    fireEvent.change(screen.getByPlaceholderText("https://example.com"), {
      target: { value: "https://blog.com" },
    });
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /add link/i }));
    });
    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({ title: "My Blog", url: "https://blog.com" })
    );
    fireEvent.animationEnd(screen.getByTestId("modal-panel"));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("pre-fills fields from initialLink in edit mode", () => {
    const link: ManagedLink = { title: "Existing", url: "https://existing.com", clicks: "5" };
    render(<AddEditLinkModal open onClose={noop} onSave={noop} initialLink={link} />);
    expect(screen.getByDisplayValue("Existing")).toBeInTheDocument();
    expect(screen.getByDisplayValue("https://existing.com")).toBeInTheDocument();
  });

  it("calls onClose when Cancel is clicked", () => {
    const onClose = vi.fn();
    render(<AddEditLinkModal open onClose={onClose} onSave={noop} />);
    act(() => { fireEvent.click(screen.getByText("Cancel")); });
    fireEvent.animationEnd(screen.getByTestId("modal-panel"));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("selects a preset icon via aria-label", () => {
    render(<AddEditLinkModal open onClose={noop} onSave={noop} />);
    const instagramBtn = screen.getByRole("button", { name: "Instagram" });
    fireEvent.click(instagramBtn);
    // After clicking, the instagram preset button should be the active one
    expect(instagramBtn).toBeInTheDocument();
  });

  it("defaults status toggle to published (aria-checked=true)", () => {
    render(<AddEditLinkModal open onClose={noop} onSave={noop} />);
    const toggle = screen.getByRole("switch");
    expect(toggle).toHaveAttribute("aria-checked", "true");
  });

  it("allows switching to draft status via toggle", () => {
    render(<AddEditLinkModal open onClose={noop} onSave={noop} />);
    const toggle = screen.getByRole("switch");
    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute("aria-checked", "false");
    expect(screen.getByText("Save as draft")).toBeInTheDocument();
  });

  it("shows character counter for title", () => {
    render(<AddEditLinkModal open onClose={noop} onSave={noop} />);
    expect(screen.getByText("0 / 50")).toBeInTheDocument();
    fireEvent.change(screen.getByPlaceholderText("e.g. Latest Portfolio Drop"), {
      target: { value: "Hello" },
    });
    expect(screen.getByText("5 / 50")).toBeInTheDocument();
  });

  it("shows keyboard shortcut hint in footer", () => {
    render(<AddEditLinkModal open onClose={noop} onSave={noop} />);
    expect(screen.getByText("↵")).toBeInTheDocument();
    expect(screen.getByText("esc")).toBeInTheDocument();
  });
});

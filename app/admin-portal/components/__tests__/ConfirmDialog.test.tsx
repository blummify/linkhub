import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ConfirmDialog } from "../ConfirmDialog";

const baseProps = {
  title: "Delete user?",
  description: "This can't be undone.",
  confirmLabel: "Delete",
  onConfirm: vi.fn(),
  onCancel: vi.fn(),
};

describe("ConfirmDialog", () => {
  it("renders nothing when closed", () => {
    const { container } = render(<ConfirmDialog open={false} {...baseProps} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders as an alertdialog with the copy", () => {
    render(<ConfirmDialog open {...baseProps} />);
    const dialog = screen.getByRole("alertdialog", { name: "Delete user?" });
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(screen.getByText("This can't be undone.")).toBeInTheDocument();
  });

  it("fires confirm and cancel callbacks", () => {
    const onConfirm = vi.fn();
    const onCancel = vi.fn();
    render(<ConfirmDialog open {...baseProps} onConfirm={onConfirm} onCancel={onCancel} />);
    fireEvent.click(screen.getByRole("button", { name: "Delete" }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("disables actions while loading", () => {
    render(<ConfirmDialog open {...baseProps} loading />);
    expect(screen.getByRole("button", { name: "Cancel" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Working…" })).toBeDisabled();
  });

  it("cancels on Escape, but not while loading", () => {
    const onCancel = vi.fn();
    const { rerender } = render(<ConfirmDialog open {...baseProps} onCancel={onCancel} />);
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onCancel).toHaveBeenCalledTimes(1);

    rerender(<ConfirmDialog open {...baseProps} onCancel={onCancel} loading />);
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});

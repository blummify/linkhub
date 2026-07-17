import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { DialogShell } from "../DialogShell";

describe("DialogShell", () => {
  it("renders nothing when closed", () => {
    const { container } = render(
      <DialogShell open={false} ariaLabel="Test dialog" onClose={vi.fn()}>
        <p>Body</p>
      </DialogShell>
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("renders children with the given aria-label and dialog role when open", () => {
    render(
      <DialogShell open ariaLabel="Test dialog" onClose={vi.fn()}>
        <p>Body content</p>
      </DialogShell>
    );
    expect(screen.getByRole("dialog", { name: "Test dialog" })).toBeInTheDocument();
    expect(screen.getByText("Body content")).toBeInTheDocument();
  });

  it("uses the alertdialog role when specified", () => {
    render(
      <DialogShell open ariaLabel="Alert dialog" role="alertdialog" onClose={vi.fn()}>
        <p>Body</p>
      </DialogShell>
    );
    expect(screen.getByRole("alertdialog", { name: "Alert dialog" })).toBeInTheDocument();
  });

  it("calls onClose when the backdrop is clicked", () => {
    const onClose = vi.fn();
    const { container } = render(
      <DialogShell open ariaLabel="Test dialog" onClose={onClose}>
        <p>Body</p>
      </DialogShell>
    );
    fireEvent.click(container.querySelector('[aria-hidden="true"]')!);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("does not call onClose on backdrop click while locked", () => {
    const onClose = vi.fn();
    const { container } = render(
      <DialogShell open ariaLabel="Test dialog" locked onClose={onClose}>
        <p>Body</p>
      </DialogShell>
    );
    fireEvent.click(container.querySelector('[aria-hidden="true"]')!);
    expect(onClose).not.toHaveBeenCalled();
  });

  it("calls onClose on Escape unless locked", () => {
    const onClose = vi.fn();
    render(
      <DialogShell open ariaLabel="Test dialog" onClose={onClose}>
        <p>Body</p>
      </DialogShell>
    );
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("ignores Escape while locked", () => {
    const onClose = vi.fn();
    render(
      <DialogShell open ariaLabel="Test dialog" locked onClose={onClose}>
        <p>Body</p>
      </DialogShell>
    );
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).not.toHaveBeenCalled();
  });
});

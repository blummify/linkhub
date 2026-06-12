import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { DirtyStateSaveBar } from "../DirtyStateSaveBar";

vi.mock("../hooks/usePrefersReducedMotion", () => ({
  usePrefersReducedMotion: () => false,
}));

describe("DirtyStateSaveBar", () => {
  it("is hidden from assistive tech when not visible", () => {
    render(<DirtyStateSaveBar visible={false} onReset={vi.fn()} onSave={vi.fn()} />);
    expect(screen.getByRole("region", { hidden: true })).toHaveAttribute("aria-hidden", "true");
  });

  it("shows unsaved label and actions when visible", () => {
    render(<DirtyStateSaveBar visible onReset={vi.fn()} onSave={vi.fn()} />);
    expect(screen.getByText("Unsaved changes")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Reset" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Save changes/i })).toBeInTheDocument();
  });

  it("calls onReset and onSave", () => {
    const onReset = vi.fn();
    const onSave = vi.fn();
    render(<DirtyStateSaveBar visible onReset={onReset} onSave={onSave} />);
    fireEvent.click(screen.getByRole("button", { name: "Reset" }));
    fireEvent.click(screen.getByRole("button", { name: /Save changes/i }));
    expect(onReset).toHaveBeenCalledOnce();
    expect(onSave).toHaveBeenCalledOnce();
  });

  it("uses motion tokens for slide transition", () => {
    const { rerender } = render(
      <DirtyStateSaveBar visible onReset={vi.fn()} onSave={vi.fn()} />
    );
    const bar = screen.getByRole("region", { name: "Unsaved changes" });
    expect(bar).toHaveStyle({ transition: "transform var(--motion-base) var(--ease-out)" });

    rerender(<DirtyStateSaveBar visible={false} onReset={vi.fn()} onSave={vi.fn()} />);
    expect(bar).toHaveStyle({ transition: "transform var(--motion-base) var(--ease-in)" });
  });

  it("merges layout transition with slide transition", () => {
    render(
      <DirtyStateSaveBar
        visible
        onReset={vi.fn()}
        onSave={vi.fn()}
        style={{ left: 256, transition: "left var(--motion-base) var(--ease-standard)" }}
      />
    );
    const bar = screen.getByRole("region", { name: "Unsaved changes" });
    expect(bar).toHaveStyle({
      transition:
        "left var(--motion-base) var(--ease-standard), transform var(--motion-base) var(--ease-out)",
    });
  });
});

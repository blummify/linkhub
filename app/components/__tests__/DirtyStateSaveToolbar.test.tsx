import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { DirtyStateSaveToolbar } from "../DirtyStateSaveToolbar";

describe("DirtyStateSaveToolbar", () => {
  it("shows unsaved indicator and enabled actions when dirty", () => {
    render(<DirtyStateSaveToolbar dirty onReset={vi.fn()} onSave={vi.fn()} />);
    expect(screen.getByText("Unsaved changes")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Reset" })).toBeEnabled();
    expect(screen.getByRole("button", { name: /Save changes/i })).toBeEnabled();
  });

  it("hides unsaved indicator and disables actions when clean", () => {
    render(<DirtyStateSaveToolbar dirty={false} onReset={vi.fn()} onSave={vi.fn()} />);
    expect(screen.queryByText("Unsaved changes")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Reset" })).toBeDisabled();
    expect(screen.getByRole("button", { name: /Save changes/i })).toBeDisabled();
  });

  it("calls handlers when dirty", () => {
    const onReset = vi.fn();
    const onSave = vi.fn();
    render(<DirtyStateSaveToolbar dirty onReset={onReset} onSave={onSave} />);
    fireEvent.click(screen.getByRole("button", { name: "Reset" }));
    fireEvent.click(screen.getByRole("button", { name: /Save changes/i }));
    expect(onReset).toHaveBeenCalledOnce();
    expect(onSave).toHaveBeenCalledOnce();
  });
});

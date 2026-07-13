import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { Toggle } from "../Toggle";

describe("Toggle", () => {
  it("exposes switch semantics with its label", () => {
    render(<Toggle checked={false} onChange={() => {}} aria-label="Feature" />);
    const sw = screen.getByRole("switch", { name: "Feature" });
    expect(sw).toHaveAttribute("aria-checked", "false");
  });

  it("reflects the checked state", () => {
    render(<Toggle checked onChange={() => {}} aria-label="Feature" />);
    expect(screen.getByRole("switch")).toHaveAttribute("aria-checked", "true");
  });

  it("emits the opposite value on click", () => {
    const onChange = vi.fn();
    render(<Toggle checked={false} onChange={onChange} aria-label="Feature" />);
    fireEvent.click(screen.getByRole("switch"));
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it("does not emit when disabled", () => {
    const onChange = vi.fn();
    render(<Toggle checked={false} onChange={onChange} aria-label="Feature" disabled />);
    fireEvent.click(screen.getByRole("switch"));
    expect(onChange).not.toHaveBeenCalled();
  });
});

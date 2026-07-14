import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { PlanToggleSwitch } from "../PlanToggleSwitch";

describe("PlanToggleSwitch", () => {
  it("renders as an accessible switch and toggles state", () => {
    const onChange = vi.fn();
    const { rerender } = render(
      <PlanToggleSwitch checked={false} label="Custom theme editor" onChange={onChange} />
    );

    const toggle = screen.getByRole("switch", { name: "Custom theme editor" });
    expect(toggle).toHaveAttribute("aria-checked", "false");

    fireEvent.click(toggle);
    expect(onChange).toHaveBeenCalledWith(true);

    rerender(<PlanToggleSwitch checked={true} label="Custom theme editor" onChange={onChange} />);
    expect(screen.getByRole("switch", { name: "Custom theme editor" })).toHaveAttribute(
      "aria-checked",
      "true"
    );
  });
});

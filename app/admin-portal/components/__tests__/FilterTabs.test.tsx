import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { FilterTabs } from "../FilterTabs";

const tabs = [
  { value: "all", label: "All" },
  { value: "pro", label: "Pro" },
  { value: "suspended", label: "Suspended" },
];

describe("FilterTabs", () => {
  it("marks the active tab with aria-pressed", () => {
    render(<FilterTabs tabs={tabs} active="pro" onChange={vi.fn()} aria-label="Filter users" />);
    expect(screen.getByRole("button", { name: "Pro" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "All" })).toHaveAttribute("aria-pressed", "false");
  });

  it("calls onChange with the selected value", () => {
    const onChange = vi.fn();
    render(<FilterTabs tabs={tabs} active="all" onChange={onChange} aria-label="Filter users" />);
    fireEvent.click(screen.getByRole("button", { name: "Suspended" }));
    expect(onChange).toHaveBeenCalledWith("suspended");
  });
});

import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Select } from "../Select";

const options = [
  { value: "all", label: "All actors" },
  { value: "act_ama", label: "Ama Mensah" },
];

describe("Select", () => {
  it("renders the current value and options", () => {
    render(<Select value="all" onChange={vi.fn()} options={options} aria-label="Filter by actor" />);
    const select = screen.getByRole("combobox", { name: "Filter by actor" });
    expect(select).toHaveValue("all");
    expect(screen.getByRole("option", { name: "Ama Mensah" })).toBeInTheDocument();
  });

  it("calls onChange with the selected value", () => {
    const onChange = vi.fn();
    render(<Select value="all" onChange={onChange} options={options} aria-label="Filter by actor" />);
    fireEvent.change(screen.getByRole("combobox", { name: "Filter by actor" }), {
      target: { value: "act_ama" },
    });
    expect(onChange).toHaveBeenCalledWith("act_ama");
  });
});

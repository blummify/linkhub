import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { SearchInput } from "../SearchInput";

describe("SearchInput", () => {
  it("renders the controlled value and an accessible label", () => {
    render(<SearchInput value="kofi" onChange={vi.fn()} aria-label="Search users" />);
    expect(screen.getByRole("searchbox", { name: "Search users" })).toHaveValue("kofi");
  });

  it("emits changes as the user types", () => {
    const onChange = vi.fn();
    render(<SearchInput value="" onChange={onChange} aria-label="Search users" />);
    fireEvent.change(screen.getByRole("searchbox"), { target: { value: "sara" } });
    expect(onChange).toHaveBeenCalledWith("sara");
  });
});

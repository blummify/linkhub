import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Pager } from "../Pager";

describe("Pager", () => {
  it("renders a button per page and disables prev on the first page", () => {
    render(<Pager page={1} pageSize={8} total={23} onPage={vi.fn()} />);
    // 23 / 8 => 3 pages.
    expect(screen.getByRole("button", { name: "Page 3" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Page 4" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Previous page" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Next page" })).toBeEnabled();
  });

  it("marks the current page and disables next on the last page", () => {
    render(<Pager page={3} pageSize={8} total={23} onPage={vi.fn()} />);
    expect(screen.getByRole("button", { name: "Page 3" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("button", { name: "Next page" })).toBeDisabled();
  });

  it("calls onPage when a page is chosen", () => {
    const onPage = vi.fn();
    render(<Pager page={1} pageSize={8} total={23} onPage={onPage} />);
    fireEvent.click(screen.getByRole("button", { name: "Page 2" }));
    expect(onPage).toHaveBeenCalledWith(2);
  });
});

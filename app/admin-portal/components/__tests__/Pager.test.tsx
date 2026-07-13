import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { pageItems, Pager } from "../Pager";

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

  it("windows a large page range instead of rendering every page", () => {
    // 1712 / 8 => 214 pages.
    render(<Pager page={7} pageSize={8} total={1712} onPage={vi.fn()} />);
    for (const name of ["Page 1", "Page 6", "Page 7", "Page 8", "Page 214"]) {
      expect(screen.getByRole("button", { name })).toBeInTheDocument();
    }
    expect(screen.queryByRole("button", { name: "Page 2" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Page 100" })).not.toBeInTheDocument();
    expect(screen.getAllByText("…")).toHaveLength(2);
  });
});

describe("pageItems", () => {
  it("renders short ranges in full", () => {
    expect(pageItems(3, 7)).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });

  it("collapses only the far side near the edges", () => {
    expect(pageItems(1, 214)).toEqual([1, 2, "ellipsis", 214]);
    expect(pageItems(3, 214)).toEqual([1, 2, 3, 4, "ellipsis", 214]);
    expect(pageItems(214, 214)).toEqual([1, "ellipsis", 213, 214]);
  });

  it("collapses both sides from the middle", () => {
    expect(pageItems(100, 214)).toEqual([1, "ellipsis", 99, 100, 101, "ellipsis", 214]);
  });
});

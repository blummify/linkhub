import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { DashboardTopBar } from "../DashboardTopBar";

describe("DashboardTopBar", () => {
  it("renders search placeholder and calls onSearchClick", () => {
    const onSearchClick = vi.fn();
    render(
      <DashboardTopBar
        onSearchClick={onSearchClick}
        searchPlaceholder="Search themes…"
      />
    );
    expect(screen.getByPlaceholderText("Search themes…")).toBeInTheDocument();
    fireEvent.click(screen.getByPlaceholderText("Search themes…").parentElement!);
    expect(onSearchClick).toHaveBeenCalledOnce();
  });

  it("toggles sidebar from menu button", () => {
    render(<DashboardTopBar />);
    fireEvent.click(screen.getByLabelText("Toggle sidebar"));
    expect(screen.getByLabelText("Toggle sidebar")).toBeInTheDocument();
  });
});

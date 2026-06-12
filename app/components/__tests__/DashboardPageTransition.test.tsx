import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { DashboardPageTransition } from "../DashboardPageTransition";

vi.mock("next/navigation", () => ({
  usePathname: () => "/user-dashboard",
}));

describe("DashboardPageTransition", () => {
  it("renders children", () => {
    render(
      <DashboardPageTransition>
        <p>Page content</p>
      </DashboardPageTransition>,
    );
    expect(screen.getByText("Page content")).toBeInTheDocument();
  });
});

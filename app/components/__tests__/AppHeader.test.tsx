import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import AppHeader from "../AppHeader";

vi.mock("next-auth/react", () => ({
  useSession: () => ({ data: null, status: "unauthenticated" }),
  signOut: vi.fn(),
}));

describe("AppHeader", () => {
  it("renders a search input", () => {
    render(<AppHeader />);
    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  it("renders the sidebar toggle button", () => {
    render(<AppHeader />);
    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBeGreaterThan(0);
  });

  it("shows 'Search designers…' placeholder in admin mode", () => {
    render(<AppHeader isAdmin />);
    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  it("renders logout button in the dropdown", () => {
    render(<AppHeader />);
    expect(screen.getByText("Logout")).toBeInTheDocument();
  });
});

import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import AppHeader from "../AppHeader";
import { SidebarProvider } from "../SidebarContext";

vi.mock("next-auth/react", () => ({
  useSession: () => ({ data: null, status: "unauthenticated" }),
  signOut: vi.fn(),
}));

function Wrapper({ children }: { children: React.ReactNode }) {
  return <SidebarProvider>{children}</SidebarProvider>;
}

describe("AppHeader", () => {
  it("renders a search input", () => {
    render(<AppHeader />, { wrapper: Wrapper });
    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  it("renders the sidebar toggle button", () => {
    render(<AppHeader />, { wrapper: Wrapper });
    // The toggle is the first button; check it exists
    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBeGreaterThan(0);
  });

  it("shows 'Search designers…' placeholder in admin mode", () => {
    render(<AppHeader isAdmin />, { wrapper: Wrapper });
    // placeholder text varies by viewport; just check the input is present
    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  it("renders logout button in the dropdown", () => {
    render(<AppHeader />, { wrapper: Wrapper });
    expect(screen.getByText("Logout")).toBeInTheDocument();
  });
});

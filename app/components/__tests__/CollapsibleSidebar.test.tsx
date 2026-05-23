import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import CollapsibleSidebar from "../CollapsibleSidebar";

vi.mock("next-auth/react", () => ({
  useSession: () => ({
    data: { user: { id: "u1", name: "Alex", email: "alex@example.com" } },
    status: "authenticated",
  }),
  signOut: vi.fn(),
}));

describe("CollapsibleSidebar", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders nav items and children", () => {
    render(
      <CollapsibleSidebar>
        <main>Dashboard content</main>
      </CollapsibleSidebar>
    );
    expect(screen.getByText("Links")).toBeInTheDocument();
    expect(screen.getByText("Branding")).toBeInTheDocument();
    expect(screen.getByText("Analytics")).toBeInTheDocument();
    expect(screen.getByText("Dashboard content")).toBeInTheDocument();
    // link count comes from useLinksStore mock which returns links: []
    expect(screen.getByText("0")).toBeInTheDocument();
  });
});

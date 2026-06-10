import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import CollapsibleSidebar from "../CollapsibleSidebar";

vi.mock("next-auth/react", () => ({
  useSession: () => ({
    data: { user: { id: "u1", name: "Alex", email: "alex@example.com" } },
    status: "authenticated",
    update: vi.fn(),
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
    // Each label appears in both the sidebar and the mobile bottom nav
    expect(screen.getAllByText("Links").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Branding").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Analytics").length).toBeGreaterThan(0);
    expect(screen.getByText("Dashboard content")).toBeInTheDocument();
    // link count comes from useLinksStore mock which returns links: []
    expect(screen.getByText("0")).toBeInTheDocument();
  });
});

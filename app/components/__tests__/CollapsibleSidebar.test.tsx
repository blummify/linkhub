import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import CollapsibleSidebar from "../CollapsibleSidebar";
import { SidebarProvider } from "../SidebarContext";

vi.mock("next-auth/react", () => ({
  useSession: () => ({
    data: { user: { id: "u1", name: "Alex", email: "alex@example.com" } },
    status: "authenticated",
  }),
  signOut: vi.fn(),
}));

vi.mock("@/app/actions/links", () => ({
  getLinksCount: vi.fn().mockResolvedValue({ count: 5 }),
}));

describe("CollapsibleSidebar", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders nav items and children", async () => {
    render(
      <SidebarProvider>
        <CollapsibleSidebar>
          <main>Dashboard content</main>
        </CollapsibleSidebar>
      </SidebarProvider>
    );
    expect(screen.getByText("Links")).toBeInTheDocument();
    expect(screen.getByText("Branding")).toBeInTheDocument();
    expect(screen.getByText("Analytics")).toBeInTheDocument();
    expect(screen.getByText("Dashboard content")).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText("5")).toBeInTheDocument();
    });
  });
});

import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import HelpClient from "../HelpClient";
import { SidebarProvider } from "@/app/components/SidebarContext";

vi.mock("next-auth/react", () => ({
  useSession: () => ({
    data: { user: { id: "u1", name: "Alex", email: "alex@example.com" } },
    status: "authenticated",
  }),
  signOut: vi.fn(),
}));

vi.mock("@/app/actions/links", () => ({
  getLinksCount: vi.fn().mockResolvedValue({ count: 3 }),
}));

describe("HelpClient", () => {
  it("renders help center heading and FAQ", () => {
    render(
      <SidebarProvider>
        <HelpClient />
      </SidebarProvider>
    );
    expect(screen.getByRole("heading", { name: /how can we help/i })).toBeInTheDocument();
    expect(screen.getByText("Contact support")).toBeInTheDocument();
    expect(screen.getByText(/How do I publish a link/i)).toBeInTheDocument();
  });
});

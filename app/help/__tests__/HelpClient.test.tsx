import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import HelpClient from "../HelpClient";

vi.mock("next-auth/react", () => ({
  useSession: () => ({
    data: { user: { id: "u1", name: "Alex", email: "alex@example.com" } },
    status: "authenticated",
    update: vi.fn(),
  }),
  signOut: vi.fn(),
}));

describe("HelpClient", () => {
  it("renders help center heading and FAQ", () => {
    render(<HelpClient />);
    expect(screen.getByRole("heading", { name: /how can we help/i })).toBeInTheDocument();
    expect(screen.getByText("Contact support")).toBeInTheDocument();
    expect(screen.getByText(/How do I publish a link/i)).toBeInTheDocument();
  });
});

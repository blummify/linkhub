import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { PublicNav } from "../PublicNav";

const { mockUseSession } = vi.hoisted(() => ({
  mockUseSession: vi.fn(() => ({ data: null })),
}));

vi.mock("next-auth/react", () => ({
  useSession: mockUseSession,
  signOut: vi.fn(),
}));

describe("PublicNav", () => {
  it("renders the Login and Sign Up links", () => {
    render(<PublicNav />);
    expect(screen.getByRole("link", { name: "Login" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Sign Up" })).toBeInTheDocument();
  });

  it("renders Features and Pricing nav links", () => {
    render(<PublicNav />);
    expect(screen.getByRole("link", { name: "Features" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Pricing" })).toBeInTheDocument();
  });

  it("applies active styling to Features when activePage='features'", () => {
    render(<PublicNav activePage="features" />);
    const featuresLink = screen.getByRole("link", { name: "Features" });
    expect(featuresLink.className).toContain("border-primary");
  });

  it("applies active styling to Pricing when activePage='pricing'", () => {
    render(<PublicNav activePage="pricing" />);
    const pricingLink = screen.getByRole("link", { name: "Pricing" });
    expect(pricingLink.className).toContain("border-primary");
  });

  it("renders the logo image", () => {
    render(<PublicNav />);
    expect(screen.getByAltText("LinkHub logo")).toBeInTheDocument();
  });

  it("shows profile avatar instead of auth buttons when authenticated", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockUseSession.mockReturnValueOnce({ data: { user: { name: "Joel", email: "joel@test.com", image: null } } } as any);
    render(<PublicNav />);
    expect(screen.queryByRole("link", { name: "Login" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Sign Up" })).not.toBeInTheDocument();
    // The dashboard link is present (next/link mock renders as <a>)
    const links = screen.getAllByRole("link");
    const dashLink = links.find((l) => l.getAttribute("href") === "/user-dashboard");
    expect(dashLink).toBeDefined();
  });
});

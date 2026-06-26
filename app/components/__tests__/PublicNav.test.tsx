import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { signOut } from "next-auth/react";
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

  it("renders the linkhub brand logo", () => {
    render(<PublicNav />);
    expect(screen.getByText("linkhub")).toBeInTheDocument();
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

describe("PublicNav authenticated avatar menu (mobile tap)", () => {
  const getTrigger = () =>
    screen
      .getAllByRole("button")
      .find((b) => b.getAttribute("aria-haspopup") === "menu")!;

  beforeEach(() => {
    mockUseSession.mockReturnValue({
      data: { user: { name: "Joel", email: "joel@test.com", image: null } },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);
  });

  afterEach(() => {
    vi.clearAllMocks();
    mockUseSession.mockReturnValue({ data: null });
  });

  it("opens the dropdown when the avatar button is tapped", () => {
    render(<PublicNav />);
    const trigger = getTrigger();
    expect(trigger).toHaveAttribute("aria-expanded", "false");

    fireEvent.click(trigger);

    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("menu").className).toContain("pointer-events-auto");
  });

  it("shows the user's name, email, Dashboard and Logout in the menu", () => {
    render(<PublicNav />);
    fireEvent.click(getTrigger());

    expect(screen.getByText("Joel")).toBeInTheDocument();
    expect(screen.getByText("joel@test.com")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Dashboard/ })).toHaveAttribute(
      "href",
      "/user-dashboard",
    );
    expect(screen.getByRole("menuitem", { name: /Logout/ })).toBeInTheDocument();
  });

  it("closes the dropdown when tapping outside", () => {
    render(<PublicNav />);
    const trigger = getTrigger();
    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");

    fireEvent.mouseDown(document.body);

    expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  it("calls signOut when Logout is tapped", () => {
    render(<PublicNav />);
    fireEvent.click(getTrigger());

    fireEvent.click(screen.getByRole("menuitem", { name: /Logout/ }));

    expect(signOut).toHaveBeenCalledWith({ callbackUrl: "/" });
  });
});

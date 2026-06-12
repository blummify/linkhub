import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MobileTopBar, MobileBottomNav } from "../MobileNav";

vi.mock("next-auth/react", () => ({
  useSession: () => ({
    data: { user: { name: "Joel Osei", email: "joel@example.com", emailVerified: new Date() } },
    status: "authenticated",
  }),
  signOut: vi.fn(),
}));

describe("MobileTopBar", () => {
  it("renders the linkhub brand wordmark", () => {
    render(<MobileTopBar />);
    expect(screen.getByText("linkhub")).toBeInTheDocument();
  });

  it("renders the notification bell button", () => {
    render(<MobileTopBar />);
    expect(screen.getByRole("button", { name: /notifications/i })).toBeInTheDocument();
  });

  it("renders extra slot content when provided", () => {
    render(<MobileTopBar extra={<button type="button">Preview</button>} />);
    expect(screen.getByRole("button", { name: /preview/i })).toBeInTheDocument();
  });

  it("does not render a profile avatar (Account tab covers profile)", () => {
    render(<MobileTopBar />);
    expect(screen.queryByRole("button", { name: /profile/i })).not.toBeInTheDocument();
  });
});

describe("MobileBottomNav", () => {
  it("renders all five navigation tabs", () => {
    render(<MobileBottomNav />);
    expect(screen.getByText("Links")).toBeInTheDocument();
    expect(screen.getByText("Analytics")).toBeInTheDocument();
    expect(screen.getByText("Branding")).toBeInTheDocument();
    expect(screen.getByText("Billing")).toBeInTheDocument();
    expect(screen.getByText("Account")).toBeInTheDocument();
  });

  it("renders each tab as a link with the correct href", () => {
    render(<MobileBottomNav />);
    expect(screen.getByText("Links").closest("a")).toHaveAttribute("href", "/user-dashboard");
    expect(screen.getByText("Analytics").closest("a")).toHaveAttribute("href", "/user-analytics");
    expect(screen.getByText("Branding").closest("a")).toHaveAttribute("href", "/branding");
    expect(screen.getByText("Billing").closest("a")).toHaveAttribute("href", "/billing");
    expect(screen.getByText("Account").closest("a")).toHaveAttribute("href", "/my-account");
  });
});

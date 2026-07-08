import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

vi.mock("next/navigation", () => ({
  usePathname: vi.fn(() => "/dashboard"),
}));

// Forward all props (the global mock drops aria-current) so the active state is testable.
vi.mock("next/link", () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  default: ({ href, children, ...rest }: any) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

import { usePathname } from "next/navigation";
import { AdminSidebar } from "../AdminSidebar";

const user = { name: "Ama Mensah", email: "ama@linkhub.app", role: "SUPER_ADMIN" };

describe("AdminSidebar", () => {
  beforeEach(() => {
    vi.mocked(usePathname).mockReturnValue("/dashboard");
  });

  it("renders every nav item and the moderation count", () => {
    render(<AdminSidebar user={user} />);
    for (const label of ["Overview", "Users", "Pages", "Revenue", "Plans", "Settings"]) {
      expect(screen.getByRole("link", { name: new RegExp(label) })).toBeInTheDocument();
    }
    expect(screen.getByRole("link", { name: /Moderation/ })).toHaveTextContent("7");
  });

  it("marks the active route with aria-current", () => {
    vi.mocked(usePathname).mockReturnValue("/users");
    render(<AdminSidebar user={user} />);
    expect(screen.getByRole("link", { name: "Users" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "Overview" })).not.toHaveAttribute("aria-current");
  });

  it("shows the signed-in user and role", () => {
    render(<AdminSidebar user={user} />);
    expect(screen.getByText("Ama Mensah")).toBeInTheDocument();
    expect(screen.getByText("Super admin")).toBeInTheDocument();
  });

  it("renders a back-to-app exit control", () => {
    render(<AdminSidebar user={user} />);
    expect(screen.getByRole("button", { name: /Back to app/ })).toBeInTheDocument();
  });

  it("calls onNavigate when a nav item is clicked", () => {
    const onNavigate = vi.fn();
    render(<AdminSidebar user={user} onNavigate={onNavigate} />);
    fireEvent.click(screen.getByRole("link", { name: "Overview" }));
    expect(onNavigate).toHaveBeenCalledTimes(1);
  });
});

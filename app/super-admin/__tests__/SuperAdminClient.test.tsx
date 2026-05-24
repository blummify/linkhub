import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import SuperAdminClient from "../SuperAdminClient";

vi.mock("@/app/components/CollapsibleSidebar", () => ({
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock("@/app/components/AppHeader", () => ({
  default: () => <header data-testid="app-header" />,
}));

vi.mock("@/app/ThemeToggle", () => ({
  ThemeToggle: () => null,
}));

describe("SuperAdminClient", () => {
  it("renders super admin dashboard heading", () => {
    render(<SuperAdminClient />);
    expect(screen.getByText("Super Admin Dashboard")).toBeInTheDocument();
    expect(screen.getByText(/SUPER ADMIN ACCESS/i)).toBeInTheDocument();
  });
});

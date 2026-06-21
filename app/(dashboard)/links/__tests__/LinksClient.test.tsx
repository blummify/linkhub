import { describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import LinksClient from "../LinksClient";
import { renderWithSidebarAndBranding } from "@/app/test-utils/renderWithProviders";

vi.mock("@/app/components/CollapsibleSidebar", () => ({
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock("@/app/components/AppHeader", () => ({
  default: () => <header data-testid="app-header" />,
}));

vi.mock("@/app/ThemeToggle", () => ({
  ThemeToggle: () => null,
}));

describe("LinksClient", () => {
  it("renders links page heading and mobile preview", () => {
    renderWithSidebarAndBranding(<LinksClient initialState={null} />);
    expect(screen.getByText("Your Links")).toBeInTheDocument();
    expect(screen.getByText(/Manage and organize/i)).toBeInTheDocument();
    expect(screen.getByText("Your Name")).toBeInTheDocument();
  });
});

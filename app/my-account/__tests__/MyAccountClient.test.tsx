import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import MyAccountClient from "../MyAccountClient";

vi.mock("@/app/components/CollapsibleSidebar", () => ({
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock("@/store/sidebarStore", () => ({
  useSidebarStore: () => false,
}));

describe("MyAccountClient", () => {
  it("renders without crashing", () => {
    render(<MyAccountClient />);
    expect(screen.getByRole("main")).toBeInTheDocument();
  });
});

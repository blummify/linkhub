import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import BillingClient from "../BillingClient";

vi.mock("@/app/components/CollapsibleSidebar", () => ({
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock("@/store/sidebarStore", () => ({
  useSidebarStore: () => false,
}));

describe("BillingClient", () => {
  it("renders without crashing", () => {
    render(<BillingClient />);
    expect(screen.getByRole("main")).toBeInTheDocument();
  });
});

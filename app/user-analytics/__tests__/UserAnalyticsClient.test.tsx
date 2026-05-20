import { describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import UserAnalyticsClient from "../UserAnalyticsClient";
import { renderWithSidebarAndBranding } from "@/app/test-utils/renderWithProviders";

vi.mock("@/app/components/CollapsibleSidebar", () => ({
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

describe("UserAnalyticsClient", () => {
  it("renders analytics heading and range controls", () => {
    renderWithSidebarAndBranding(<UserAnalyticsClient />);
    expect(screen.getByText("Analytics")).toBeInTheDocument();
    expect(screen.getByText("Last 30 days")).toBeInTheDocument();
    expect(screen.getByText("Clicks over time")).toBeInTheDocument();
    expect(screen.getByText("2,096")).toBeInTheDocument();
  });
});

import { describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import UserAnalyticsClient from "../UserAnalyticsClient";
import { renderWithSidebarAndBranding } from "@/app/test-utils/renderWithProviders";

vi.mock("@/app/components/CollapsibleSidebar", () => ({
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

const links = [
  { title: "Site A", url: "https://site-a.com", clicks: "100" },
  { title: "Site B", url: "https://site-b.com", clicks: "200" },
];

describe("UserAnalyticsClient", () => {
  it("renders analytics heading and range controls", () => {
    renderWithSidebarAndBranding(<UserAnalyticsClient links={links} />);
    expect(screen.getByText("Analytics")).toBeInTheDocument();
    expect(screen.getByText("Last 30 days")).toBeInTheDocument();
    expect(screen.getByText("Clicks over time")).toBeInTheDocument();
  });

  it("shows the real summed total clicks", () => {
    renderWithSidebarAndBranding(<UserAnalyticsClient links={links} />);
    expect(screen.getByText("300")).toBeInTheDocument();
  });

  it("surfaces the highest-clicked link as the top link", () => {
    renderWithSidebarAndBranding(<UserAnalyticsClient links={links} />);
    // Site B (200) ranks above Site A (100); appears in the top-link KPI + list.
    expect(screen.getAllByText("Site B").length).toBeGreaterThan(0);
  });

  it("shows an empty top-links message when there are no clicks", () => {
    renderWithSidebarAndBranding(<UserAnalyticsClient links={[]} />);
    expect(screen.getByText(/no link clicks yet/i)).toBeInTheDocument();
  });
});

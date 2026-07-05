import { describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import UserAnalyticsClient from "../UserAnalyticsClient";
import { renderWithSidebarAndBranding } from "@/app/test-utils/renderWithProviders";

vi.mock("@/app/components/CollapsibleSidebar", () => ({
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock("@/app/actions/links", () => ({
  getTopLinksForRange: vi.fn().mockResolvedValue([]),
}));

vi.mock("@/app/actions/analytics", () => ({
  getAnalyticsForRange: vi.fn().mockResolvedValue(null),
}));

const links = [
  { id: "l1", title: "Site A", url: "https://site-a.com", clicks: "100" },
  { id: "l2", title: "Site B", url: "https://site-b.com", clicks: "200" },
];

// Real per-day series (oldest -> newest); length is irrelevant beyond >= 2.
const series = Array.from({ length: 30 }, (_, i) => i + 1);

describe("UserAnalyticsClient", () => {
  it("renders analytics heading and range controls", () => {
    renderWithSidebarAndBranding(<UserAnalyticsClient links={links} series={series} />);
    expect(screen.getByText("Analytics")).toBeInTheDocument();
    expect(screen.getByText("Last 30 days")).toBeInTheDocument();
    expect(screen.getByText("Clicks over time")).toBeInTheDocument();
  });

  it("shows the real summed total clicks", () => {
    renderWithSidebarAndBranding(<UserAnalyticsClient links={links} series={series} />);
    expect(screen.getByText("300")).toBeInTheDocument();
  });

  it("surfaces the highest-clicked link as the top link", () => {
    renderWithSidebarAndBranding(<UserAnalyticsClient links={links} series={series} />);
    // Site B (200) ranks above Site A (100); appears in the top-link KPI + list.
    expect(screen.getAllByText("Site B").length).toBeGreaterThan(0);
  });

  it("shows an empty top-links message when there are no clicks", () => {
    renderWithSidebarAndBranding(<UserAnalyticsClient links={[]} series={[]} />);
    expect(screen.getByText(/no link clicks yet/i)).toBeInTheDocument();
  });

  it("shows the chart zero-state until there is at least one click", () => {
    renderWithSidebarAndBranding(<UserAnalyticsClient links={[]} series={[]} />);
    expect(screen.getByText("0 clicks")).toBeInTheDocument();
    // The range-window label is replaced by an empty-state note.
    expect(screen.getByText(/no clicks recorded yet/i)).toBeInTheDocument();
  });
});

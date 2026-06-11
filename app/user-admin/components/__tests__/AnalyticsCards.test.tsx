import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { AnalyticsCards } from "../AnalyticsCards";

vi.mock("react-country-flag", () => ({
  default: () => <span data-testid="country-flag" />,
}));

describe("AnalyticsCards", () => {
  it("renders default stat cards", () => {
    render(<AnalyticsCards />);
    // label + value appear in both mobile strip and desktop grid
    expect(screen.getAllByText("TOTAL CLICKS").length).toBeGreaterThan(0);
    expect(screen.getAllByText("2,096").length).toBeGreaterThan(0);
    expect(screen.getByText("TOP REGION")).toBeInTheDocument();
    expect(screen.getByText("Accra")).toBeInTheDocument();
  });

  it("renders custom card data", () => {
    render(
      <AnalyticsCards
        cards={[{ label: "CUSTOM", value: "99", change: "+1%", changeType: "green" }]}
      />
    );
    // label + value appear in both mobile strip and desktop grid
    expect(screen.getAllByText("CUSTOM").length).toBeGreaterThan(0);
    expect(screen.getAllByText("99").length).toBeGreaterThan(0);
  });
});

import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { AnalyticsCards } from "../AnalyticsCards";

vi.mock("react-country-flag", () => ({
  default: () => <span data-testid="country-flag" />,
}));

describe("AnalyticsCards", () => {
  it("renders default stat cards", () => {
    render(<AnalyticsCards />);
    expect(screen.getByText("TOTAL CLICKS")).toBeInTheDocument();
    expect(screen.getByText("2,096")).toBeInTheDocument();
    expect(screen.getByText("TOP REGION")).toBeInTheDocument();
    expect(screen.getByText("Accra")).toBeInTheDocument();
  });

  it("renders custom card data", () => {
    render(
      <AnalyticsCards
        cards={[{ label: "CUSTOM", value: "99", change: "+1%", changeType: "green" }]}
      />
    );
    expect(screen.getByText("CUSTOM")).toBeInTheDocument();
    expect(screen.getByText("99")).toBeInTheDocument();
  });
});

import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { DistributionBars } from "../DistributionBars";

describe("DistributionBars", () => {
  it("renders a row per slice with label, percentage, and fill width", () => {
    const { container } = render(
      <DistributionBars
        slices={[
          { label: "Free", pct: 71, tone: "neutral" },
          { label: "Pro", pct: 26, tone: "primary" },
        ]}
      />
    );
    expect(screen.getByText("Free")).toBeInTheDocument();
    expect(screen.getByText("71%")).toBeInTheDocument();
    expect(screen.getByText("Pro")).toBeInTheDocument();

    const fill = container.querySelector('[style*="width: 71%"]');
    expect(fill).not.toBeNull();
  });
});

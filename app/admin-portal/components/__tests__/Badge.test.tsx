import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Badge, PlanBadge, SeverityBadge, StatusBadge } from "../Badge";

describe("Badge", () => {
  it("renders children with the tone classes", () => {
    render(<Badge tone="green">Active</Badge>);
    expect(screen.getByText("Active")).toHaveClass("text-green-500");
  });

  it("defaults to the neutral tone", () => {
    render(<Badge>Free</Badge>);
    expect(screen.getByText("Free")).toHaveClass("text-ink-500");
  });

  it("maps plan, status, and severity to their labels", () => {
    const { rerender } = render(<PlanBadge plan="business" />);
    expect(screen.getByText("Business")).toBeInTheDocument();

    rerender(<StatusBadge status="suspended" />);
    expect(screen.getByText("Suspended")).toBeInTheDocument();

    rerender(<SeverityBadge severity="high" />);
    expect(screen.getByText("High")).toBeInTheDocument();
  });
});

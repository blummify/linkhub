import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { DashboardSectionCard } from "../DashboardSectionCard";

describe("DashboardSectionCard", () => {
  it("renders children", () => {
    render(<DashboardSectionCard><span>card content</span></DashboardSectionCard>);
    expect(screen.getByText("card content")).toBeInTheDocument();
  });

  it("applies extra className to the card wrapper", () => {
    const { container } = render(
      <DashboardSectionCard className="extra-class">content</DashboardSectionCard>
    );
    expect(container.firstChild).toHaveClass("extra-class");
  });

  it("renders without a className prop", () => {
    const { container } = render(<DashboardSectionCard>content</DashboardSectionCard>);
    expect(container.firstChild).toBeInTheDocument();
  });
});

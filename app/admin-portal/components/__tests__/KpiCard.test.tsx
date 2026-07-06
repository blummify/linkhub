import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { KpiCard } from "../KpiCard";
import type { Kpi } from "../../services/types";

const baseKpi: Kpi = {
  id: "total-users",
  label: "Total users",
  value: "48,210",
  delta: { direction: "up", text: "+4.2%" },
  sparkline: [20, 17, 18, 12, 13, 8, 6, 3],
};

describe("KpiCard", () => {
  it("renders the label, value, and delta text", () => {
    render(<KpiCard kpi={baseKpi} />);
    expect(screen.getByText("Total users")).toBeInTheDocument();
    expect(screen.getByText("48,210")).toBeInTheDocument();
    expect(screen.getByText("+4.2%")).toHaveClass("text-green-500");
  });

  it("colours a warning delta with the amber tone", () => {
    render(
      <KpiCard
        kpi={{ id: "open", label: "Open reports", value: "7", delta: { direction: "flat", text: "needs review", tone: "warning" } }}
      />
    );
    expect(screen.getByText("needs review")).toHaveClass("text-amber-500");
  });

  it("omits the delta block when no delta is provided", () => {
    render(<KpiCard kpi={{ id: "x", label: "Pages", value: "41,032" }} />);
    expect(screen.getByText("41,032")).toBeInTheDocument();
    expect(screen.queryByText("+4.2%")).not.toBeInTheDocument();
  });
});

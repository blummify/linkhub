import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { PlanCard } from "../PlanCard";
import type { PlanAdminRow } from "../../services/types";

const basePlan: PlanAdminRow = {
  plan: "pro",
  tier: "Creator",
  name: "Pro",
  price: "€9/mo",
  highlighted: true,
  limits: {
    links: "Unlimited links",
    views: "50,000 views/mo",
    customDomains: "3 custom domains",
    storage: "10 GB storage",
  },
  features: ["Remove badge", "Custom themes"],
  editor: {
    price: "9.00",
    interval: "Monthly",
    linkLimit: "Unlimited",
    monthlyViews: "50000",
    customDomains: "3",
    storage: "10",
    featureToggles: {
      removeBadge: true,
      customThemeEditor: true,
    },
  },
};

describe("PlanCard", () => {
  it("renders the plan summary and edit action", () => {
    const onEdit = vi.fn();
    render(<PlanCard plan={basePlan} onEdit={onEdit} />);

    expect(screen.getByRole("heading", { name: "Pro" })).toBeInTheDocument();
    expect(screen.getByText("€9/mo")).toBeInTheDocument();
    expect(screen.getByText("Unlimited links")).toBeInTheDocument();
    expect(screen.getByText("Custom themes")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Edit plan" })).toBeInTheDocument();
  });
});

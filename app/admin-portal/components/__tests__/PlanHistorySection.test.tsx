import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { PlanHistorySection } from "../PlanHistorySection";

vi.mock("../Card", () => ({
  Card: ({ title, children }: { title: string; children: React.ReactNode }) => (
    <section>
      <h2>{title}</h2>
      {children}
    </section>
  ),
}));

vi.mock("../Badge", () => ({
  Badge: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
}));

vi.mock("../../plans/planUtils", () => ({
  visiblePlanName: (plan: string) => (plan === "all" ? "All plans" : plan === "pro" ? "Pro" : "Free"),
}));

describe("PlanHistorySection", () => {
  it("renders version history and audit trail entries", () => {
    render(
      <PlanHistorySection
        versions={[
          {
            id: "plan-ver-2",
            plan: "pro",
            version: "v2",
            summary: "Pro plan updated from the editor.",
            changedBy: "Ama Mensah",
            changedAt: "Jul 10, 2026",
            fields: ["price", "limits"],
          },
        ]}
        auditLog={[
          {
            id: "plan-audit-2",
            action: "Plan updated",
            plan: "pro",
            actor: "Ama Mensah",
            details: "Changed price and limits.",
            timestamp: "Jul 10, 2026",
          },
        ]}
      />
    );

    expect(screen.getByText("Version history")).toBeInTheDocument();
    expect(screen.getByText("Audit trail")).toBeInTheDocument();
    expect(screen.getByText("Pro · v2")).toBeInTheDocument();
    expect(screen.getByText("Plan updated")).toBeInTheDocument();
    expect(screen.getByText("Actor: Ama Mensah")).toBeInTheDocument();
  });
});

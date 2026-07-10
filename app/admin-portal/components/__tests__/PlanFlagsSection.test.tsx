import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { PlanFlagsSection } from "../PlanFlagsSection";

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

describe("PlanFlagsSection", () => {
  it("renders flags and toggles rollout and plan controls", () => {
    const onToggle = vi.fn();
    render(
      <PlanFlagsSection
        flags={[
          {
            id: "custom-theme-editor",
            label: "Custom theme editor",
            description: "Pro & Business only",
            enabled: true,
            scope: "plan",
          },
          {
            id: "ai-bio-suggestions",
            label: "AI bio suggestions",
            description: "Rolling out to 20% of users",
            enabled: false,
            scope: "rollout",
          },
        ]}
        onToggle={onToggle}
      />
    );

    expect(screen.getByText("Feature flags")).toBeInTheDocument();
    expect(screen.getByText("Plan")).toBeInTheDocument();
    expect(screen.getByText("Rollout")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("switch", { name: "Custom theme editor" }));
    fireEvent.click(screen.getByRole("switch", { name: "AI bio suggestions" }));

    expect(onToggle).toHaveBeenCalledWith("custom-theme-editor", false);
    expect(onToggle).toHaveBeenCalledWith("ai-bio-suggestions", true);
  });
});

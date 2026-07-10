import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { PlansClient } from "../PlansClient";

const { usePlans } = vi.hoisted(() => ({ usePlans: vi.fn() }));

vi.mock("../../../hooks/usePlans", () => ({
  usePlans,
}));

vi.mock("../../../components/AdminPageHeader", () => ({
  AdminPageHeader: ({ title }: { title: string }) => <header>{title}</header>,
}));

vi.mock("../../../components/ConfirmDialog", () => ({
  ConfirmDialog: ({
    open,
    title,
    description,
    onConfirm,
    onCancel,
  }: {
    open: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
    onCancel: () => void;
  }) =>
    open ? (
      <div role="alertdialog" aria-label={title}>
        <p>{description}</p>
        <button type="button" onClick={onConfirm}>
          Apply changes
        </button>
        <button type="button" onClick={onCancel}>
          Cancel
        </button>
      </div>
    ) : null,
}));

vi.mock("../../../components/PlanCard", () => ({
  PlanCard: ({ plan, onEdit }: { plan: { name: string; plan: string }; onEdit: (plan: string) => void }) => (
    <div>
      <span>{plan.name}</span>
      <button type="button" onClick={() => onEdit(plan.plan)}>
        Edit plan
      </button>
    </div>
  ),
}));

vi.mock("../../../components/PlanEditorDialog", () => ({
  PlanEditorDialog: ({
    plan,
    onSave,
  }: {
    plan: { name: string; plan: string } | null;
    onSave: () => void;
  }) =>
    plan ? (
      <div>
        <div>{plan.name}</div>
        <button type="button" onClick={onSave}>
          Save changes
        </button>
      </div>
    ) : null,
}));

vi.mock("../../../components/PlanFlagsSection", () => ({
  PlanFlagsSection: ({
    flags,
    onToggle,
  }: {
    flags: { id: string; label: string; enabled: boolean }[];
    onToggle: (id: string, enabled: boolean) => void;
  }) => (
    <div>
      <h2>Feature flags</h2>
      {flags.map((flag) => (
        <button key={flag.id} type="button" onClick={() => onToggle(flag.id, !flag.enabled)}>
          {flag.label}
        </button>
      ))}
    </div>
  ),
}));

vi.mock("../../../components/PlanHistorySection", () => ({
  PlanHistorySection: () => (
    <div>
      <h2>Version history</h2>
      <h2>Audit trail</h2>
    </div>
  ),
}));

describe("PlansClient", () => {
  it("renders plans, opens the editor, and confirms changes", async () => {
    usePlans.mockReturnValue({
      data: {
        plans: [
          {
            plan: "pro",
            tier: "Creator",
            name: "Pro",
            price: "€9/mo",
            limits: {
              links: "Unlimited links",
              views: "50,000 views/mo",
              customDomains: "3 custom domains",
              storage: "10 GB storage",
            },
            features: ["Remove badge", "Custom themes"],
            highlighted: true,
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
          },
        ],
        flags: [
          {
            id: "custom-theme-editor",
            label: "Custom theme editor",
            description: "Pro & Business only",
            enabled: true,
            scope: "plan",
          },
        ],
        versions: [
          {
            id: "plan-ver-1",
            plan: "all",
            version: "v1",
            summary: "Loaded.",
            changedBy: "Ama Mensah",
            changedAt: "Today",
            fields: ["price"],
          },
        ],
        auditLog: [
          {
            id: "plan-audit-1",
            action: "Baseline loaded",
            plan: "all",
            actor: "Ama Mensah",
            details: "Seeded values.",
            timestamp: "Today",
          },
        ],
      },
      loading: false,
      error: null,
    });

    render(<PlansClient />);

    await screen.findByRole("button", { name: "Edit plan" });
    fireEvent.click(screen.getByRole("button", { name: "Edit plan" }));
    fireEvent.click(screen.getByRole("button", { name: "Save changes" }));
    expect(screen.getByRole("alertdialog", { name: "Apply plan changes?" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Apply changes" }));

    expect(screen.getByText("Plans")).toBeInTheDocument();
    expect(screen.getByText("Pro")).toBeInTheDocument();
    expect(screen.getByText("Feature flags")).toBeInTheDocument();
    expect(screen.getByText("Version history")).toBeInTheDocument();
  });
});

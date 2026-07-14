import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { PlanEditorDialog } from "../PlanEditorDialog";

vi.mock("../Button", () => ({
  Button: ({ children, onClick, variant }: { children: React.ReactNode; onClick?: () => void; variant?: string }) => (
    <button type="button" data-variant={variant} onClick={onClick}>
      {children}
    </button>
  ),
}));

vi.mock("../PlanToggleSwitch", () => ({
  PlanToggleSwitch: ({
    checked,
    label,
    onChange,
  }: {
    checked: boolean;
    label: string;
    onChange: (checked: boolean) => void;
  }) => (
    <button type="button" role="switch" aria-checked={checked} aria-label={label} onClick={() => onChange(!checked)}>
      {label}
    </button>
  ),
}));

describe("PlanEditorDialog", () => {
  const plan = {
    plan: "pro" as const,
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
    editor: {
      price: "9.00",
      interval: "Monthly" as const,
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

  it("renders editable fields and propagates updates", () => {
    const onChange = vi.fn();
    const onClose = vi.fn();
    const onSave = vi.fn();

    render(
      <PlanEditorDialog
        plan={plan}
        draft={plan.editor}
        onChange={onChange}
        onClose={onClose}
        onSave={onSave}
      />
    );

    expect(screen.getByText("Edit plan")).toBeInTheDocument();
    expect(screen.getByDisplayValue("9.00")).toBeInTheDocument();
    expect(screen.getByRole("switch", { name: "customThemeEditor" })).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Price"), { target: { value: "12.00" } });
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ price: "12.00" }));

    fireEvent.click(screen.getByRole("switch", { name: "customThemeEditor" }));
    expect(onChange).toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "Save changes" }));
    expect(onSave).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole("button", { name: "Close" }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});

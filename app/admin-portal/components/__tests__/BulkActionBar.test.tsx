import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { BulkActionBar, type BulkActionBarProps } from "../BulkActionBar";

function renderBar(overrides: Partial<BulkActionBarProps> = {}): BulkActionBarProps {
  const props: BulkActionBarProps = {
    count: 3,
    onChangePlan: vi.fn(),
    onExport: vi.fn(),
    onSuspend: vi.fn(),
    onDelete: vi.fn(),
    onClear: vi.fn(),
    ...overrides,
  };
  render(<BulkActionBar {...props} />);
  return props;
}

describe("BulkActionBar", () => {
  it("shows the live selection count", () => {
    renderBar({ count: 12 });
    expect(screen.getByRole("toolbar", { name: "Bulk actions" })).toHaveTextContent("12 selected");
  });

  it("fires the action callbacks", () => {
    const props = renderBar();
    fireEvent.click(screen.getByRole("button", { name: "Export" }));
    fireEvent.click(screen.getByRole("button", { name: "Suspend" }));
    fireEvent.click(screen.getByRole("button", { name: "Delete" }));
    fireEvent.click(screen.getByRole("button", { name: "Clear" }));
    expect(props.onExport).toHaveBeenCalledTimes(1);
    expect(props.onSuspend).toHaveBeenCalledTimes(1);
    expect(props.onDelete).toHaveBeenCalledTimes(1);
    expect(props.onClear).toHaveBeenCalledTimes(1);
  });

  it("requests a plan change from the select", () => {
    const props = renderBar();
    fireEvent.change(screen.getByRole("combobox", { name: "Change plan" }), {
      target: { value: "business" },
    });
    expect(props.onChangePlan).toHaveBeenCalledWith("business");
  });
});

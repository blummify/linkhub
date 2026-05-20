import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { BrandingConfirmModal } from "../BrandingConfirmModal";

describe("BrandingConfirmModal", () => {
  it("renders nothing when closed", () => {
    const { container } = render(
      <BrandingConfirmModal
        open={false}
        onClose={vi.fn()}
        title="Pro theme"
        body="Upgrade required"
      />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("renders title and body when open", () => {
    render(
      <BrandingConfirmModal
        open
        onClose={vi.fn()}
        title="Pro theme"
        body="Upgrade to unlock Forest"
        confirmText="Upgrade"
        confirmStyle="primary"
      />
    );
    expect(screen.getByText("Pro theme")).toBeInTheDocument();
    expect(screen.getByText("Upgrade to unlock Forest")).toBeInTheDocument();
    expect(screen.getByText("Upgrade")).toBeInTheDocument();
  });

  it("calls onConfirm and onClose", () => {
    const onClose = vi.fn();
    const onConfirm = vi.fn();
    render(
      <BrandingConfirmModal
        open
        onClose={onClose}
        onConfirm={onConfirm}
        title="Delete"
        body="Are you sure?"
      />
    );
    fireEvent.click(screen.getByText("Confirm"));
    expect(onConfirm).toHaveBeenCalledOnce();
    expect(onClose).toHaveBeenCalledOnce();
  });
});

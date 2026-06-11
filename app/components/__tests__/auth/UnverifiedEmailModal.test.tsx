import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { UnverifiedEmailModal } from "../../auth/UnverifiedEmailModal";

describe("UnverifiedEmailModal", () => {
  it("renders the heading", () => {
    render(
      <UnverifiedEmailModal email="user@example.com" isResending={false} onClose={vi.fn()} onVerify={vi.fn()} />
    );
    expect(screen.getByText("Verify your email")).toBeInTheDocument();
  });

  it("displays the provided email address", () => {
    render(
      <UnverifiedEmailModal email="user@example.com" isResending={false} onClose={vi.fn()} onVerify={vi.fn()} />
    );
    expect(screen.getByText("user@example.com")).toBeInTheDocument();
  });

  it("shows 'Verify' button label when not resending", () => {
    render(
      <UnverifiedEmailModal email="x@x.com" isResending={false} onClose={vi.fn()} onVerify={vi.fn()} />
    );
    expect(screen.getByRole("button", { name: "Verify" })).toBeInTheDocument();
  });

  it("shows 'Sending…' and disables button when isResending is true", () => {
    render(
      <UnverifiedEmailModal email="x@x.com" isResending={true} onClose={vi.fn()} onVerify={vi.fn()} />
    );
    const verifyBtn = screen.getByRole("button", { name: "Sending…" });
    expect(verifyBtn).toBeDisabled();
  });

  it("calls onVerify when Verify button is clicked", () => {
    const onVerify = vi.fn();
    render(
      <UnverifiedEmailModal email="x@x.com" isResending={false} onClose={vi.fn()} onVerify={onVerify} />
    );
    fireEvent.click(screen.getByRole("button", { name: "Verify" }));
    expect(onVerify).toHaveBeenCalledOnce();
  });

  it("calls onClose when Cancel is clicked", () => {
    const onClose = vi.fn();
    render(
      <UnverifiedEmailModal email="x@x.com" isResending={false} onClose={onClose} onVerify={vi.fn()} />
    );
    fireEvent.click(screen.getByText("Cancel"));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("calls onClose when the X close button is clicked", () => {
    const onClose = vi.fn();
    render(
      <UnverifiedEmailModal email="x@x.com" isResending={false} onClose={onClose} onVerify={vi.fn()} />
    );
    fireEvent.click(screen.getByLabelText("Close"));
    fireEvent.animationEnd(screen.getByTestId("modal-panel"), { animationName: "lhModalOut", bubbles: true });
    expect(onClose).toHaveBeenCalledOnce();
  });
});

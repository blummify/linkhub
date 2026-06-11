import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { LoginModal } from "../../auth/LoginModal";

describe("LoginModal", () => {
  it("renders children via portal", () => {
    render(
      <LoginModal onClose={vi.fn()}>
        <p>Modal body text</p>
      </LoginModal>
    );
    expect(screen.getByText("Modal body text")).toBeInTheDocument();
  });

  it("renders a close button", () => {
    render(<LoginModal onClose={vi.fn()}><span /></LoginModal>);
    expect(screen.getByLabelText("Close")).toBeInTheDocument();
  });

  it("calls onClose when the close button is clicked", () => {
    const onClose = vi.fn();
    render(<LoginModal onClose={onClose}><span /></LoginModal>);
    fireEvent.click(screen.getByLabelText("Close"));
    fireEvent.animationEnd(screen.getByTestId("modal-panel"), { animationName: "lhModalOut", bubbles: true });
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("calls onClose when the backdrop is clicked", () => {
    const onClose = vi.fn();
    render(<LoginModal onClose={onClose}><span /></LoginModal>);
    const backdrop = document.querySelector(".fixed.inset-0") as HTMLElement;
    fireEvent.click(backdrop);
    fireEvent.animationEnd(screen.getByTestId("modal-panel"), { animationName: "lhModalOut", bubbles: true });
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("does not close when clicking inside the card", () => {
    const onClose = vi.fn();
    render(
      <LoginModal onClose={onClose}>
        <button>Inner button</button>
      </LoginModal>
    );
    fireEvent.click(screen.getByRole("button", { name: "Inner button" }));
    expect(onClose).not.toHaveBeenCalled();
  });
});

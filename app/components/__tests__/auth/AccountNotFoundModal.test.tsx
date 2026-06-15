import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { AccountNotFoundModal } from "../../auth/AccountNotFoundModal";

describe("AccountNotFoundModal", () => {
  it("renders the heading", () => {
    render(<AccountNotFoundModal email="test@example.com" onClose={vi.fn()} />);
    expect(screen.getByText("Account not found")).toBeInTheDocument();
  });

  it("displays the provided email address", () => {
    render(<AccountNotFoundModal email="test@example.com" onClose={vi.fn()} />);
    expect(screen.getByText("test@example.com")).toBeInTheDocument();
  });

  it("renders a Sign up link pointing to /signup with prefilled email", () => {
    render(<AccountNotFoundModal email="user@test.com" onClose={vi.fn()} />);
    const signupLink = screen.getByRole("link", { name: "Sign up" });
    expect(signupLink).toHaveAttribute("href", expect.stringContaining("/signup"));
    expect(signupLink).toHaveAttribute("href", expect.stringContaining("user%40test.com"));
  });

  it("calls onClose when 'Try another email' is clicked", () => {
    const onClose = vi.fn();
    render(<AccountNotFoundModal email="x@x.com" onClose={onClose} />);
    fireEvent.click(screen.getByText("Try another email"));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("calls onClose when the close button is clicked", () => {
    const onClose = vi.fn();
    render(<AccountNotFoundModal email="x@x.com" onClose={onClose} />);
    act(() => { fireEvent.click(screen.getByLabelText("Close")); });
    fireEvent.animationEnd(screen.getByTestId("modal-panel"));
    expect(onClose).toHaveBeenCalledOnce();
  });
});

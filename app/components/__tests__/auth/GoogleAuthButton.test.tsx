import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { GoogleAuthButton } from "../../auth/GoogleAuthButton";

describe("GoogleAuthButton", () => {
  it("renders the provided label", () => {
    render(<GoogleAuthButton onClick={vi.fn()} label="Sign in with Google" />);
    expect(screen.getByText("Sign in with Google")).toBeInTheDocument();
  });

  it("renders a Google SVG logo", () => {
    const { container } = render(<GoogleAuthButton onClick={vi.fn()} label="Sign in" />);
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("calls onClick when the button is clicked", () => {
    const onClick = vi.fn();
    render(<GoogleAuthButton onClick={onClick} label="Sign in with Google" />);
    fireEvent.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("renders a button of type button (not submit)", () => {
    render(<GoogleAuthButton onClick={vi.fn()} label="Sign up with Google" />);
    expect(screen.getByRole("button")).toHaveAttribute("type", "button");
  });
});

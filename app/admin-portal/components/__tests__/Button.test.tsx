import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Button } from "../Button";

describe("Button", () => {
  it("renders children and defaults to type=button", () => {
    render(<Button>Save</Button>);
    const button = screen.getByRole("button", { name: "Save" });
    expect(button).toHaveAttribute("type", "button");
  });

  it("applies variant classes", () => {
    render(<Button variant="danger">Delete</Button>);
    expect(screen.getByRole("button", { name: "Delete" })).toHaveClass("text-rose-500");
  });

  it("fires onClick", () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Go</Button>);
    fireEvent.click(screen.getByRole("button", { name: "Go" }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("does not fire onClick when disabled", () => {
    const onClick = vi.fn();
    render(
      <Button onClick={onClick} disabled>
        Go
      </Button>
    );
    fireEvent.click(screen.getByRole("button", { name: "Go" }));
    expect(onClick).not.toHaveBeenCalled();
  });
});

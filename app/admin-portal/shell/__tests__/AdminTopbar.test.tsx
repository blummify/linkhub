import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { AdminTopbar } from "../AdminTopbar";

describe("AdminTopbar", () => {
  it("renders the environment badge and user avatar", () => {
    render(<AdminTopbar userName="Ama Mensah" onToggleNav={vi.fn()} />);
    // Default environment (no env var set in tests) resolves to Production.
    expect(screen.getByText("Production")).toBeInTheDocument();
    expect(screen.getByText("A")).toBeInTheDocument();
  });

  it("calls onToggleNav when the toggle is pressed", () => {
    const onToggleNav = vi.fn();
    render(<AdminTopbar userName="Ama Mensah" onToggleNav={onToggleNav} />);
    fireEvent.click(screen.getByRole("button", { name: "Toggle navigation" }));
    expect(onToggleNav).toHaveBeenCalledTimes(1);
  });
});

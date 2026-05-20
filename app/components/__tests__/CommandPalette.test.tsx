import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { CommandPalette } from "../CommandPalette";

describe("CommandPalette", () => {

  it("renders nothing when closed", () => {
    const { container } = render(<CommandPalette open={false} onClose={vi.fn()} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders search input when open", () => {
    render(<CommandPalette open onClose={vi.fn()} variant="links" />);
    expect(screen.getByPlaceholderText(/Search/i)).toBeInTheDocument();
  });

  it("filters navigation items by query", () => {
    render(<CommandPalette open onClose={vi.fn()} variant="links" />);
    const input = screen.getByPlaceholderText(/Search/i);
    fireEvent.change(input, { target: { value: "branding" } });
    expect(screen.getByText("Branding")).toBeInTheDocument();
    expect(screen.queryByText("Analytics")).not.toBeInTheDocument();
  });

  it("calls onAddLink for quick action on links variant", () => {
    const onAddLink = vi.fn();
    const onClose = vi.fn();
    render(
      <CommandPalette open onClose={onClose} variant="links" onAddLink={onAddLink} />
    );
    fireEvent.click(screen.getByText("Add new link"));
    expect(onAddLink).toHaveBeenCalledOnce();
    expect(onClose).toHaveBeenCalledOnce();
  });
});

import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { DeleteConfirmDialog } from "../DeleteConfirmDialog";
import type { ManagedLink } from "@/app/user-admin/components/types";

const link: ManagedLink = {
  id: "1",
  title: "My Link",
  url: "https://example.com",
  clicks: "42",
  draft: false,
};

describe("DeleteConfirmDialog", () => {
  it("renders nothing when closed", () => {
    const { container } = render(
      <DeleteConfirmDialog open={false} link={link} onClose={vi.fn()} onConfirm={vi.fn()} />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("renders title and draft message for draft links", () => {
    render(
      <DeleteConfirmDialog
        open
        link={{ ...link, draft: true }}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
      />
    );
    expect(screen.getByRole("heading", { name: /My Link/i })).toBeInTheDocument();
    expect(screen.getByText(/hasn't been seen by visitors/i)).toBeInTheDocument();
  });

  it("calls onClose when Cancel is clicked", () => {
    const onClose = vi.fn();
    render(<DeleteConfirmDialog open link={link} onClose={onClose} onConfirm={vi.fn()} />);
    fireEvent.click(screen.getByText("Cancel"));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("calls onConfirm when Delete is clicked", () => {
    const onConfirm = vi.fn();
    render(<DeleteConfirmDialog open link={link} onClose={vi.fn()} onConfirm={onConfirm} />);
    fireEvent.click(screen.getByText("Delete"));
    expect(onConfirm).toHaveBeenCalledOnce();
  });
});

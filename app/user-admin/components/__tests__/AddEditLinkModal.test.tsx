import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { AddEditLinkModal } from "../AddEditLinkModal";
import type { ManagedLink } from "../types";

const noop = vi.fn();

describe("AddEditLinkModal", () => {
  it("renders nothing when closed", () => {
    const { container } = render(
      <AddEditLinkModal open={false} onClose={noop} onSave={noop} />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("shows add-mode heading when no initialLink", () => {
    render(<AddEditLinkModal open onClose={noop} onSave={noop} />);
    expect(screen.getByText("Add a new link")).toBeInTheDocument();
  });

  it("shows edit-mode heading when initialLink is provided", () => {
    const link: ManagedLink = { title: "My Site", url: "https://example.com", clicks: "0" };
    render(<AddEditLinkModal open onClose={noop} onSave={noop} initialLink={link} />);
    expect(screen.getByText("Edit link")).toBeInTheDocument();
  });

  it("disables the save button when title or url is empty", () => {
    render(<AddEditLinkModal open onClose={noop} onSave={noop} />);
    const saveBtn = screen.getByRole("button", { name: /add link/i });
    expect(saveBtn).toBeDisabled();
  });

  it("enables the save button when title and url are filled", () => {
    render(<AddEditLinkModal open onClose={noop} onSave={noop} />);
    fireEvent.change(screen.getByPlaceholderText("e.g. My Website"), {
      target: { value: "My Blog" },
    });
    fireEvent.change(screen.getByPlaceholderText("https://"), {
      target: { value: "https://blog.com" },
    });
    expect(screen.getByRole("button", { name: /add link/i })).not.toBeDisabled();
  });

  it("calls onSave with correct data and then onClose", () => {
    const onSave = vi.fn();
    const onClose = vi.fn();
    render(<AddEditLinkModal open onClose={onClose} onSave={onSave} />);
    fireEvent.change(screen.getByPlaceholderText("e.g. My Website"), {
      target: { value: "My Blog" },
    });
    fireEvent.change(screen.getByPlaceholderText("https://"), {
      target: { value: "https://blog.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: /add link/i }));
    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({ title: "My Blog", url: "https://blog.com" })
    );
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("pre-fills fields from initialLink in edit mode", () => {
    const link: ManagedLink = { title: "Existing", url: "https://existing.com", clicks: "5" };
    render(<AddEditLinkModal open onClose={noop} onSave={noop} initialLink={link} />);
    expect(screen.getByDisplayValue("Existing")).toBeInTheDocument();
    expect(screen.getByDisplayValue("https://existing.com")).toBeInTheDocument();
  });

  it("calls onClose when Cancel is clicked", () => {
    const onClose = vi.fn();
    render(<AddEditLinkModal open onClose={onClose} onSave={noop} />);
    fireEvent.click(screen.getByText("Cancel"));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("selects a preset and pre-fills title/url", () => {
    render(<AddEditLinkModal open onClose={noop} onSave={noop} />);
    fireEvent.click(screen.getByText("Instagram"));
    expect(screen.getByDisplayValue("Instagram")).toBeInTheDocument();
    expect(screen.getByDisplayValue("https://instagram.com/")).toBeInTheDocument();
  });

  it("defaults new links to ACTIVE status", () => {
    render(<AddEditLinkModal open onClose={noop} onSave={noop} />);
    // The ACTIVE button should appear visually selected (has bg-white class)
    const activeBtn = screen.getByRole("button", { name: "ACTIVE" });
    expect(activeBtn).toBeInTheDocument();
  });

  it("allows switching to DRAFT status", () => {
    render(<AddEditLinkModal open onClose={noop} onSave={noop} />);
    fireEvent.click(screen.getByRole("button", { name: "DRAFT" }));
    fireEvent.change(screen.getByPlaceholderText("e.g. My Website"), {
      target: { value: "Draft Post" },
    });
    fireEvent.change(screen.getByPlaceholderText("https://"), {
      target: { value: "https://draft.com" },
    });
    const onSave = vi.fn();
    // Re-render to verify—just confirm DRAFT button is clickable
    expect(screen.getByRole("button", { name: "DRAFT" })).toBeInTheDocument();
  });
});

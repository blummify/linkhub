import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ManagedLinkCard } from "../ManagedLinkCard";
import type { ManagedLink } from "../types";

const link: ManagedLink = {
  id: "link-1",
  title: "My Website",
  url: "https://example.com",
  clicks: "1,240",
  draft: false,
  trendLabel: "+10% this week",
};

describe("ManagedLinkCard", () => {
  it("renders the link title and URL", () => {
    render(<ManagedLinkCard link={link} />);
    expect(screen.getByText("My Website")).toBeInTheDocument();
    expect(screen.getByText("example.com")).toBeInTheDocument();
  });

  it("shows click count in stats", () => {
    render(<ManagedLinkCard link={link} />);
    expect(screen.getByText("1,240 clicks")).toBeInTheDocument();
  });

  it("shows trend label when provided", () => {
    render(<ManagedLinkCard link={link} />);
    expect(screen.getByText("+10% this week")).toBeInTheDocument();
  });

  it("shows 'Published' badge for a published link", () => {
    render(<ManagedLinkCard link={link} />);
    expect(screen.getByText("Published")).toBeInTheDocument();
  });

  it("shows 'Unpublished' badge for a draft link", () => {
    render(<ManagedLinkCard link={{ ...link, draft: true }} onToggle={vi.fn()} />);
    expect(screen.getByText("Unpublished")).toBeInTheDocument();
  });

  it("does not show a Sample badge for demo links", () => {
    render(<ManagedLinkCard link={{ ...link, id: "__demo__test" }} />);
    expect(screen.queryByText("Sample")).not.toBeInTheDocument();
  });

  it("calls onDelete when the delete button is clicked", () => {
    const onDelete = vi.fn();
    render(<ManagedLinkCard link={link} onDelete={onDelete} />);
    fireEvent.click(screen.getByLabelText("Delete My Website"));
    expect(onDelete).toHaveBeenCalledOnce();
  });

  it("calls onEdit when the edit button is clicked", () => {
    const onEdit = vi.fn();
    render(<ManagedLinkCard link={link} onEdit={onEdit} />);
    fireEvent.click(screen.getByTitle("Edit"));
    expect(onEdit).toHaveBeenCalledOnce();
  });

  it("calls onToggle when the publish toggle is clicked", () => {
    const onToggle = vi.fn();
    render(<ManagedLinkCard link={link} onToggle={onToggle} />);
    fireEvent.click(screen.getByTitle("Unpublish"));
    expect(onToggle).toHaveBeenCalledOnce();
  });

  it("switches title to an inline input when title is clicked", () => {
    render(<ManagedLinkCard link={link} />);
    fireEvent.click(screen.getByText("My Website"));
    expect(screen.getByDisplayValue("My Website")).toBeInTheDocument();
  });

  it("calls onUpdate with new title on input blur", () => {
    const onUpdate = vi.fn();
    render(<ManagedLinkCard link={link} onUpdate={onUpdate} />);
    fireEvent.click(screen.getByText("My Website"));
    const input = screen.getByDisplayValue("My Website");
    fireEvent.change(input, { target: { value: "New Title" } });
    fireEvent.blur(input);
    expect(onUpdate).toHaveBeenCalledWith({ title: "New Title" });
  });

  it("reverts the title if input is cleared on blur", () => {
    const onUpdate = vi.fn();
    render(<ManagedLinkCard link={link} onUpdate={onUpdate} />);
    fireEvent.click(screen.getByText("My Website"));
    const input = screen.getByDisplayValue("My Website");
    fireEvent.change(input, { target: { value: "" } });
    fireEvent.blur(input);
    expect(onUpdate).not.toHaveBeenCalled();
  });
});

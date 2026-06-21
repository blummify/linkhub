import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ManageLinksSection } from "../ManageLinksSection";
import type { ManagedLink } from "../types";

const links: ManagedLink[] = [
  { id: "1", title: "Site A", url: "https://site-a.com", clicks: "100" },
  { id: "2", title: "Site B", url: "https://site-b.com", clicks: "200", draft: true },
];

describe("ManageLinksSection", () => {
  it("renders the page heading", () => {
    render(<ManageLinksSection links={[]} />);
    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading).toHaveTextContent(/your/i);
    expect(heading).toHaveTextContent(/links/i);
  });

  it("renders all provided links", () => {
    render(<ManageLinksSection links={links} />);
    expect(screen.getByText("Site A")).toBeInTheDocument();
    expect(screen.getByText("Site B")).toBeInTheDocument();
  });

  it("renders the Add New Link button when onAddLink is provided", () => {
    render(<ManageLinksSection links={[]} onAddLink={vi.fn()} />);
    expect(screen.getByRole("button", { name: /add new link/i })).toBeInTheDocument();
  });

  it("does not render Add New Link button when onAddLink is absent", () => {
    render(<ManageLinksSection links={[]} />);
    expect(screen.queryByRole("button", { name: /add new link/i })).not.toBeInTheDocument();
  });

  it("calls onAddLink when the add button is clicked", () => {
    const onAddLink = vi.fn();
    render(<ManageLinksSection links={[]} onAddLink={onAddLink} />);
    fireEvent.click(screen.getByRole("button", { name: /add new link/i }));
    expect(onAddLink).toHaveBeenCalledOnce();
  });

  it("renders an empty state gracefully with no links", () => {
    const { container } = render(<ManageLinksSection links={[]} />);
    expect(container).toBeInTheDocument();
    expect(screen.getByText(/your page is empty/i)).toBeInTheDocument();
  });

  it("renders an inline empty-state CTA when onAddLink is provided", () => {
    render(<ManageLinksSection links={[]} onAddLink={vi.fn()} />);
    expect(screen.getByRole("button", { name: /add your first link/i })).toBeInTheDocument();
  });

  it("shows the real summed total clicks in the analytics summary", () => {
    // Links with 100 + 200 clicks -> "300" total in the summary card.
    // AnalyticsCards renders both a mobile and desktop card, so expect it twice.
    render(<ManageLinksSection links={links} />);
    expect(screen.getAllByText("300").length).toBeGreaterThan(0);
  });

  it("links the total clicks card to the analytics page", () => {
    render(<ManageLinksSection links={links} />);
    const totalLinks = screen
      .getAllByRole("link")
      .filter((el) => el.getAttribute("href") === "/user-analytics");
    expect(totalLinks.length).toBeGreaterThan(0);
  });

  it("renders the clicks-over-time chart when links exist", () => {
    render(<ManageLinksSection links={links} />);
    expect(screen.getByText("Clicks over time")).toBeInTheDocument();
  });

  it("does not render the clicks chart when there are no links", () => {
    render(<ManageLinksSection links={[]} />);
    expect(screen.queryByText("Clicks over time")).not.toBeInTheDocument();
  });

  it("calls onDeleteLink when a link card's delete button is clicked", () => {
    const onDeleteLink = vi.fn();
    render(<ManageLinksSection links={links} onDeleteLink={onDeleteLink} />);
    fireEvent.click(screen.getByLabelText("Delete Site A"));
    expect(onDeleteLink).toHaveBeenCalledWith(links[0], 0);
  });
});

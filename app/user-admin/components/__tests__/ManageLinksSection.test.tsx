import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ManageLinksSection } from "../ManageLinksSection";
import { SidebarProvider } from "../../../components/SidebarContext";
import type { ManagedLink } from "../types";
import type { ReactNode } from "react";

const links: ManagedLink[] = [
  { id: "1", title: "Site A", url: "https://site-a.com", clicks: "100" },
  { id: "2", title: "Site B", url: "https://site-b.com", clicks: "200", draft: true },
];

function renderWithSidebar(ui: ReactNode) {
  return render(<SidebarProvider>{ui}</SidebarProvider>);
}

describe("ManageLinksSection", () => {
  it("renders the page heading", () => {
    renderWithSidebar(<ManageLinksSection links={[]} />);
    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading).toHaveTextContent(/your/i);
    expect(heading).toHaveTextContent(/links/i);
  });

  it("renders all provided links", () => {
    renderWithSidebar(<ManageLinksSection links={links} />);
    expect(screen.getByText("Site A")).toBeInTheDocument();
    expect(screen.getByText("Site B")).toBeInTheDocument();
  });

  it("renders the Add New Link button when onAddLink is provided", () => {
    renderWithSidebar(<ManageLinksSection links={[]} onAddLink={vi.fn()} />);
    expect(screen.getByRole("button", { name: /add new link/i })).toBeInTheDocument();
  });

  it("does not render Add New Link button when onAddLink is absent", () => {
    renderWithSidebar(<ManageLinksSection links={[]} />);
    expect(screen.queryByRole("button", { name: /add new link/i })).not.toBeInTheDocument();
  });

  it("calls onAddLink when the add button is clicked", () => {
    const onAddLink = vi.fn();
    renderWithSidebar(<ManageLinksSection links={[]} onAddLink={onAddLink} />);
    fireEvent.click(screen.getByRole("button", { name: /add new link/i }));
    expect(onAddLink).toHaveBeenCalledOnce();
  });

  it("renders an empty state gracefully with no links", () => {
    const { container } = renderWithSidebar(<ManageLinksSection links={[]} />);
    expect(container).toBeInTheDocument();
  });

  it("calls onDeleteLink when a link card's delete button is clicked", () => {
    const onDeleteLink = vi.fn();
    renderWithSidebar(<ManageLinksSection links={links} onDeleteLink={onDeleteLink} />);
    fireEvent.click(screen.getByLabelText("Delete Site A"));
    expect(onDeleteLink).toHaveBeenCalledWith(links[0], 0);
  });
});

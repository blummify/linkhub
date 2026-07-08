import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { UsersTable, type UsersTableProps } from "../UsersTable";
import type { AdminUser } from "../../services/types";

const users: AdminUser[] = [
  {
    id: "usr_1",
    name: "Joel Osei",
    email: "joel@x.com",
    handle: "@joelosei",
    plan: "pro",
    status: "active",
    links: 15,
    views30d: 8420,
    country: "Ghana",
    joinedAt: "2026-05-24",
    lastActiveAt: "2026-06-30",
  },
  {
    id: "usr_2",
    name: "Quick Cash",
    email: "q@x.com",
    handle: "@quick",
    plan: "free",
    status: "suspended",
    links: 9,
    views30d: 0,
    country: "Unknown",
    joinedAt: "2026-06-19",
    lastActiveAt: null,
  },
];

function renderTable(overrides: Partial<UsersTableProps> = {}): UsersTableProps {
  const props: UsersTableProps = {
    users,
    onSelect: vi.fn(),
    sort: "joined",
    dir: "desc",
    onSort: vi.fn(),
    selectedIds: new Set<string>(),
    onToggleRow: vi.fn(),
    onToggleAll: vi.fn(),
    ...overrides,
  };
  render(<UsersTable {...props} />);
  return props;
}

describe("UsersTable", () => {
  it("renders user cells with formatted numbers and dates", () => {
    renderTable();
    expect(screen.getByText("Joel Osei")).toBeInTheDocument();
    expect(screen.getByText("@joelosei")).toBeInTheDocument();
    expect(screen.getByText("8,420")).toBeInTheDocument();
    expect(screen.getByText("24 May 2026")).toBeInTheDocument();
    expect(screen.getByText("Suspended")).toBeInTheDocument();
    // Null last-active renders an em dash.
    expect(screen.getByText("—")).toBeInTheDocument();
  });

  it("calls onSelect when a row is clicked", () => {
    const { onSelect } = renderTable();
    fireEvent.click(screen.getByText("Joel Osei"));
    expect(onSelect).toHaveBeenCalledWith("usr_1");
  });

  it("selects a row via the keyboard", () => {
    const { onSelect } = renderTable();
    fireEvent.keyDown(screen.getByText("Quick Cash").closest("tr")!, { key: "Enter" });
    expect(onSelect).toHaveBeenCalledWith("usr_2");
  });

  it("requests a sort when a sortable header is clicked", () => {
    const { onSort } = renderTable();
    fireEvent.click(screen.getByRole("button", { name: "Links" }));
    expect(onSort).toHaveBeenCalledWith("links");
  });

  it("exposes the active sort via aria-sort", () => {
    renderTable({ sort: "views", dir: "asc" });
    expect(screen.getByRole("button", { name: "Views 30d" }).closest("th")).toHaveAttribute(
      "aria-sort",
      "ascending"
    );
    expect(screen.getByRole("button", { name: "Links" }).closest("th")).not.toHaveAttribute(
      "aria-sort"
    );
  });

  it("does not render sort buttons for unsortable columns", () => {
    renderTable();
    expect(screen.queryByRole("button", { name: "Handle" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Last active" })).not.toBeInTheDocument();
  });

  it("toggles a row checkbox without opening the drawer", () => {
    const { onToggleRow, onSelect } = renderTable();
    fireEvent.click(screen.getByRole("checkbox", { name: "Select Joel Osei" }));
    expect(onToggleRow).toHaveBeenCalledWith(users[0], true);
    expect(onSelect).not.toHaveBeenCalled();
  });

  it("unchecks an already-selected row", () => {
    const { onToggleRow } = renderTable({ selectedIds: new Set(["usr_1"]) });
    fireEvent.click(screen.getByRole("checkbox", { name: "Select Joel Osei" }));
    expect(onToggleRow).toHaveBeenCalledWith(users[0], false);
  });

  it("selects every row on the page via the header checkbox", () => {
    const { onToggleAll } = renderTable();
    fireEvent.click(screen.getByRole("checkbox", { name: "Select all rows on this page" }));
    expect(onToggleAll).toHaveBeenCalledWith(users, true);
  });

  it("marks the header checkbox indeterminate for a partial selection", () => {
    renderTable({ selectedIds: new Set(["usr_1"]) });
    const selectAll = screen.getByRole("checkbox", {
      name: "Select all rows on this page",
    }) as HTMLInputElement;
    expect(selectAll.indeterminate).toBe(true);
    expect(selectAll.checked).toBe(false);
  });
});

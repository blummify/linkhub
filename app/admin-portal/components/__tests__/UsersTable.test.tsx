import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { UsersTable } from "../UsersTable";
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

describe("UsersTable", () => {
  it("renders user cells with formatted numbers and dates", () => {
    render(<UsersTable users={users} onSelect={vi.fn()} />);
    expect(screen.getByText("Joel Osei")).toBeInTheDocument();
    expect(screen.getByText("@joelosei")).toBeInTheDocument();
    expect(screen.getByText("8,420")).toBeInTheDocument();
    expect(screen.getByText("24 May 2026")).toBeInTheDocument();
    expect(screen.getByText("Suspended")).toBeInTheDocument();
    // Null last-active renders an em dash.
    expect(screen.getByText("—")).toBeInTheDocument();
  });

  it("calls onSelect when a row is clicked", () => {
    const onSelect = vi.fn();
    render(<UsersTable users={users} onSelect={onSelect} />);
    fireEvent.click(screen.getByText("Joel Osei"));
    expect(onSelect).toHaveBeenCalledWith("usr_1");
  });

  it("selects a row via the keyboard", () => {
    const onSelect = vi.fn();
    render(<UsersTable users={users} onSelect={onSelect} />);
    fireEvent.keyDown(screen.getByText("Quick Cash").closest("tr")!, { key: "Enter" });
    expect(onSelect).toHaveBeenCalledWith("usr_2");
  });
});

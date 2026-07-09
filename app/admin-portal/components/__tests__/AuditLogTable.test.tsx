import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { AuditLogTable } from "../AuditLogTable";
import { formatDateTime } from "../../format";
import type { AuditLogEntry } from "../../services/types";

const entries: AuditLogEntry[] = [
  {
    id: "evt_1",
    actor: { id: "act_ama", name: "Ama Mensah", role: "Super admin" },
    actionType: "user_suspended",
    actionLabel: "Suspended account",
    target: "@quick-cash-now",
    sensitive: true,
    ip: "41.66.12.9",
    createdAt: "2026-06-30T13:52:00Z",
  },
  {
    id: "evt_2",
    actor: { id: "act_sam", name: "Sam Hale", role: "Admin" },
    actionType: "report_dismissed",
    actionLabel: "Dismissed report",
    target: "@free-giftcards",
    sensitive: false,
    ip: "102.89.4.201",
    createdAt: "2026-06-29T09:22:00Z",
  },
];

describe("AuditLogTable", () => {
  it("renders row cells with formatted time and a sensitive badge", () => {
    render(<AuditLogTable entries={entries} onSelect={vi.fn()} />);
    expect(screen.getByText("Ama Mensah")).toBeInTheDocument();
    expect(screen.getByText("Suspended account")).toBeInTheDocument();
    expect(screen.getByText("@quick-cash-now")).toBeInTheDocument();
    expect(screen.getByText("41.66.12.9")).toBeInTheDocument();
    expect(screen.getByText(formatDateTime(entries[0].createdAt))).toBeInTheDocument();
    expect(screen.getByText("Sensitive")).toBeInTheDocument();
  });

  it("does not render a sensitive badge for non-sensitive rows", () => {
    render(<AuditLogTable entries={[entries[1]]} onSelect={vi.fn()} />);
    expect(screen.queryByText("Sensitive")).not.toBeInTheDocument();
  });

  it("calls onSelect when a row is clicked", () => {
    const onSelect = vi.fn();
    render(<AuditLogTable entries={entries} onSelect={onSelect} />);
    fireEvent.click(screen.getByText("Sam Hale"));
    expect(onSelect).toHaveBeenCalledWith("evt_2");
  });

  it("selects a row via the keyboard", () => {
    const onSelect = vi.fn();
    render(<AuditLogTable entries={entries} onSelect={onSelect} />);
    fireEvent.keyDown(screen.getByText("Ama Mensah").closest("tr")!, { key: "Enter" });
    expect(onSelect).toHaveBeenCalledWith("evt_1");
  });
});

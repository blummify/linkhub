import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import type { AuditEntry, AuditPage, AuditQuery } from "../../../services/types";

const { listAuditLog } = vi.hoisted(() => ({ listAuditLog: vi.fn() }));
vi.mock("../../../services/adminService", () => ({ adminService: { listAuditLog } }));

import { AuditClient } from "../AuditClient";

function entry(id: string, overrides: Partial<AuditEntry> = {}): AuditEntry {
  return {
    id,
    action: "user.suspend",
    actorEmail: "staff@linkhub.app",
    targetUserId: "usr_1",
    targetEmail: "joel@x.com",
    metadata: null,
    at: "2026-07-08T09:00:00.000Z",
    ...overrides,
  };
}

function page(entries: AuditEntry[], total: number, pageNumber: number): AuditPage {
  return { entries, total, page: pageNumber, pageSize: 15 };
}

beforeEach(() => {
  listAuditLog.mockReset();
  listAuditLog.mockImplementation(async (query: AuditQuery = {}) => {
    if (query.page === 2) {
      return page([entry("aud_16", { action: "user.delete", targetEmail: "old@x.com" })], 16, 2);
    }
    return page(
      [
        entry("aud_1"),
        entry("aud_2", { action: "user.changePlan", metadata: { plan: "pro" } }),
        entry("aud_3", { action: "custom.event", actorEmail: null, targetEmail: null }),
      ],
      16,
      1
    );
  });
});

describe("AuditClient", () => {
  it("renders entries with readable action labels and details", async () => {
    render(<AuditClient />);

    expect(await screen.findByText("Suspended user")).toBeInTheDocument();
    expect(screen.getByText("Changed plan")).toBeInTheDocument();
    expect(screen.getByText("plan: pro")).toBeInTheDocument();
    expect(screen.getAllByText("joel@x.com").length).toBeGreaterThan(0);
    expect(screen.getByText(/Showing 1.15 of 16/)).toBeInTheDocument();
  });

  it("falls back to the raw action id and em dashes for unknown data", async () => {
    render(<AuditClient />);
    expect(await screen.findByText("custom.event")).toBeInTheDocument();
    // Unknown actor, target falls back to the user id.
    expect(screen.getByText("usr_1")).toBeInTheDocument();
  });

  it("pages through the log", async () => {
    render(<AuditClient />);
    await screen.findByText("Suspended user");

    fireEvent.click(screen.getByRole("button", { name: "Page 2" }));

    expect(await screen.findByText("Deleted user")).toBeInTheDocument();
    await waitFor(() =>
      expect(listAuditLog).toHaveBeenLastCalledWith(expect.objectContaining({ page: 2 }))
    );
  });

  it("shows an empty state before any actions exist", async () => {
    listAuditLog.mockResolvedValue(page([], 0, 1));
    render(<AuditClient />);

    expect(await screen.findByText("No audit entries yet.")).toBeInTheDocument();
    expect(screen.getByText(/Actions taken on users will appear here/)).toBeInTheDocument();
  });

  it("shows an error banner when loading fails", async () => {
    listAuditLog.mockRejectedValue(new Error("HTTP 500"));
    render(<AuditClient />);

    expect(await screen.findByRole("alert")).toHaveTextContent(/Couldn't load the audit log/);
  });
});

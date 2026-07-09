import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

// Stub the lazy modal so this test focuses on the list behaviour.
vi.mock("../../../components/AuditEntryModal", () => ({
  AuditEntryModal: ({ entryId }: { entryId: string; onClose: () => void }) => (
    <div role="dialog" aria-label="Audit entry">
      modal:{entryId}
    </div>
  ),
}));

import { AuditClient } from "../AuditClient";

describe("AuditClient", () => {
  it("renders the first page with a footer count, newest first", async () => {
    render(<AuditClient />);
    expect(await screen.findByText("@quick-cash-now")).toBeInTheDocument();
    expect(screen.getByText(/Showing 1.10 of 17/)).toBeInTheDocument();
  });

  it("narrows rows by the actor filter", async () => {
    render(<AuditClient />);
    await screen.findByText("@quick-cash-now");

    fireEvent.change(screen.getByRole("combobox", { name: "Filter by actor" }), {
      target: { value: "act_sam" },
    });

    await waitFor(() => expect(screen.queryByText("@quick-cash-now")).not.toBeInTheDocument());
    expect(screen.getByText("@cryptodoubler")).toBeInTheDocument();
  });

  it("narrows rows by the action type filter", async () => {
    render(<AuditClient />);
    await screen.findByText("@quick-cash-now");

    fireEvent.change(screen.getByRole("combobox", { name: "Filter by action type" }), {
      target: { value: "page_takedown" },
    });

    await waitFor(() => expect(screen.queryByText("@quick-cash-now")).not.toBeInTheDocument());
    expect(screen.getByText("@cryptodoubler")).toBeInTheDocument();
  });

  it("narrows rows by the date range filter", async () => {
    render(<AuditClient />);
    await screen.findByText("@quick-cash-now");

    fireEvent.change(screen.getByRole("combobox", { name: "Filter by date range" }), {
      target: { value: "24h" },
    });

    await waitFor(() => expect(screen.getByText(/Showing 1.6 of 6/)).toBeInTheDocument());
  });

  it("narrows rows by debounced search", async () => {
    render(<AuditClient />);
    await screen.findByText("@quick-cash-now");

    fireEvent.change(screen.getByRole("searchbox", { name: "Search audit log" }), {
      target: { value: "cryptodoubler" },
    });

    await waitFor(() => expect(screen.queryByText("@quick-cash-now")).not.toBeInTheDocument());
    expect(screen.getByText("@cryptodoubler")).toBeInTheDocument();
  });

  it("opens the modal for the clicked entry", async () => {
    render(<AuditClient />);
    fireEvent.click(await screen.findByText("@quick-cash-now"));

    expect(await screen.findByText("modal:evt_001")).toBeInTheDocument();
  });
});

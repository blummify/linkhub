import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { AuditEntryModal } from "../AuditEntryModal";
import { formatDateTime } from "../../format";
import { MOCK_AUDIT_LOG } from "../../services/mockData";

async function renderModal(entryId: string, onClose = vi.fn()) {
  render(<AuditEntryModal entryId={entryId} onClose={onClose} />);
  await screen.findByText(entryId);
  return onClose;
}

describe("AuditEntryModal", () => {
  it("opens with the entry's facts as a focus-managed, read-only dialog", async () => {
    const entry = MOCK_AUDIT_LOG.find((e) => e.id === "evt_001")!;
    await renderModal("evt_001");

    const dialog = screen.getByRole("dialog", { name: "Audit entry" });
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(screen.getByText(`${entry.actor.name} · ${entry.actor.role}`)).toBeInTheDocument();
    expect(screen.getByText(entry.actionLabel)).toBeInTheDocument();
    expect(screen.getByText(entry.target)).toBeInTheDocument();
    expect(screen.getByText(formatDateTime(entry.createdAt))).toBeInTheDocument();
    expect(screen.getByText(entry.ip)).toBeInTheDocument();
    // Two "Close" controls exist (header icon + footer button); focus moves to the header one.
    const closeButtons = screen.getAllByRole("button", { name: "Close" });
    expect(closeButtons[0]).toHaveFocus();
    // No edit/delete affordances — read-only.
    expect(screen.queryByRole("button", { name: /delete|suspend|edit/i })).not.toBeInTheDocument();
  });

  it("shows a reason section when the entry has a reason", async () => {
    await renderModal("evt_001");
    expect(screen.getByText("Reason")).toBeInTheDocument();
    expect(screen.getByText(/Phishing/)).toBeInTheDocument();
    expect(screen.queryByText("Changes")).not.toBeInTheDocument();
  });

  it("shows a before/after changes section when the entry has changes", async () => {
    await renderModal("evt_006");
    expect(screen.getByText("Changes")).toBeInTheDocument();
    expect(screen.getByText("Monthly price")).toBeInTheDocument();
    expect(screen.getByText(/€8\.00/)).toBeInTheDocument();
    expect(screen.getByText(/€9\.00/)).toBeInTheDocument();
    expect(screen.queryByText("Reason")).not.toBeInTheDocument();
  });

  it("closes on Escape, backdrop click, and the Close button", async () => {
    const onClose = await renderModal("evt_001");
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(1);

    const backdrop = document.querySelector('div.fixed[aria-hidden="true"]') as HTMLElement;
    fireEvent.click(backdrop);
    expect(onClose).toHaveBeenCalledTimes(2);

    const closeButtons = screen.getAllByRole("button", { name: "Close" });
    fireEvent.click(closeButtons[closeButtons.length - 1]);
    expect(onClose).toHaveBeenCalledTimes(3);
  });

  it("shows a not-found state for an unknown id", async () => {
    render(<AuditEntryModal entryId="nope" onClose={vi.fn()} />);
    expect(await screen.findByText("This entry could not be found.")).toBeInTheDocument();
  });
});

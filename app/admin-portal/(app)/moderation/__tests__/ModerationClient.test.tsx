import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";

vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

import { ModerationClient } from "../ModerationClient";
import { adminService } from "../../../services/adminService";

describe("ModerationClient", () => {
  it("renders the open report queue", async () => {
    render(<ModerationClient />);
    expect(await screen.findByText("@quick-cash-now")).toBeInTheDocument();
    expect(screen.getByText("@cryptodoubler")).toBeInTheDocument();
  });

  it("shows an empty state for a queue with no reports", async () => {
    render(<ModerationClient />);
    await screen.findByText("@quick-cash-now");

    fireEvent.click(screen.getByRole("button", { name: "Resolved" }));
    expect(await screen.findByText(/No reports in this queue/)).toBeInTheDocument();
  });

  it("fires non-destructive actions directly", async () => {
    const actSpy = vi.spyOn(adminService, "actOnReport");
    render(<ModerationClient />);
    await screen.findByText("@quick-cash-now");

    fireEvent.click(screen.getAllByRole("button", { name: "Warn" })[0]);
    await waitFor(() => expect(actSpy).toHaveBeenCalledWith("rep_cryptodoubler", "warn"));
    actSpy.mockRestore();
  });

  it("requires confirmation before taking a page down", async () => {
    const actSpy = vi.spyOn(adminService, "actOnReport");
    render(<ModerationClient />);
    await screen.findByText("@quick-cash-now");

    fireEvent.click(screen.getByRole("button", { name: "Take down" }));
    const confirm = screen.getByRole("alertdialog", { name: "Take down page?" });
    expect(actSpy).not.toHaveBeenCalled();

    fireEvent.click(within(confirm).getByRole("button", { name: "Take down" }));
    await waitFor(() => expect(actSpy).toHaveBeenCalledWith("rep_quickcash", "takedown"));
    actSpy.mockRestore();
  });
});

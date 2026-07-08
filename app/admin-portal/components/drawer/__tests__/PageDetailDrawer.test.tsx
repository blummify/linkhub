import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const suspendPage = vi.fn().mockResolvedValue({ ok: true });
const takeDownPage = vi.fn().mockResolvedValue({ ok: true });

vi.mock("../../../hooks/usePageDetail", () => ({
  usePageDetail: () => ({
    data: {
      id: "page_quickcash",
      handle: "@quick-cash-now",
      owner: { id: "usr_quickcash", name: "quick-cash-now", handle: "@quick-cash-now" },
      url: "https://linkhub.app/quick-cash-now",
      status: "flagged",
      links: 9,
      views30d: 0,
      reports: 3,
      createdAt: "2026-06-19",
      theme: "Alert",
      publishedLinks: [
        { id: "pl_1", title: "Bank login", url: "https://example.com/login", clicks: 2 },
      ],
      reportHistory: [
        {
          id: "pr_1",
          reporter: "@saraa",
          reason: "phishing",
          status: "open",
          reportedAt: "2026-06-19",
        },
      ],
    },
    loading: false,
    error: null,
  }),
}));

vi.mock("../../../services/adminService", () => ({
  adminService: {
    suspendPage,
    takeDownPage,
  },
}));

import { PageDetailDrawer } from "../PageDetailDrawer";

describe("PageDetailDrawer", () => {
  it("shows the page detail and confirms destructive actions", async () => {
    render(<PageDetailDrawer pageId="page_quickcash" onClose={vi.fn()} />);

    expect(await screen.findByText("@quick-cash-now")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Suspend page" }));
    expect(screen.getByRole("alertdialog", { name: "Suspend this page?" })).toBeInTheDocument();
    expect(screen.getByText(/This action is logged/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Suspend" }));
    await waitFor(() => expect(suspendPage).toHaveBeenCalledWith("page_quickcash"));
  });
});

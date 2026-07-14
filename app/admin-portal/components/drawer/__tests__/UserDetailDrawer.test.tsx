import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import type { AdminUserDetail } from "../../../services/types";

vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

// getUser is HTTP-backed now, so the service is mocked with a canned detail.
const {
  getUser,
  suspendUser,
  unsuspendUser,
  deleteUser,
  impersonateUser,
  changeUserPlan,
  sendPasswordReset,
} = vi.hoisted(() => ({
  getUser: vi.fn(),
  suspendUser: vi.fn(async () => ({ ok: true }) as const),
  unsuspendUser: vi.fn(async () => ({ ok: true }) as const),
  deleteUser: vi.fn(async () => ({ ok: true }) as const),
  impersonateUser: vi.fn(async () => ({ ok: true }) as const),
  changeUserPlan: vi.fn(async () => ({ ok: true }) as const),
  sendPasswordReset: vi.fn(async () => ({ ok: true }) as const),
}));
vi.mock("../../../services/adminService", () => ({
  adminService: {
    getUser,
    suspendUser,
    unsuspendUser,
    deleteUser,
    impersonateUser,
    changeUserPlan,
    sendPasswordReset,
  },
}));

import { UserDetailDrawer } from "../UserDetailDrawer";

const DETAIL: AdminUserDetail = {
  id: "usr_joelosei",
  name: "Joel Osei Acquah",
  email: "oseijoel6111@gmail.com",
  handle: "@joelosei",
  plan: "pro",
  status: "active",
  links: 6,
  views30d: 812,
  country: "GH",
  joinedAt: "2026-01-12T00:00:00.000Z",
  lastActiveAt: "2026-07-02T08:30:00.000Z",
  usage: [
    { label: "Links", used: 6, limit: 0, display: "6" },
    { label: "Views 30d", used: 812, limit: 0, display: "812" },
  ],
  recentActivity: [{ id: "lnk_1", title: "My Portfolio", meta: "Link updated · 15 Jun 2026" }],
  billing: {
    plan: "pro",
    status: "active",
    renewsAt: "2026-08-01T00:00:00.000Z",
    cancelAtPeriodEnd: false,
    card: { brand: "visa", last4: "4242", expiry: "12/27" },
  },
  security: {
    twoFactorEnabled: true,
    backupCodesRemaining: 8,
    passwordSet: true,
    providers: ["google"],
    emailVerifiedAt: "2026-01-12T00:00:00.000Z",
    recentLogins: [
      {
        id: "login_1",
        at: "2026-07-01T10:00:00.000Z",
        ip: "1.2.3.4",
        country: "GH",
        userAgent:
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
      },
    ],
  },
};

beforeEach(() => {
  vi.clearAllMocks();
  getUser.mockResolvedValue(DETAIL);
});

async function renderDrawer(onClose = vi.fn(), onMutated = vi.fn()) {
  render(<UserDetailDrawer userId="usr_joelosei" onClose={onClose} onMutated={onMutated} />);
  await screen.findByText("Joel Osei Acquah");
  return { onClose, onMutated };
}

describe("UserDetailDrawer", () => {
  it("opens with the selected user's data as a focus-managed dialog", async () => {
    await renderDrawer();
    const dialog = screen.getByRole("dialog", { name: "User detail" });
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(screen.getByText("oseijoel6111@gmail.com")).toBeInTheDocument();
    expect(screen.getByText("@joelosei")).toBeInTheDocument();
    // Focus moved into the drawer (the close button).
    expect(screen.getByRole("button", { name: "Close" })).toHaveFocus();
  });

  it("closes on Escape and on backdrop click", async () => {
    const { onClose } = await renderDrawer();
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(1);

    const backdrop = document.querySelector('div.fixed[aria-hidden="true"]') as HTMLElement;
    fireEvent.click(backdrop);
    expect(onClose).toHaveBeenCalledTimes(2);
  });

  it("shows plan & billing and usage on the overview tab", async () => {
    await renderDrawer();
    const panel = screen.getByRole("tabpanel");
    expect(panel).toHaveTextContent("Visa •••• 4242");
    expect(panel).toHaveTextContent("01 Aug 2026");
    expect(within(panel).getByText("Links")).toBeInTheDocument();
    expect(within(panel).getByText("812")).toBeInTheDocument();
  });

  it("switches to the activity tab", async () => {
    await renderDrawer();
    fireEvent.click(screen.getByRole("tab", { name: "Activity" }));

    expect(screen.getByRole("tab", { name: "Activity" })).toHaveAttribute("aria-selected", "true");
    const panel = screen.getByRole("tabpanel");
    expect(within(panel).getByText("My Portfolio")).toBeInTheDocument();
    expect(within(panel).getByText("Link updated · 15 Jun 2026")).toBeInTheDocument();
  });

  it("shows 2FA, sign-in methods, and recent logins on the security tab", async () => {
    await renderDrawer();
    fireEvent.click(screen.getByRole("tab", { name: "Security" }));

    const panel = screen.getByRole("tabpanel");
    expect(within(panel).getByText("Enabled")).toBeInTheDocument();
    expect(within(panel).getByText("8 remaining")).toBeInTheDocument();
    expect(within(panel).getByText("Google, Password")).toBeInTheDocument();
    expect(within(panel).getByText("01 Jul 2026, 10:00")).toBeInTheDocument();
    expect(within(panel).getByText("GH · 1.2.3.4 · Chrome")).toBeInTheDocument();
  });

  it("moves between tabs with arrow keys", async () => {
    await renderDrawer();
    fireEvent.keyDown(screen.getByRole("tablist"), { key: "ArrowRight" });
    expect(screen.getByRole("tab", { name: "Activity" })).toHaveAttribute("aria-selected", "true");

    fireEvent.keyDown(screen.getByRole("tablist"), { key: "ArrowLeft" });
    expect(screen.getByRole("tab", { name: "Overview" })).toHaveAttribute("aria-selected", "true");
  });

  it("requires confirmation before a destructive action fires", async () => {
    const { onClose, onMutated } = await renderDrawer();

    fireEvent.click(screen.getByRole("button", { name: "Delete" }));
    const confirm = screen.getByRole("alertdialog", { name: "Delete user?" });
    expect(confirm).toHaveTextContent(/logged and cannot be undone/);
    expect(deleteUser).not.toHaveBeenCalled();

    // Cancel must not fire the mutation.
    fireEvent.click(within(confirm).getByRole("button", { name: "Cancel" }));
    expect(deleteUser).not.toHaveBeenCalled();

    // Confirm fires it with the correct id and closes the drawer.
    fireEvent.click(screen.getByRole("button", { name: "Delete" }));
    const confirmAgain = screen.getByRole("alertdialog", { name: "Delete user?" });
    fireEvent.click(within(confirmAgain).getByRole("button", { name: "Delete" }));

    await waitFor(() => expect(deleteUser).toHaveBeenCalledWith("usr_joelosei"));
    await waitFor(() => expect(onClose).toHaveBeenCalled());
    expect(onMutated).toHaveBeenCalled();
  });

  it("offers Unsuspend for a suspended user and reinstates without a dialog", async () => {
    getUser.mockResolvedValue({ ...DETAIL, status: "suspended" });
    const { onMutated } = await renderDrawer();

    expect(screen.queryByRole("button", { name: "Suspend" })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Unsuspend" }));

    await waitFor(() => expect(unsuspendUser).toHaveBeenCalledWith("usr_joelosei"));
    await waitFor(() => expect(onMutated).toHaveBeenCalled());
    // The drawer stays open and refetches the (now reinstated) user.
    expect(getUser.mock.calls.length).toBeGreaterThan(1);
  });

  it("surfaces a server refusal as an error toast", async () => {
    const { toast } = await import("sonner");
    deleteUser.mockRejectedValue(new Error("Staff accounts cannot be managed here"));
    const { onClose } = await renderDrawer();

    fireEvent.click(screen.getByRole("button", { name: "Delete" }));
    const confirm = screen.getByRole("alertdialog", { name: "Delete user?" });
    fireEvent.click(within(confirm).getByRole("button", { name: "Delete" }));

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith("Staff accounts cannot be managed here")
    );
    expect(onClose).not.toHaveBeenCalled();
  });
});

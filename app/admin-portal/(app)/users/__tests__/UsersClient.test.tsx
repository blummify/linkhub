import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import type { AdminUser, UserPage, UserQuery } from "../../../services/types";

// Stub the lazy drawer so this test focuses on the list behaviour.
vi.mock("../../../components/drawer/UserDetailDrawer", () => ({
  UserDetailDrawer: ({ userId }: { userId: string; onClose: () => void }) => (
    <div role="dialog" aria-label="User detail">
      drawer:{userId}
    </div>
  ),
}));

// listUsers is HTTP-backed now, so the service is mocked with canned pages.
const { listUsers, suspendUser, deleteUser, changeUserPlan } = vi.hoisted(() => ({
  listUsers: vi.fn(),
  suspendUser: vi.fn(async () => ({ ok: true }) as const),
  deleteUser: vi.fn(async () => ({ ok: true }) as const),
  changeUserPlan: vi.fn(async () => ({ ok: true }) as const),
}));
vi.mock("../../../services/adminService", () => ({
  adminService: { listUsers, suspendUser, deleteUser, changeUserPlan },
}));

import { UsersClient } from "../UsersClient";

function user(id: string, name: string, overrides: Partial<AdminUser> = {}): AdminUser {
  return {
    id,
    name,
    email: `${id}@example.com`,
    handle: `@${id}`,
    plan: "free",
    status: "active",
    links: 3,
    views30d: 120,
    country: "GH",
    joinedAt: "2026-01-05T00:00:00.000Z",
    lastActiveAt: null,
    ...overrides,
  };
}

const FIRST_PAGE = [
  user("usr_joelosei", "Joel Osei Acquah"),
  ...Array.from({ length: 7 }, (_, i) => user(`first_${i}`, `First Page ${i}`)),
];
const SECOND_PAGE = [
  user("usr_akua", "Akua Sarpong"),
  ...Array.from({ length: 7 }, (_, i) => user(`second_${i}`, `Second Page ${i}`)),
];

function page(users: AdminUser[], total: number, pageNumber: number): UserPage {
  return { users, total, page: pageNumber, pageSize: 8 };
}

beforeEach(() => {
  vi.clearAllMocks();
  listUsers.mockImplementation(async (query: UserQuery = {}) => {
    if (query.filter === "suspended") {
      return page([user("usr_sus", "quick-cash-now", { status: "suspended" })], 1, 1);
    }
    if (query.search === "sara") return page([user("usr_sara", "Sara Addo")], 1, 1);
    if (query.page === 2) return page(SECOND_PAGE, 23, 2);
    return page(FIRST_PAGE, 23, 1);
  });
});

describe("UsersClient", () => {
  it("renders the first page with a footer count", async () => {
    render(<UsersClient />);
    expect(await screen.findByText("Joel Osei Acquah")).toBeInTheDocument();
    expect(screen.getByText(/Showing 1.8 of 23/)).toBeInTheDocument();
  });

  it("filters rows by the suspended tab", async () => {
    render(<UsersClient />);
    await screen.findByText("Joel Osei Acquah");

    fireEvent.click(screen.getByRole("button", { name: "Suspended" }));

    await waitFor(() => expect(screen.queryByText("Joel Osei Acquah")).not.toBeInTheDocument());
    expect(screen.getByText("quick-cash-now")).toBeInTheDocument();
  });

  it("filters rows by debounced search", async () => {
    render(<UsersClient />);
    await screen.findByText("Joel Osei Acquah");

    fireEvent.change(screen.getByRole("searchbox", { name: "Search users" }), {
      target: { value: "sara" },
    });

    await waitFor(() => expect(screen.queryByText("Joel Osei Acquah")).not.toBeInTheDocument());
    expect(screen.getByText("Sara Addo")).toBeInTheDocument();
  });

  it("pages through results", async () => {
    render(<UsersClient />);
    await screen.findByText("Joel Osei Acquah");

    fireEvent.click(screen.getByRole("button", { name: "Next page" }));

    expect(await screen.findByText("Akua Sarpong")).toBeInTheDocument();
    expect(screen.queryByText("Joel Osei Acquah")).not.toBeInTheDocument();
    expect(screen.getByText(/Showing 9.16 of 23/)).toBeInTheDocument();
  });

  it("opens the drawer for the clicked user", async () => {
    render(<UsersClient />);
    fireEvent.click(await screen.findByText("Joel Osei Acquah"));

    expect(await screen.findByText("drawer:usr_joelosei")).toBeInTheDocument();
  });

  it("shows an error banner when loading fails", async () => {
    listUsers.mockRejectedValue(new Error("HTTP 500"));
    render(<UsersClient />);

    expect(await screen.findByRole("alert")).toHaveTextContent(/Couldn't load users — HTTP 500/);
  });

  it("requests the business filter tab server-side", async () => {
    render(<UsersClient />);
    await screen.findByText("Joel Osei Acquah");

    fireEvent.click(screen.getByRole("button", { name: "Business" }));

    await waitFor(() =>
      expect(listUsers).toHaveBeenLastCalledWith(expect.objectContaining({ filter: "business", page: 1 }))
    );
  });

  it("sorts server-side and toggles direction on a second click", async () => {
    render(<UsersClient />);
    await screen.findByText("Joel Osei Acquah");

    fireEvent.click(screen.getByRole("button", { name: "Views 30d" }));
    await waitFor(() =>
      expect(listUsers).toHaveBeenLastCalledWith(
        expect.objectContaining({ sort: "views", dir: "desc", page: 1 })
      )
    );

    fireEvent.click(screen.getByRole("button", { name: "Views 30d" }));
    await waitFor(() =>
      expect(listUsers).toHaveBeenLastCalledWith(expect.objectContaining({ sort: "views", dir: "asc" }))
    );
  });

  it("shows the bulk bar with a live count when rows are selected", async () => {
    render(<UsersClient />);
    await screen.findByText("Joel Osei Acquah");

    expect(screen.queryByRole("toolbar", { name: "Bulk actions" })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("checkbox", { name: "Select Joel Osei Acquah" }));
    expect(screen.getByRole("toolbar", { name: "Bulk actions" })).toHaveTextContent("1 selected");

    fireEvent.click(screen.getByRole("checkbox", { name: "Select all rows on this page" }));
    expect(screen.getByRole("toolbar", { name: "Bulk actions" })).toHaveTextContent("8 selected");
  });

  it("runs a bulk delete only after the confirm dialog", async () => {
    render(<UsersClient />);
    await screen.findByText("Joel Osei Acquah");

    fireEvent.click(screen.getByRole("checkbox", { name: "Select Joel Osei Acquah" }));
    fireEvent.click(screen.getByRole("button", { name: "Delete" }));

    const dialog = screen.getByRole("alertdialog", { name: "Delete 1 user?" });
    expect(dialog).toHaveTextContent(/logged and cannot be undone/);
    expect(deleteUser).not.toHaveBeenCalled();

    const listCallsBefore = listUsers.mock.calls.length;
    fireEvent.click(within(dialog).getByRole("button", { name: "Delete" }));

    await waitFor(() => expect(deleteUser).toHaveBeenCalledWith("usr_joelosei"));
    await waitFor(() =>
      expect(screen.queryByRole("toolbar", { name: "Bulk actions" })).not.toBeInTheDocument()
    );
    // The list refetches so the deleted row disappears.
    await waitFor(() => expect(listUsers.mock.calls.length).toBeGreaterThan(listCallsBefore));
  });

  it("cancels a bulk suspend without calling the service", async () => {
    render(<UsersClient />);
    await screen.findByText("Joel Osei Acquah");

    fireEvent.click(screen.getByRole("checkbox", { name: "Select Joel Osei Acquah" }));
    fireEvent.click(screen.getByRole("button", { name: "Suspend" }));

    expect(screen.getByRole("alertdialog", { name: "Suspend 1 user?" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

    expect(suspendUser).not.toHaveBeenCalled();
    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
    // Selection survives a cancelled action.
    expect(screen.getByRole("toolbar", { name: "Bulk actions" })).toHaveTextContent("1 selected");
  });

  it("changes plans for the selection from the bulk bar", async () => {
    render(<UsersClient />);
    await screen.findByText("Joel Osei Acquah");

    fireEvent.click(screen.getByRole("checkbox", { name: "Select Joel Osei Acquah" }));
    fireEvent.change(screen.getByRole("combobox", { name: "Change plan" }), {
      target: { value: "pro" },
    });

    await waitFor(() => expect(changeUserPlan).toHaveBeenCalledWith("usr_joelosei", "pro"));
  });

  it("clears the selection when the filter changes", async () => {
    render(<UsersClient />);
    await screen.findByText("Joel Osei Acquah");

    fireEvent.click(screen.getByRole("checkbox", { name: "Select Joel Osei Acquah" }));
    expect(screen.getByRole("toolbar", { name: "Bulk actions" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Suspended" }));
    await waitFor(() =>
      expect(screen.queryByRole("toolbar", { name: "Bulk actions" })).not.toBeInTheDocument()
    );
  });
});

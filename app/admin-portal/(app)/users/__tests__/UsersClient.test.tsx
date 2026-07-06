import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

// Stub the lazy drawer so this test focuses on the list behaviour.
vi.mock("../../../components/drawer/UserDetailDrawer", () => ({
  UserDetailDrawer: ({ userId }: { userId: string; onClose: () => void }) => (
    <div role="dialog" aria-label="User detail">
      drawer:{userId}
    </div>
  ),
}));

import { UsersClient } from "../UsersClient";

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
});

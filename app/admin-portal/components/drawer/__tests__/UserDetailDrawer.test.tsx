import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";

vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

import { UserDetailDrawer } from "../UserDetailDrawer";
import { adminService } from "../../../services/adminService";

async function renderDrawer(onClose = vi.fn()) {
  render(<UserDetailDrawer userId="usr_joelosei" onClose={onClose} />);
  await screen.findByText("Joel Osei Acquah");
  return onClose;
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
    const onClose = await renderDrawer();
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(1);

    const backdrop = document.querySelector('div.fixed[aria-hidden="true"]') as HTMLElement;
    fireEvent.click(backdrop);
    expect(onClose).toHaveBeenCalledTimes(2);
  });

  it("requires confirmation before a destructive action fires", async () => {
    const onClose = await renderDrawer();
    const deleteSpy = vi.spyOn(adminService, "deleteUser");

    fireEvent.click(screen.getByRole("button", { name: "Delete" }));
    const confirm = screen.getByRole("alertdialog", { name: "Delete user?" });
    expect(deleteSpy).not.toHaveBeenCalled();

    // Cancel must not fire the mutation.
    fireEvent.click(within(confirm).getByRole("button", { name: "Cancel" }));
    expect(deleteSpy).not.toHaveBeenCalled();

    // Confirm fires it with the correct id and closes the drawer.
    fireEvent.click(screen.getByRole("button", { name: "Delete" }));
    const confirmAgain = screen.getByRole("alertdialog", { name: "Delete user?" });
    fireEvent.click(within(confirmAgain).getByRole("button", { name: "Delete" }));

    await waitFor(() => expect(deleteSpy).toHaveBeenCalledWith("usr_joelosei"));
    await waitFor(() => expect(onClose).toHaveBeenCalled());
  });
});

import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { InviteAdminModal } from "../InviteAdminModal";
import { adminService } from "../../services/adminService";

vi.mock("../../services/adminService", () => ({
  adminService: {
    inviteTeamMember: vi.fn(),
  },
}));

describe("InviteAdminModal", () => {
  beforeEach(() => {
    vi.mocked(adminService.inviteTeamMember).mockReset();
  });

  it("disables Send invite until a valid email is entered", () => {
    render(<InviteAdminModal onClose={vi.fn()} onInvited={vi.fn()} />);
    expect(screen.getByRole("button", { name: "Send invite" })).toBeDisabled();

    fireEvent.change(screen.getByPlaceholderText("name@linkhub.app"), {
      target: { value: "not-an-email" },
    });
    expect(screen.getByRole("button", { name: "Send invite" })).toBeDisabled();

    fireEvent.change(screen.getByPlaceholderText("name@linkhub.app"), {
      target: { value: "kojo@linkhub.app" },
    });
    expect(screen.getByRole("button", { name: "Send invite" })).not.toBeDisabled();
  });

  it("defaults the role select to Support", () => {
    render(<InviteAdminModal onClose={vi.fn()} onInvited={vi.fn()} />);
    expect(screen.getByRole("combobox")).toHaveValue("SUPPORT");
  });

  it("submits the email and selected role, then calls onInvited and onClose", async () => {
    vi.mocked(adminService.inviteTeamMember).mockResolvedValue({ ok: true });
    const onInvited = vi.fn();
    const onClose = vi.fn();
    render(<InviteAdminModal onClose={onClose} onInvited={onInvited} />);

    fireEvent.change(screen.getByPlaceholderText("name@linkhub.app"), {
      target: { value: "kojo@linkhub.app" },
    });
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "FINANCE" } });
    fireEvent.click(screen.getByRole("button", { name: "Send invite" }));

    await waitFor(() => expect(onInvited).toHaveBeenCalledTimes(1));
    expect(adminService.inviteTeamMember).toHaveBeenCalledWith("kojo@linkhub.app", "FINANCE");
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("shows an error and keeps the modal open when the invite fails", async () => {
    vi.mocked(adminService.inviteTeamMember).mockResolvedValue({ ok: false } as never);
    const onClose = vi.fn();
    render(<InviteAdminModal onClose={onClose} onInvited={vi.fn()} />);

    fireEvent.change(screen.getByPlaceholderText("name@linkhub.app"), {
      target: { value: "kojo@linkhub.app" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Send invite" }));

    expect(await screen.findByText("Something went wrong. Please try again.")).toBeInTheDocument();
    expect(onClose).not.toHaveBeenCalled();
  });

  it("calls onClose when the close (x) button is clicked", () => {
    const onClose = vi.fn();
    render(<InviteAdminModal onClose={onClose} onInvited={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: "Close" }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});

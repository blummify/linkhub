import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { ChangeRoleDialog } from "../ChangeRoleDialog";
import { adminService } from "../../services/adminService";
import type { TeamMember } from "../../services/types";

vi.mock("../../services/adminService", () => ({
  adminService: {
    changeTeamMemberRole: vi.fn(),
  },
}));

const MEMBER: TeamMember = {
  id: "adm_kojo",
  name: "Kojo Brent",
  email: "kojo@linkhub.app",
  role: "SUPPORT",
  status: "active",
  lastActiveAt: "2026-06-30",
};

describe("ChangeRoleDialog", () => {
  beforeEach(() => {
    vi.mocked(adminService.changeTeamMemberRole).mockReset();
  });

  it("renders nothing when member is null", () => {
    const { container } = render(<ChangeRoleDialog member={null} onClose={vi.fn()} onChanged={vi.fn()} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("pre-populates the role select with the member's current role", () => {
    render(<ChangeRoleDialog member={MEMBER} onClose={vi.fn()} onChanged={vi.fn()} />);
    expect(screen.getByRole("combobox")).toHaveValue("SUPPORT");
  });

  it("disables Update role until a different role is chosen", () => {
    render(<ChangeRoleDialog member={MEMBER} onClose={vi.fn()} onChanged={vi.fn()} />);
    expect(screen.getByRole("button", { name: "Update role" })).toBeDisabled();

    fireEvent.change(screen.getByRole("combobox"), { target: { value: "FINANCE" } });
    expect(screen.getByRole("button", { name: "Update role" })).not.toBeDisabled();
  });

  it("submits the new role and calls onChanged and onClose", async () => {
    vi.mocked(adminService.changeTeamMemberRole).mockResolvedValue({ ok: true });
    const onChanged = vi.fn();
    const onClose = vi.fn();
    render(<ChangeRoleDialog member={MEMBER} onClose={onClose} onChanged={onChanged} />);

    fireEvent.change(screen.getByRole("combobox"), { target: { value: "MODERATOR" } });
    fireEvent.click(screen.getByRole("button", { name: "Update role" }));

    await waitFor(() => expect(onChanged).toHaveBeenCalledTimes(1));
    expect(adminService.changeTeamMemberRole).toHaveBeenCalledWith("adm_kojo", "MODERATOR");
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("shows an error and stays open when the request fails", async () => {
    vi.mocked(adminService.changeTeamMemberRole).mockResolvedValue({ ok: false } as never);
    const onClose = vi.fn();
    render(<ChangeRoleDialog member={MEMBER} onClose={onClose} onChanged={vi.fn()} />);

    fireEvent.change(screen.getByRole("combobox"), { target: { value: "MODERATOR" } });
    fireEvent.click(screen.getByRole("button", { name: "Update role" }));

    expect(await screen.findByText("Something went wrong. Please try again.")).toBeInTheDocument();
    expect(onClose).not.toHaveBeenCalled();
  });
});

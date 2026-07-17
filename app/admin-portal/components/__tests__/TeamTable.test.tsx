import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { TeamTable } from "../TeamTable";
import type { TeamMember } from "../../services/types";

const MEMBERS: TeamMember[] = [
  {
    id: "adm_1",
    name: "Ama Mensah",
    email: "ama@linkhub.app",
    role: "SUPER_ADMIN",
    status: "active",
    lastActiveAt: "2026-06-30",
  },
  {
    id: "adm_2",
    name: "Nii Ako",
    email: "nii@linkhub.app",
    role: "MODERATOR",
    status: "invited",
    lastActiveAt: null,
  },
];

describe("TeamTable", () => {
  it("renders each member's name, email, role, and status", () => {
    render(<TeamTable members={MEMBERS} canManage onChangeRole={vi.fn()} onRemove={vi.fn()} />);
    expect(screen.getByText("Ama Mensah")).toBeInTheDocument();
    expect(screen.getByText("ama@linkhub.app")).toBeInTheDocument();
    expect(screen.getByText("Super admin")).toBeInTheDocument();
    expect(screen.getByText("Active")).toBeInTheDocument();
    expect(screen.getByText("Invited")).toBeInTheDocument();
  });

  it("shows a dash for a member who has never been active", () => {
    render(<TeamTable members={MEMBERS} canManage onChangeRole={vi.fn()} onRemove={vi.fn()} />);
    expect(screen.getByText("—")).toBeInTheDocument();
  });

  it("enables row actions when canManage is true and calls the handlers with the row's member", () => {
    const onChangeRole = vi.fn();
    const onRemove = vi.fn();
    render(<TeamTable members={MEMBERS} canManage onChangeRole={onChangeRole} onRemove={onRemove} />);

    const changeRoleButtons = screen.getAllByRole("button", { name: "Change role" });
    const removeButtons = screen.getAllByRole("button", { name: "Remove" });
    expect(changeRoleButtons[0]).not.toBeDisabled();

    fireEvent.click(changeRoleButtons[0]);
    expect(onChangeRole).toHaveBeenCalledWith(MEMBERS[0]);

    fireEvent.click(removeButtons[0]);
    expect(onRemove).toHaveBeenCalledWith(MEMBERS[0]);
  });

  it("disables every row action when canManage is false", () => {
    render(<TeamTable members={MEMBERS} canManage={false} onChangeRole={vi.fn()} onRemove={vi.fn()} />);
    for (const button of screen.getAllByRole("button", { name: "Change role" })) {
      expect(button).toBeDisabled();
    }
    for (const button of screen.getAllByRole("button", { name: "Remove" })) {
      expect(button).toBeDisabled();
    }
  });
});

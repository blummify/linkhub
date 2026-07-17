import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { TeamClient } from "../TeamClient";
import { adminService } from "@/app/admin-portal/services/adminService";
import { useTeamMembers } from "@/app/admin-portal/hooks/useTeamMembers";
import type { TeamMember } from "@/app/admin-portal/services/types";

vi.mock("@/app/admin-portal/hooks/useTeamMembers");
vi.mock("@/app/admin-portal/services/adminService", () => ({
  adminService: {
    removeTeamMember: vi.fn(),
    inviteTeamMember: vi.fn(),
    changeTeamMemberRole: vi.fn(),
  },
}));

const MEMBERS: TeamMember[] = [
  {
    id: "adm_ama",
    name: "Ama Mensah",
    email: "ama@linkhub.app",
    role: "SUPER_ADMIN",
    status: "active",
    lastActiveAt: "2026-06-30",
  },
];

function mockMembers(overrides: Partial<ReturnType<typeof useTeamMembers>> = {}) {
  vi.mocked(useTeamMembers).mockReturnValue({
    data: MEMBERS,
    loading: false,
    refresh: vi.fn(),
    ...overrides,
  });
}

describe("TeamClient", () => {
  beforeEach(() => {
    vi.mocked(adminService.removeTeamMember).mockReset();
  });

  it("shows a loading skeleton while the roster is loading", () => {
    mockMembers({ data: undefined, loading: true });
    render(<TeamClient isSuperAdmin />);
    expect(screen.queryByText("Ama Mensah")).not.toBeInTheDocument();
  });

  it("renders the header, member table, and roles legend once loaded", () => {
    mockMembers();
    render(<TeamClient isSuperAdmin />);
    expect(screen.getByText("Ama Mensah")).toBeInTheDocument();
    expect(screen.getByText("Roles & permissions")).toBeInTheDocument();
  });

  it("shows the Invite admin button only for super admins", () => {
    mockMembers();
    const { rerender } = render(<TeamClient isSuperAdmin={false} />);
    expect(screen.queryByRole("button", { name: "Invite admin" })).not.toBeInTheDocument();

    rerender(<TeamClient isSuperAdmin />);
    expect(screen.getByRole("button", { name: "Invite admin" })).toBeInTheDocument();
  });

  it("shows an empty state when there are no members", () => {
    mockMembers({ data: [] });
    render(<TeamClient isSuperAdmin />);
    expect(screen.getByText("No admins yet")).toBeInTheDocument();
  });

  it("opens the invite modal and closes it on cancel", () => {
    mockMembers();
    render(<TeamClient isSuperAdmin />);

    fireEvent.click(screen.getByRole("button", { name: "Invite admin" }));
    expect(screen.getByText("Invite admin", { selector: "h2" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(screen.queryByText("Invite admin", { selector: "h2" })).not.toBeInTheDocument();
  });

  it("removes a member after confirming and refreshes the roster", async () => {
    vi.mocked(adminService.removeTeamMember).mockResolvedValue({ ok: true });
    const refresh = vi.fn();
    mockMembers({ refresh });
    render(<TeamClient isSuperAdmin />);

    fireEvent.click(screen.getByRole("button", { name: "Remove" }));
    expect(screen.getByText("Remove admin access?")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Remove access" }));

    await waitFor(() => expect(adminService.removeTeamMember).toHaveBeenCalledWith("adm_ama"));
    await waitFor(() => expect(refresh).toHaveBeenCalledTimes(1));
  });

  it("does not remove a member when the confirm dialog is cancelled", () => {
    mockMembers();
    render(<TeamClient isSuperAdmin />);

    fireEvent.click(screen.getByRole("button", { name: "Remove" }));
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

    expect(adminService.removeTeamMember).not.toHaveBeenCalled();
  });
});

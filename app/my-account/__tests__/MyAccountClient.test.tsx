import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import MyAccountClient from "../MyAccountClient";

vi.mock("@/app/components/CollapsibleSidebar", () => ({
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock("@/store/sidebarStore", () => ({
  useSidebarStore: () => false,
}));

vi.mock("@/app/user-admin/components/DashboardTopBar", () => ({
  DashboardTopBar: () => <div data-testid="topbar" />,
}));

vi.mock("@/app/components/CommandPalette", () => ({
  CommandPalette: () => null,
}));

vi.mock("next-auth/react", () => ({
  useSession: () => ({
    data: { user: { name: "Joel Osei Acquah", email: "joel@linkhub.co" } },
  }),
}));

const { updateBranding, toastSuccess, toastError } = vi.hoisted(() => ({
  updateBranding: vi.fn(),
  toastSuccess: vi.fn(),
  toastError: vi.fn(),
}));
vi.mock("@/app/actions/profile", () => ({ updateBranding }));
vi.mock("sonner", () => ({
  toast: { success: toastSuccess, error: toastError },
}));

describe("MyAccountClient", () => {
  beforeEach(() => {
    updateBranding.mockReset();
    updateBranding.mockResolvedValue({ success: true });
    toastSuccess.mockClear();
    toastError.mockClear();
  });

  it("renders the account page with its sections", () => {
    render(<MyAccountClient />);
    expect(screen.getByRole("main")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /my account/i })).toBeInTheDocument();
    expect(screen.getByText("Profile")).toBeInTheDocument();
    expect(screen.getByText("Change password")).toBeInTheDocument();
    expect(screen.getByText("Security")).toBeInTheDocument();
    expect(screen.getByText("Danger zone")).toBeInTheDocument();
  });

  it("hydrates the profile fields from the session", () => {
    render(<MyAccountClient />);
    fireEvent.click(screen.getAllByLabelText("Edit")[0]);
    expect(screen.getByLabelText("Full name")).toHaveValue("Joel Osei Acquah");
    expect(screen.getByLabelText("Email")).toHaveValue("joel@linkhub.co");
  });

  it("enables Save only when the profile is dirty and persists the name", async () => {
    render(<MyAccountClient />);
    fireEvent.click(screen.getAllByLabelText("Edit")[0]);

    const save = screen.getByRole("button", { name: /save changes/i });
    expect(save).toBeDisabled();

    fireEvent.change(screen.getByLabelText("Full name"), { target: { value: "Joel O." } });
    expect(screen.getByText("Unsaved changes")).toBeInTheDocument();
    expect(save).toBeEnabled();

    fireEvent.click(save);
    await waitFor(() => expect(updateBranding).toHaveBeenCalledWith({ displayName: "Joel O." }));
    await waitFor(() => expect(toastSuccess).toHaveBeenCalledWith("Profile updated"));
    await waitFor(() => expect(screen.queryByRole("button", { name: /save changes/i })).not.toBeInTheDocument());
  });

  it("reverts edits with Cancel", () => {
    render(<MyAccountClient />);
    fireEvent.click(screen.getAllByLabelText("Edit")[0]);

    fireEvent.change(screen.getByLabelText("Full name"), { target: { value: "Changed" } });
    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));

    // form closes; re-open to verify value was reverted
    fireEvent.click(screen.getAllByLabelText("Edit")[0]);
    expect(screen.getByLabelText("Full name")).toHaveValue("Joel Osei Acquah");
  });

  it("gates the password update until the form is valid", () => {
    render(<MyAccountClient />);
    fireEvent.click(screen.getAllByLabelText("Edit")[1]);

    const update = screen.getByRole("button", { name: /update password/i });
    expect(update).toBeDisabled();

    fireEvent.change(screen.getByLabelText("Current password"), { target: { value: "old-pass-1" } });
    fireEvent.change(screen.getByLabelText("New password"), { target: { value: "Newpass123!" } });
    fireEvent.change(screen.getByLabelText("Confirm new password"), {
      target: { value: "Newpass123!" },
    });
    expect(screen.getByText("Passwords match.")).toBeInTheDocument();
    expect(update).toBeEnabled();

    fireEvent.click(update);
    expect(toastSuccess).toHaveBeenCalledWith("Password updated — signed out on other devices");
  });

  it("toggles a security factor between set-up and active", () => {
    render(<MyAccountClient />);
    fireEvent.click(screen.getAllByLabelText("Edit")[2]);

    const setUpButtons = screen.getAllByRole("button", { name: /set up/i });
    fireEvent.click(setUpButtons[0]);
    expect(toastSuccess).toHaveBeenCalledWith("Second factor enabled");
    expect(screen.getByRole("button", { name: /manage/i })).toBeInTheDocument();
  });
});

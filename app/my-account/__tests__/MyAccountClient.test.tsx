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

const { update, signIn, signOut, routerRefresh } = vi.hoisted(() => ({
  update: vi.fn(),
  signIn: vi.fn(),
  signOut: vi.fn(),
  routerRefresh: vi.fn(),
}));

vi.mock("next-auth/react", () => ({
  useSession: () => ({ update }),
  signIn,
  signOut,
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: routerRefresh }),
}));

const actions = vi.hoisted(() => ({
  updateName: vi.fn(),
  requestEmailChange: vi.fn(),
  confirmEmailChange: vi.fn(),
  cancelEmailChange: vi.fn(),
  resendEmailChangeCode: vi.fn(),
  changePassword: vi.fn(),
  setPassword: vi.fn(),
  armOAuthDeletion: vi.fn(),
  deleteAccount: vi.fn(),
}));
vi.mock("@/app/actions/account", () => actions);

const { toastSuccess, toastError } = vi.hoisted(() => ({
  toastSuccess: vi.fn(),
  toastError: vi.fn(),
}));
vi.mock("sonner", () => ({ toast: { success: toastSuccess, error: toastError } }));

const credentialInitial = {
  name: "Joel Osei Acquah",
  email: "joel@linkhub.co",
  pendingEmail: null,
  hasPassword: true,
};

describe("MyAccountClient", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    update.mockResolvedValue(undefined);
    signOut.mockResolvedValue(undefined);
  });

  it("renders the account page with its sections", () => {
    render(<MyAccountClient initial={credentialInitial} />);
    expect(screen.getByRole("main")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /my account/i })).toBeInTheDocument();
    expect(screen.getByText("Personal info")).toBeInTheDocument();
    expect(screen.getByText("Change password")).toBeInTheDocument();
    expect(screen.getByText("Security")).toBeInTheDocument();
    expect(screen.getByText("Danger zone")).toBeInTheDocument();
    // current email rendered read-only
    expect(screen.getByText("joel@linkhub.co")).toBeInTheDocument();
  });

  it("saves the name via updateName and refreshes the session", async () => {
    actions.updateName.mockResolvedValue({ success: true });
    render(<MyAccountClient initial={credentialInitial} />);
    fireEvent.click(screen.getAllByLabelText("Edit")[0]);

    const save = screen.getByRole("button", { name: /save changes/i });
    expect(save).toBeDisabled();

    fireEvent.change(screen.getByLabelText("Full name"), { target: { value: "Joel O." } });
    expect(save).toBeEnabled();

    fireEvent.click(save);
    await waitFor(() => expect(actions.updateName).toHaveBeenCalledWith("Joel O."));
    await waitFor(() => expect(update).toHaveBeenCalledWith({ name: "Joel O." }));
    await waitFor(() => expect(toastSuccess).toHaveBeenCalledWith("Name updated"));
  });

  it("runs the email-change code flow", async () => {
    actions.requestEmailChange.mockResolvedValue({ success: true });
    actions.confirmEmailChange.mockResolvedValue({ success: true, email: "new@linkhub.co" });
    render(<MyAccountClient initial={credentialInitial} />);

    fireEvent.click(screen.getByRole("button", { name: /change email/i }));
    fireEvent.change(screen.getByLabelText("New email address"), { target: { value: "new@linkhub.co" } });
    fireEvent.click(screen.getByRole("button", { name: /send code/i }));

    await waitFor(() => expect(actions.requestEmailChange).toHaveBeenCalledWith("new@linkhub.co"));
    // pending banner appears with code entry
    const codeInput = await screen.findByLabelText("Verification code");
    fireEvent.change(codeInput, { target: { value: "123456" } });
    fireEvent.click(screen.getByRole("button", { name: /^confirm$/i }));

    await waitFor(() => expect(actions.confirmEmailChange).toHaveBeenCalledWith("123456"));
    await waitFor(() => expect(update).toHaveBeenCalledWith({ email: "new@linkhub.co" }));
  });

  it("shows the pending banner immediately when initial.pendingEmail is set", () => {
    render(<MyAccountClient initial={{ ...credentialInitial, pendingEmail: "pending@linkhub.co" }} />);
    expect(screen.getByText(/pending@linkhub.co/)).toBeInTheDocument();
    expect(screen.getByLabelText("Verification code")).toBeInTheDocument();
  });

  it("gates and submits the change-password form", async () => {
    actions.changePassword.mockResolvedValue({ success: true });
    render(<MyAccountClient initial={credentialInitial} />);
    fireEvent.click(screen.getAllByLabelText("Edit")[1]);

    const update_ = screen.getByRole("button", { name: /update password/i });
    expect(update_).toBeDisabled();

    fireEvent.change(screen.getByLabelText("Current password"), { target: { value: "old-pass-1" } });
    fireEvent.change(screen.getByLabelText("New password"), { target: { value: "Newpass123!" } });
    fireEvent.change(screen.getByLabelText("Confirm new password"), { target: { value: "Newpass123!" } });
    expect(update_).toBeEnabled();

    fireEvent.click(update_);
    await waitFor(() => expect(actions.changePassword).toHaveBeenCalledWith("old-pass-1", "Newpass123!"));
    await waitFor(() => expect(toastSuccess).toHaveBeenCalledWith("Password updated"));
  });

  it("shows a set-password form for OAuth-only users", async () => {
    actions.setPassword.mockResolvedValue({ success: true });
    render(<MyAccountClient initial={{ ...credentialInitial, hasPassword: false }} />);
    expect(screen.getByText("Set a password")).toBeInTheDocument();
    expect(screen.getByText(/No password set/i)).toBeInTheDocument();

    fireEvent.click(screen.getAllByLabelText("Edit")[1]);
    expect(screen.queryByLabelText("Current password")).not.toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("New password"), { target: { value: "Newpass123!" } });
    fireEvent.change(screen.getByLabelText("Confirm new password"), { target: { value: "Newpass123!" } });
    fireEvent.click(screen.getByRole("button", { name: /set password/i }));
    await waitFor(() => expect(actions.setPassword).toHaveBeenCalledWith("Newpass123!"));
  });

  it("arms and runs credential account deletion, then signs out", async () => {
    actions.deleteAccount.mockResolvedValue({ success: true });
    render(<MyAccountClient initial={credentialInitial} />);

    fireEvent.click(screen.getByRole("button", { name: /^delete account$/i }));
    // Once open, both the danger-zone trigger and the dialog confirm read
    // "Delete account"; the dialog one is rendered later in the DOM.
    const confirm = screen.getAllByRole("button", { name: /^delete account$/i })[1];
    // disabled until email matches + password entered
    expect(confirm).toBeDisabled();

    fireEvent.change(screen.getByLabelText(/type your email/i), { target: { value: "joel@linkhub.co" } });
    fireEvent.change(screen.getByLabelText(/current password/i), { target: { value: "my-pass" } });
    expect(confirm).toBeEnabled();

    fireEvent.click(confirm);
    await waitFor(() =>
      expect(actions.deleteAccount).toHaveBeenCalledWith({ typedEmail: "joel@linkhub.co", password: "my-pass" })
    );
    await waitFor(() => expect(signOut).toHaveBeenCalledWith({ callbackUrl: "/login" }));
  });

  it("starts a Google re-prompt for OAuth-only account deletion", async () => {
    actions.armOAuthDeletion.mockResolvedValue({ nonce: "abc123" });
    render(<MyAccountClient initial={{ ...credentialInitial, hasPassword: false }} />);

    fireEvent.click(screen.getByRole("button", { name: /^delete account$/i }));
    fireEvent.change(screen.getByLabelText(/type your email/i), { target: { value: "joel@linkhub.co" } });
    fireEvent.click(screen.getByRole("button", { name: /continue with google/i }));

    await waitFor(() => expect(actions.armOAuthDeletion).toHaveBeenCalled());
    await waitFor(() =>
      expect(signIn).toHaveBeenCalledWith(
        "google",
        { callbackUrl: "/my-account?del=abc123" },
        { prompt: "consent select_account" }
      )
    );
    expect(actions.deleteAccount).not.toHaveBeenCalled();
  });

  it("toggles a security factor between set-up and active", () => {
    render(<MyAccountClient initial={credentialInitial} />);
    fireEvent.click(screen.getAllByLabelText("Edit")[2]);

    const setUpButtons = screen.getAllByRole("button", { name: /set up/i });
    fireEvent.click(setUpButtons[0]);
    expect(toastSuccess).toHaveBeenCalledWith("Second factor enabled");
    expect(screen.getByRole("button", { name: /manage/i })).toBeInTheDocument();
  });
});

import { describe, expect, it, vi, beforeEach } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import LoginPage from "../page";
import { checkUserExists } from "@/app/actions/auth";
import { executeRecaptcha } from "@/lib/recaptcha.client";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("next-auth", () => ({
  AuthError: class AuthError extends Error {},
}));

vi.mock("next-auth/react", () => ({
  signIn: vi.fn(),
  useSession: () => ({ update: vi.fn() }),
}));

vi.mock("@/app/actions/auth", () => ({
  checkUserExists: vi.fn(),
  loginWithCredentials: vi.fn(),
  registerUser: vi.fn(),
  resendVerificationCode: vi.fn(),
  sendVerificationCode: vi.fn(),
}));

vi.mock("@/lib/recaptcha.client", () => ({
  executeRecaptcha: vi.fn().mockResolvedValue("recaptcha-token"),
  RecaptchaError: class RecaptchaError extends Error {},
}));

vi.mock("@/app/components/auth/AuthShell", () => ({
  AuthShell: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock("@/app/components/auth/GoogleAuthButton", () => ({
  GoogleAuthButton: () => null,
}));

vi.mock("@/app/components/auth/AccountNotFoundModal", () => ({
  AccountNotFoundModal: () => null,
}));

vi.mock("@/app/components/auth/UnverifiedEmailModal", () => ({
  UnverifiedEmailModal: () => null,
}));

describe("LoginPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("checks email with recaptcha on continue", async () => {
    vi.mocked(checkUserExists).mockResolvedValue({ exists: true });

    render(<LoginPage />);

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "user@example.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: /continue/i }));

    await waitFor(() => {
      expect(executeRecaptcha).toHaveBeenCalledWith("check_email");
      expect(checkUserExists).toHaveBeenCalledWith("user@example.com", "recaptcha-token");
    });
  });
});

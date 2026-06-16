import { describe, expect, it, vi, beforeEach } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import SignupPage from "../page";
import { checkUserExists } from "@/app/actions/auth";
import { executeRecaptcha } from "@/lib/recaptcha.client";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("next-auth/react", () => ({
  signIn: vi.fn(),
}));

vi.mock("@/app/actions/auth", () => ({
  registerUser: vi.fn(),
  checkUserExists: vi.fn(),
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

describe("SignupPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("checks email with recaptcha on blur", async () => {
    vi.mocked(checkUserExists).mockResolvedValue({ exists: false });

    render(<SignupPage />);

    const emailInput = screen.getByLabelText(/email/i);
    fireEvent.change(emailInput, { target: { value: "new@example.com" } });
    fireEvent.blur(emailInput);

    await waitFor(() => {
      expect(executeRecaptcha).toHaveBeenCalledWith("check_email");
      expect(checkUserExists).toHaveBeenCalledWith("new@example.com", "recaptcha-token");
    });
  });
});

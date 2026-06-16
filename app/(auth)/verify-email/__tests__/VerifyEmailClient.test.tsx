import { describe, expect, it, vi, beforeEach } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import VerifyEmailClient from "../VerifyEmailClient";
import { sendVerificationCode, verifyEmailCode } from "@/app/actions/auth";
import { executeRecaptcha } from "@/lib/recaptcha.client";
import { signIn } from "next-auth/react";

const { mockSearchParams } = vi.hoisted(() => ({
  mockSearchParams: vi.fn(() => new URLSearchParams("email=test@example.com")),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
    back: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => "/verify-email",
  useSearchParams: mockSearchParams,
}));

vi.mock("next-auth/react", () => ({
  signIn: vi.fn(),
  useSession: () => ({
    data: { user: { id: "u1", name: "Test User", email: "test@example.com" } },
    status: "authenticated",
    update: vi.fn(),
  }),
}));

vi.mock("@/app/actions/auth", () => ({
  sendVerificationCode: vi.fn().mockResolvedValue({ success: true }),
  verifyEmailCode: vi.fn(),
  resendVerificationCode: vi.fn(),
}));

vi.mock("@/lib/recaptcha.client", () => ({
  executeRecaptcha: vi.fn().mockResolvedValue("recaptcha-token"),
  RecaptchaError: class RecaptchaError extends Error {},
}));

vi.mock("@/app/components/auth/AuthShell", () => ({
  AuthShell: ({
    children,
    panelTitle,
  }: {
    children: React.ReactNode;
    panelTitle?: string;
  }) => (
    <div>
      {panelTitle && <h1>{panelTitle}</h1>}
      {children}
    </div>
  ),
}));

function fillDigits(value: string) {
  const inputs = screen.getAllByLabelText(/Digit \d of 6/);
  value.split("").forEach((char, i) => {
    fireEvent.change(inputs[i], { target: { value: char } });
  });
  return inputs;
}

describe("VerifyEmailClient", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchParams.mockReturnValue(new URLSearchParams("email=test@example.com"));
  });

  it("renders verification form for email from search params", () => {
    render(<VerifyEmailClient />);
    expect(screen.getByText("Keep Your Account Secure")).toBeInTheDocument();
    expect(screen.getByText("Verify & Continue")).toBeInTheDocument();
    expect(screen.getByText("Resend Code")).toBeInTheDocument();
  });

  it("submits the code when Enter is pressed in a digit input", async () => {
    vi.mocked(verifyEmailCode).mockResolvedValue({ success: true, autoLoginToken: "t" });
    vi.mocked(signIn).mockResolvedValue({ ok: true } as never);

    render(<VerifyEmailClient />);
    const inputs = fillDigits("123456");
    fireEvent.keyDown(inputs[5], { key: "Enter" });

    await waitFor(() =>
      expect(verifyEmailCode).toHaveBeenCalledWith("test@example.com", "123456", "recaptcha-token"),
    );
  });

  it("does not submit on Enter when the code is incomplete", () => {
    render(<VerifyEmailClient />);
    const inputs = fillDigits("123");
    fireEvent.keyDown(inputs[2], { key: "Enter" });

    expect(verifyEmailCode).not.toHaveBeenCalled();
  });

  it("auto-sends verification code with recaptcha when redirected from login", async () => {
    mockSearchParams.mockReturnValue(
      new URLSearchParams("email=test@example.com&source=login")
    );

    render(<VerifyEmailClient />);

    await waitFor(() => {
      expect(executeRecaptcha).toHaveBeenCalledWith("send_verification");
      expect(sendVerificationCode).toHaveBeenCalledWith("test@example.com", "recaptcha-token");
    });
  });
});

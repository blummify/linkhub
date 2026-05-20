import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import VerifyEmailClient from "../VerifyEmailClient";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
    back: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => "/verify-email",
  useSearchParams: () => new URLSearchParams("email=test@example.com"),
}));

vi.mock("next-auth/react", () => ({
  signIn: vi.fn(),
}));

vi.mock("@/app/actions/auth", () => ({
  sendVerificationCode: vi.fn().mockResolvedValue({ success: true }),
  verifyEmailCode: vi.fn(),
  resendVerificationCode: vi.fn(),
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

describe("VerifyEmailClient", () => {
  it("renders verification form for email from search params", () => {
    render(<VerifyEmailClient />);
    expect(screen.getByText("Keep Your Account Secure")).toBeInTheDocument();
    expect(screen.getByText("Verify & Continue")).toBeInTheDocument();
    expect(screen.getByText("Resend Code")).toBeInTheDocument();
  });
});

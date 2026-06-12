import { describe, expect, it, vi, beforeEach } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { ResetPasswordClient } from "../ResetPasswordClient";
import { resetPassword } from "@/app/actions/auth";
import { executeRecaptcha } from "@/lib/recaptcha.client";

vi.mock("@/app/actions/auth", () => ({
  resetPassword: vi.fn(),
}));

vi.mock("@/lib/recaptcha.client", () => ({
  executeRecaptcha: vi.fn().mockResolvedValue("recaptcha-token"),
  RecaptchaError: class RecaptchaError extends Error {},
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

describe("ResetPasswordClient", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders password fields when token is valid", () => {
    render(
      <ResetPasswordClient token="tok" initialState="valid" tokenError="" />
    );
    expect(screen.getByLabelText("New Password")).toBeInTheDocument();
    expect(screen.getByLabelText("Confirm Password")).toBeInTheDocument();
  });

  it("shows error state for invalid token", () => {
    render(
      <ResetPasswordClient
        token={null}
        initialState="invalid"
        tokenError="This reset link is invalid."
      />
    );
    expect(screen.getByText("Invalid Link")).toBeInTheDocument();
  });

  it("passes recaptcha token to resetPassword on submit", async () => {
    vi.mocked(resetPassword).mockResolvedValue({ success: true });

    render(
      <ResetPasswordClient token="tok" initialState="valid" tokenError="" />
    );

    fireEvent.change(screen.getByLabelText("New Password"), {
      target: { value: "Newpass123!" },
    });
    fireEvent.change(screen.getByLabelText("Confirm Password"), {
      target: { value: "Newpass123!" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Reset Password" }));

    await waitFor(() => {
      expect(executeRecaptcha).toHaveBeenCalledWith("reset_password");
      expect(resetPassword).toHaveBeenCalledWith("tok", "Newpass123!", "recaptcha-token");
    });
  });
});

import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ResetPasswordClient } from "../ResetPasswordClient";

vi.mock("@/app/actions/auth", () => ({
  resetPassword: vi.fn(),
}));

describe("ResetPasswordClient", () => {
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
});

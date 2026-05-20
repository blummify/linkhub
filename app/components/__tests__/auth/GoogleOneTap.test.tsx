import { describe, expect, it, vi, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { GoogleOneTap } from "../../auth/GoogleOneTap";

vi.mock("next-auth/react", () => ({
  signIn: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/app/actions/auth", () => ({
  signInWithGoogleOneTap: vi.fn(),
}));

describe("GoogleOneTap", () => {
  beforeEach(() => {
    document.querySelectorAll('script[src*="accounts.google.com"]').forEach((el) => el.remove());
  });

  it("renders nothing visible", () => {
    const { container } = render(<GoogleOneTap clientId="" />);
    expect(container).toBeEmptyDOMElement();
  });

  it("does not inject script when clientId is empty", () => {
    render(<GoogleOneTap clientId="" />);
    expect(
      document.querySelector('script[src*="accounts.google.com"]')
    ).toBeNull();
  });
});

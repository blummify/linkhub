import { describe, expect, it, vi, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { act } from "react";
import { GoogleOneTap } from "../../auth/GoogleOneTap";
import { signInWithGoogleOneTap } from "@/app/actions/auth";
import { mockRouterPush } from "../../../../vitest.setup";

vi.mock("next-auth/react", () => ({
  signIn: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/app/actions/auth", () => ({
  signInWithGoogleOneTap: vi.fn(),
}));

describe("GoogleOneTap", () => {
  beforeEach(() => {
    document.querySelectorAll('script[src*="accounts.google.com"]').forEach((el) => el.remove());
    delete (window as { google?: unknown }).google;
    mockRouterPush.mockClear();
    vi.mocked(signInWithGoogleOneTap).mockReset();
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

  it("redirects to /login with the pending token when 2FA is required", async () => {
    vi.mocked(signInWithGoogleOneTap).mockResolvedValue({
      requiresTwoFactor: true,
      pendingToken: "abc123",
    });

    let credentialCallback: ((res: { credential: string }) => void) | undefined;
    window.google = {
      accounts: {
        id: {
          initialize: vi.fn((config: object) => {
            credentialCallback = (
              config as { callback: (res: { credential: string }) => void }
            ).callback;
          }),
          prompt: vi.fn(),
          cancel: vi.fn(),
        },
      },
    };

    render(<GoogleOneTap clientId="test-client-id" />);

    const script = document.querySelector<HTMLScriptElement>(
      'script[src="https://accounts.google.com/gsi/client"]'
    );
    expect(script).not.toBeNull();

    await act(async () => {
      script?.dispatchEvent(new Event("load"));
    });

    expect(credentialCallback).toBeDefined();

    await act(async () => {
      await credentialCallback?.({ credential: "fake-jwt" });
    });

    expect(signInWithGoogleOneTap).toHaveBeenCalledWith("fake-jwt");
    expect(mockRouterPush).toHaveBeenCalledWith("/login?2fa=abc123");
  });
});

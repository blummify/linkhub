import { beforeEach, describe, expect, it, vi } from "vitest";

// Run the deferred email immediately so it can be asserted.
vi.mock("next/server", () => ({ after: (callback: () => unknown) => callback() }));

interface SendPayload {
  template: string;
  to: string[];
  data: { resetUrl: string; name: string; email: string; expiresInHours: number };
}

const { send } = vi.hoisted(() => ({
  send: vi.fn<(payload: SendPayload) => Promise<{ ok: boolean }>>(async () => ({ ok: true })),
}));
vi.mock("@/lib/postly", () => ({ postly: { send } }));

import { issuePasswordReset, resetBaseUrl } from "../passwordReset";

const deleteMany = vi.fn();
const create = vi.fn();
const client = { passwordResetToken: { deleteMany, create } } as never;

const RECIPIENT = { id: "usr_1", email: "joel@x.com", name: "Joel" };

beforeEach(() => {
  vi.clearAllMocks();
  vi.unstubAllEnvs();
});

describe("issuePasswordReset", () => {
  it("replaces existing tokens with a fresh hashed one", async () => {
    await issuePasswordReset(client, RECIPIENT);

    expect(deleteMany).toHaveBeenCalledWith({ where: { userId: "usr_1" } });
    const data = create.mock.calls[0][0].data;
    expect(data.userId).toBe("usr_1");
    // Stored as a sha256 hex digest, never the raw token.
    expect(data.tokenHash).toMatch(/^[a-f0-9]{64}$/);
    expect(data.expiresAt.getTime()).toBeGreaterThan(Date.now());
  });

  it("emails a reset link containing the raw (unhashed) token", async () => {
    await issuePasswordReset(client, RECIPIENT);

    const payload = send.mock.calls[0][0];
    expect(payload.to).toEqual(["joel@x.com"]);
    const token = new URL(payload.data.resetUrl).searchParams.get("token");
    expect(token).toMatch(/^[a-f0-9]{64}$/);
    expect(token).not.toBe(create.mock.calls[0][0].data.tokenHash);
    expect(payload.data.name).toBe("Joel");
  });

  it("falls back to a friendly name for unnamed users", async () => {
    await issuePasswordReset(client, { ...RECIPIENT, name: null });
    expect(send.mock.calls[0][0].data.name).toBe("there");
  });
});

describe("resetBaseUrl", () => {
  it("prefers NEXTAUTH_URL, then the public domain, then localhost", () => {
    vi.stubEnv("NEXTAUTH_URL", "https://auth.example.com");
    expect(resetBaseUrl()).toBe("https://auth.example.com");

    vi.stubEnv("NEXTAUTH_URL", undefined);
    vi.stubEnv("NEXT_PUBLIC_APP_DOMAIN", "getlinkhub.app");
    expect(resetBaseUrl()).toBe("https://getlinkhub.app");
  });
});

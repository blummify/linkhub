import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { verifyRecaptcha } from "../recaptcha.server";

describe("verifyRecaptcha", () => {
  beforeEach(() => {
    vi.stubEnv("RECAPTCHA_SECRET_KEY", "test-secret");
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, score: 0.9, action: "login" }),
      })
    );
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("throws on empty token", async () => {
    await expect(verifyRecaptcha("", "login")).rejects.toThrow("reCAPTCHA validation failed.");
  });

  it("throws when verification fails", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: false }),
    } as Response);

    await expect(verifyRecaptcha("token", "login")).rejects.toThrow("reCAPTCHA validation failed.");
  });

  it("throws on low score", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, score: 0.2, action: "login" }),
    } as Response);

    await expect(verifyRecaptcha("token", "login")).rejects.toThrow("reCAPTCHA score too low.");
  });

  it("throws on action mismatch", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, score: 0.9, action: "signup" }),
    } as Response);

    await expect(verifyRecaptcha("token", "login")).rejects.toThrow("reCAPTCHA action mismatch.");
  });

  it("passes on valid response", async () => {
    await expect(verifyRecaptcha("token", "login")).resolves.toBeUndefined();
  });
});

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { generateSync } from "otplib";
import {
  generateTotpSecret,
  generateOtpAuthUrl,
  verifyTotpCode,
  encryptTotpSecret,
  decryptTotpSecret,
} from "../totp";

const VALID_KEY = "a".repeat(64);

describe("generateTotpSecret", () => {
  it("returns a base32-encoded secret", () => {
    const secret = generateTotpSecret();
    expect(secret).toMatch(/^[A-Z2-7]+$/);
    expect(secret.length).toBeGreaterThanOrEqual(16);
  });

  it("returns a different secret on each call", () => {
    expect(generateTotpSecret()).not.toBe(generateTotpSecret());
  });
});

describe("generateOtpAuthUrl", () => {
  it("returns an otpauth URI containing the issuer, label, and secret", () => {
    const secret = generateTotpSecret();
    const url = generateOtpAuthUrl("user@example.com", secret);
    expect(url).toMatch(/^otpauth:\/\/totp\//);
    expect(url).toContain("LinkHub");
    expect(url).toContain(encodeURIComponent("user@example.com"));
    expect(url).toContain(`secret=${secret}`);
  });
});

describe("verifyTotpCode", () => {
  it("returns true for a currently valid code", () => {
    const secret = generateTotpSecret();
    const token = generateSync({ secret });
    expect(verifyTotpCode(secret, token)).toBe(true);
  });

  it("ignores surrounding whitespace in the code", () => {
    const secret = generateTotpSecret();
    const token = generateSync({ secret });
    expect(verifyTotpCode(secret, ` ${token} `)).toBe(true);
  });

  it("returns false for an incorrect code", () => {
    const secret = generateTotpSecret();
    const valid = generateSync({ secret });
    const invalid = valid[0] === "0" ? `1${valid.slice(1)}` : `0${valid.slice(1)}`;
    expect(verifyTotpCode(secret, invalid)).toBe(false);
  });

  it("returns false instead of throwing for an invalid secret", () => {
    expect(verifyTotpCode("", "123456")).toBe(false);
  });
});

describe("encryptTotpSecret / decryptTotpSecret", () => {
  const original = process.env.TOTP_ENCRYPTION_KEY;

  beforeAll(() => {
    process.env.TOTP_ENCRYPTION_KEY = VALID_KEY;
  });

  afterAll(() => {
    if (original === undefined) delete process.env.TOTP_ENCRYPTION_KEY;
    else process.env.TOTP_ENCRYPTION_KEY = original;
  });

  it("round-trips a secret", () => {
    const secret = generateTotpSecret();
    expect(decryptTotpSecret(encryptTotpSecret(secret))).toBe(secret);
  });

  it("produces a different ciphertext each time (random IV)", () => {
    const secret = generateTotpSecret();
    expect(encryptTotpSecret(secret)).not.toBe(encryptTotpSecret(secret));
  });

  it("throws when TOTP_ENCRYPTION_KEY is missing or the wrong length", () => {
    delete process.env.TOTP_ENCRYPTION_KEY;
    expect(() => encryptTotpSecret("secret")).toThrow(
      "TOTP_ENCRYPTION_KEY must be a 64-char hex string (32 bytes)"
    );
    process.env.TOTP_ENCRYPTION_KEY = VALID_KEY;
  });

  it("throws on a malformed encrypted payload", () => {
    expect(() => decryptTotpSecret("not-a-valid-payload")).toThrow(
      "Invalid encrypted TOTP secret format"
    );
  });

  it("throws when the ciphertext has been tampered with", () => {
    const encrypted = encryptTotpSecret("a-secret");
    const [iv, tag, ct] = encrypted.split(":");
    const flippedByte = ct.slice(-2) === "00" ? "ff" : "00";
    const tampered = [iv, tag, ct.slice(0, -2) + flippedByte].join(":");
    expect(() => decryptTotpSecret(tampered)).toThrow();
  });
});

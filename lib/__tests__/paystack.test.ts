import { describe, it, expect } from "vitest";
import { createHmac } from "crypto";
import { verifyWebhookSignature } from "../paystack";

const SECRET = "test_webhook_secret_key";
const BODY = JSON.stringify({ event: "charge.success", data: { id: 123 } });

function sign(body: string, secret = SECRET): string {
  return createHmac("sha512", secret).update(body).digest("hex");
}

describe("verifyWebhookSignature", () => {
  it("returns true for a correctly signed body", () => {
    process.env.PAYSTACK_WEBHOOK_SECRET = SECRET;
    expect(verifyWebhookSignature(BODY, sign(BODY))).toBe(true);
  });

  it("returns false when the signature is wrong", () => {
    process.env.PAYSTACK_WEBHOOK_SECRET = SECRET;
    expect(verifyWebhookSignature(BODY, sign(BODY, "wrong_secret"))).toBe(false);
  });

  it("returns false when the signature is an empty string", () => {
    process.env.PAYSTACK_WEBHOOK_SECRET = SECRET;
    expect(verifyWebhookSignature(BODY, "")).toBe(false);
  });

  it("returns false when the body has been tampered after signing", () => {
    process.env.PAYSTACK_WEBHOOK_SECRET = SECRET;
    const original = sign(BODY);
    const tamperedBody = BODY.replace("charge.success", "subscription.disable");
    expect(verifyWebhookSignature(tamperedBody, original)).toBe(false);
  });

  it("returns false when PAYSTACK_WEBHOOK_SECRET is not set", () => {
    delete process.env.PAYSTACK_WEBHOOK_SECRET;
    expect(verifyWebhookSignature(BODY, sign(BODY))).toBe(false);
  });
});

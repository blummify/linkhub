/**
 * SERVER-ONLY — never import from a "use client" file.
 * All Paystack API calls and the webhook signature verifier live here.
 * The secret key is read once at module load; any client-side import will throw at build time.
 */

import { createHmac, timingSafeEqual } from "crypto";

const BASE_URL = "https://api.paystack.co";

function getSecret(): string {
  const key = process.env.PAYSTACK_SECRET_KEY;
  if (!key) throw new Error("PAYSTACK_SECRET_KEY is not set");
  return key;
}

function getWebhookSecret(): string {
  const key = process.env.PAYSTACK_WEBHOOK_SECRET;
  if (!key) throw new Error("PAYSTACK_WEBHOOK_SECRET is not set");
  return key;
}

/* ── Signature verification ──────────────────────────────────────────────────
   Uses timingSafeEqual to prevent timing-attack leaks.
   Call this with the RAW request body string (before JSON.parse).
*/
export function verifyWebhookSignature(rawBody: string, signature: string): boolean {
  if (!signature) return false;
  try {
    const secret = getWebhookSecret();
    const expected = createHmac("sha512", secret).update(rawBody).digest("hex");
    const expectedBuf = Buffer.from(expected, "hex");
    const signatureBuf = Buffer.from(signature, "hex");
    if (expectedBuf.length !== signatureBuf.length) return false;
    return timingSafeEqual(expectedBuf, signatureBuf);
  } catch {
    return false;
  }
}

/* ── Internal fetch helper ───────────────────────────────────────────────────
   Attaches the Bearer token. Throws a typed error on non-2xx responses.
   Never called from client code.
*/
async function paystackFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Authorization": `Bearer ${getSecret()}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ message: "Unknown error" }));
    throw new Error(
      `Paystack API error ${res.status}: ${(body as { message?: string }).message ?? res.statusText}`
    );
  }

  return res.json() as Promise<T>;
}

/* ── Transaction initialization ─────────────────────────────────────────────
   Creates a checkout session. Returns only the URL and reference — callers
   must NOT forward the full Paystack response to the client.
*/
export async function initializeTransaction(params: {
  email: string;
  amount: number;   // in kobo (GHS pesewas) — integer
  planCode: string;
  callbackUrl: string;
  metadata?: Record<string, string>;
}): Promise<{ authorizationUrl: string; reference: string }> {
  const data = await paystackFetch<{
    status: boolean;
    data: { authorization_url: string; reference: string };
  }>("/transaction/initialize", {
    method: "POST",
    body: JSON.stringify({
      email: params.email,
      amount: params.amount,
      plan: params.planCode,
      callback_url: params.callbackUrl,
      metadata: params.metadata,
    }),
  });

  return {
    authorizationUrl: data.data.authorization_url,
    reference: data.data.reference,
  };
}

/* ── Subscription management ─────────────────────────────────────────────── */
export async function disableSubscription(params: {
  code: string;
  token: string;
}): Promise<void> {
  await paystackFetch("/subscription/disable", {
    method: "POST",
    body: JSON.stringify({ code: params.code, token: params.token }),
  });
}

/* ── Transaction history (for invoices) ─────────────────────────────────── */
export interface PaystackTransaction {
  reference: string;
  amount: number;
  status: "success" | "failed" | "pending";
  paid_at: string;
  invoice_url?: string | null;
}

export async function listCustomerTransactions(
  customerCode: string,
  perPage = 12
): Promise<PaystackTransaction[]> {
  const data = await paystackFetch<{
    status: boolean;
    data: PaystackTransaction[];
  }>(`/transaction?customer=${customerCode}&perPage=${perPage}`);

  return data.data;
}

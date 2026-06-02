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

// timingSafeEqual prevents timing-attack leaks when comparing signatures.
// Must be called with the RAW request body (before JSON.parse).
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

export async function initializeTransaction(params: {
  email: string;
  amount: number;   // kobo / pesewas — must be an integer
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

export async function disableSubscription(params: {
  code: string;
  token: string;
}): Promise<void> {
  await paystackFetch("/subscription/disable", {
    method: "POST",
    body: JSON.stringify({ code: params.code, token: params.token }),
  });
}

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

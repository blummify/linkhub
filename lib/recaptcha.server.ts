export type RecaptchaAction =
  | "signup"
  | "login"
  | "forgot_password"
  | "verify_email"
  | "resend_verification"
  | "reset_password"
  | "check_email"
  | "send_verification";

interface RecaptchaVerifyResponse {
  success: boolean;
  score?: number;
  action?: string;
  challenge_ts?: string;
  hostname?: string;
  "error-codes"?: string[];
}

function isInfrastructureError(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }

  return (
    error.name === "AbortError" ||
    error instanceof TypeError ||
    error.message.includes("Failed to fetch") ||
    error.message.includes("network") ||
    error.message.includes("NetworkError") ||
    error.message.includes("timeout")
  );
}

export async function verifyRecaptcha(
  token: string,
  expectedAction: RecaptchaAction
): Promise<void> {
  if (!token?.trim()) {
    throw new Error("reCAPTCHA validation failed.");
  }

  const secret = process.env.RECAPTCHA_SECRET_KEY;
  if (!secret) {
    throw new Error("Missing reCAPTCHA secret key.");
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);

  try {
    const response = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({ secret, response: token }),
      signal: controller.signal,
    });

    if (!response.ok) {
      return;
    }

    let data: RecaptchaVerifyResponse;
    try {
      data = (await response.json()) as RecaptchaVerifyResponse;
    } catch {
      return;
    }

    if (!data.success) {
      throw new Error("reCAPTCHA validation failed.");
    }

    if (typeof data.score !== "number" || data.score < 0.5) {
      throw new Error("reCAPTCHA score too low.");
    }

    if (data.action !== expectedAction) {
      throw new Error("reCAPTCHA action mismatch.");
    }
  } catch (error) {
    if (isInfrastructureError(error)) {
      return;
    }

    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

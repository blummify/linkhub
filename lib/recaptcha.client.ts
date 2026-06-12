export type RecaptchaAction =
  | "signup"
  | "login"
  | "forgot_password"
  | "verify_email"
  | "resend_verification"
  | "reset_password"
  | "check_email"
  | "send_verification";

const SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
const SCRIPT_LOAD_TIMEOUT_MS = 3000;

interface GrecaptchaApi {
  ready: (cb: () => void) => void;
  execute: (siteKey: string, options: { action: string }) => string | Promise<string>;
}

export class RecaptchaError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RecaptchaError";
  }
}

function getGreCaptcha() {
  if (typeof window === "undefined") {
    return undefined;
  }

  return (window as Window & { grecaptcha?: GrecaptchaApi }).grecaptcha;
}

export async function waitForGreCaptchaReady(): Promise<void> {
  if (typeof window === "undefined") {
    throw new RecaptchaError("reCAPTCHA can only run in the browser.");
  }

  if (!SITE_KEY) {
    throw new RecaptchaError("Missing NEXT_PUBLIC_RECAPTCHA_SITE_KEY.");
  }

  const grecaptcha = getGreCaptcha();
  if (grecaptcha?.ready) {
    return new Promise((resolve) => grecaptcha.ready(resolve));
  }

  return new Promise((resolve, reject) => {
    const interval = window.setInterval(() => {
      const next = getGreCaptcha();
      if (next?.ready) {
        window.clearInterval(interval);
        window.clearTimeout(timeout);
        next.ready(resolve);
      }
    }, 100);

    const timeout = window.setTimeout(() => {
      window.clearInterval(interval);
      reject(new RecaptchaError("reCAPTCHA did not load in time."));
    }, SCRIPT_LOAD_TIMEOUT_MS);
  });
}

export async function executeRecaptcha(action: RecaptchaAction): Promise<string> {
  if (typeof window === "undefined") {
    throw new RecaptchaError("reCAPTCHA can only run in the browser.");
  }

  if (!SITE_KEY) {
    throw new RecaptchaError("Missing NEXT_PUBLIC_RECAPTCHA_SITE_KEY.");
  }

  await waitForGreCaptchaReady();

  const grecaptcha = getGreCaptcha();
  if (!grecaptcha?.execute) {
    throw new RecaptchaError("reCAPTCHA is not available.");
  }

  return grecaptcha.execute(SITE_KEY, { action });
}

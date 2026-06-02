export type RecaptchaAction =
  | "signup"
  | "login"
  | "forgot_password"
  | "verify_email"
  | "resend_verification";

const SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
const SCRIPT_LOAD_TIMEOUT_MS = 10000;

function getGreCaptcha() {
  if (typeof window === "undefined") {
    return undefined;
  }

  return (window as Window & { grecaptcha?: any }).grecaptcha;
}

export async function waitForGreCaptchaReady(): Promise<void> {
  if (typeof window === "undefined") {
    throw new Error("reCAPTCHA can only run in the browser.");
  }

  if (!SITE_KEY) {
    throw new Error("Missing NEXT_PUBLIC_RECAPTCHA_SITE_KEY.");
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
      reject(new Error("reCAPTCHA did not load in time."));
    }, SCRIPT_LOAD_TIMEOUT_MS);
  });
}

export async function executeRecaptcha(action: RecaptchaAction): Promise<string> {
  if (typeof window === "undefined") {
    throw new Error("reCAPTCHA can only run in the browser.");
  }

  if (!SITE_KEY) {
    throw new Error("Missing NEXT_PUBLIC_RECAPTCHA_SITE_KEY.");
  }

  await waitForGreCaptchaReady();

  const grecaptcha = getGreCaptcha();
  if (!grecaptcha?.execute) {
    throw new Error("reCAPTCHA is not available.");
  }

  return grecaptcha.execute(SITE_KEY, { action });
}

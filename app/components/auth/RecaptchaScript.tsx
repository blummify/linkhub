export function RecaptchaScript() {
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
  if (!siteKey) return null;

  return (
    <script
      src={`https://www.google.com/recaptcha/api.js?render=${siteKey}`}
      async
      defer
    />
  );
}

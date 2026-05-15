"use client";

import { useRef, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { AuthShell } from "@/app/components/auth/AuthShell";
import { sendVerificationCode, verifyEmailCode, resendVerificationCode } from "@/app/actions/auth";

const PANEL_FEATURES = [
  {
    icon: "verified_user",
    title: "Identity Verification",
    description: "Ensuring you are the one accessing your account.",
  },
  {
    icon: "security",
    title: "Anti-Phishing",
    description: "Protecting your data from unauthorized access.",
  },
  {
    icon: "notifications_active",
    title: "Real-Time Alerts",
    description: "Instant notifications for any suspicious activity.",
  },
];

export default function VerifyEmailClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const emailFromParam = searchParams.get("email");
  const fromLogin = searchParams.get("source") === "login";
  const needsResend = searchParams.get("resend") === "true" ||
    (typeof window !== "undefined" && sessionStorage.getItem("lh_verify_resend") === "1");
  const email = emailFromParam ?? "";
  const fromSignup = !!emailFromParam && !fromLogin && !needsResend;
  const autoSentRef = useRef(false);
  const cooldownTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [digits, setDigits] = useState<string[]>(Array(6).fill(""));
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [error, setError] = useState("");
  const inputRefs = useRef<(HTMLInputElement | null)[]>(Array(6).fill(null));

  const startCooldown = (seconds: number) => {
    if (cooldownTimerRef.current) clearInterval(cooldownTimerRef.current);
    setCooldown(seconds);
    cooldownTimerRef.current = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) { clearInterval(cooldownTimerRef.current!); cooldownTimerRef.current = null; return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  useEffect(() => {
    sessionStorage.removeItem("lh_verify_resend");
    return () => { if (cooldownTimerRef.current) clearInterval(cooldownTimerRef.current); };
  }, []);

  // Signup path: code was already sent — start cooldown immediately so button is locked.
  useEffect(() => {
    if (fromSignup) startCooldown(60);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Login redirect path: no code sent yet — auto-send one immediately.
  useEffect(() => {
    if (!fromLogin || !email || autoSentRef.current) return;
    autoSentRef.current = true;
    void sendVerificationCode(email).then((result) => {
      if ("error" in result) setError(result.error);
      else startCooldown(60);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDigitChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const digit = value.slice(-1);
    const next = [...digits];
    next[index] = digit;
    setDigits(next);
    setError("");
    if (digit && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    const next = Array(6).fill("");
    pasted.split("").forEach((char, i) => { next[i] = char; });
    setDigits(next);
    inputRefs.current[Math.min(pasted.length, 5)]?.focus();
  };

  const handleSubmit = async () => {
    const code = digits.join("");
    if (code.length !== 6) { setError("Please enter all 6 digits."); return; }
    setIsLoading(true);
    setError("");
    const result = await verifyEmailCode(email, code);
    if ("error" in result) {
      setError(result.error);
      setIsLoading(false);
      return;
    }
    await signIn("credentials", { email, autoLoginToken: result.autoLoginToken, redirect: false });
    router.push("/user-dashboard");
  };

  const handleResend = async () => {
    if (!email) { setError("Could not determine your email. Please return to the sign-in page."); return; }
    setIsResending(true);
    setError("");
    const result = await resendVerificationCode(email);
    setIsResending(false);
    if ("error" in result) {
      if (!result.error.startsWith("Please wait")) setError(result.error);
      return;
    }
    setDigits(Array(6).fill(""));
    startCooldown(60);
    inputRefs.current[0]?.focus();
  };

  return (
    <AuthShell
      heading="Check your inbox"
      subheading={
        <>
          We sent a 6-digit code to{" "}
          <span className="font-semibold text-gray-900 dark:text-on-surface">{email || "your email"}</span>.
          Enter it below to continue.
        </>
      }
      error={error}
      panelTitle="Keep Your Account Secure"
      panelDescription="Verifying your email keeps your account safe and protects your data."
      panelFeatures={PANEL_FEATURES}
    >
      <div className="space-y-7">
        <div className="flex gap-2" onPaste={handlePaste}>
          {digits.map((digit, i) => (
            <input
              key={i}
              ref={(el) => { inputRefs.current[i] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              aria-label={`Digit ${i + 1} of 6`}
              onChange={(e) => handleDigitChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              className={`w-16 h-16 text-center text-2xl font-black border-2 rounded-xl outline-none transition-all duration-150 ${
                digit
                  ? "border-primary bg-primary/10 text-primary dark:bg-primary/15"
                  : "border-gray-200 dark:border-outline-variant/50 bg-gray-50 dark:bg-surface-container-low text-on-surface"
              } focus:border-primary focus:ring-4 focus:ring-primary/15 focus:bg-primary/5 dark:focus:bg-primary/10`}
            />
          ))}
        </div>

        <button
          onClick={handleSubmit}
          disabled={isLoading || digits.join("").length !== 6}
          className="w-full bg-primary text-white py-3.5 px-4 rounded-lg font-bold tracking-wide hover:bg-primary/90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Verifying…
            </>
          ) : (
            <>
              Verify & Continue
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </>
          )}
        </button>

        <div className="text-center space-y-1">
          <p className="text-sm text-gray-500 dark:text-on-surface-variant">Didn&apos;t receive the code?</p>
          <button
            onClick={handleResend}
            disabled={isResending || cooldown > 0}
            className="text-sm font-semibold text-primary hover:underline disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            {isResending ? "Sending…" : cooldown > 0 ? `Resend in ${cooldown}s` : "Resend Code"}
          </button>
        </div>
      </div>
    </AuthShell>
  );
}

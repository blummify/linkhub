"use client";

import { useRef, useState, useEffect } from "react";
import { createPortal } from "react-dom";
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
  const needsResend =
    searchParams.get("resend") === "true" ||
    (typeof window !== "undefined" && sessionStorage.getItem("lh_verify_resend") === "1");
  const email = emailFromParam ?? "";
  const fromSignup = !!emailFromParam && !fromLogin && !needsResend;
  const backDestination = fromLogin
    ? "/login"
    : email
    ? `/login?email=${encodeURIComponent(email)}`
    : "/login";

  const autoSentRef = useRef(false);
  const cooldownTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const guardActiveRef = useRef(true);

  const [digits, setDigits] = useState<string[]>(Array(6).fill(""));
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [error, setError] = useState("");
  const [showExitModal, setShowExitModal] = useState(false);
  const [mounted, setMounted] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>(Array(6).fill(null));

  const startCooldown = (seconds: number) => {
    if (cooldownTimerRef.current) clearInterval(cooldownTimerRef.current);
    sessionStorage.setItem("lh_cooldown_until", String(Date.now() + seconds * 1000));
    setCooldown(seconds);
    cooldownTimerRef.current = setInterval(() => {
      setCooldown((prev: number) => {
        if (prev <= 1) {
          clearInterval(cooldownTimerRef.current!);
          cooldownTimerRef.current = null;
          sessionStorage.removeItem("lh_cooldown_until");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Mount: mark mounted, clean up session flags, restore cooldown
  useEffect(() => {
    queueMicrotask(() => setMounted(true));
    sessionStorage.removeItem("lh_verify_resend");

    const until = sessionStorage.getItem("lh_cooldown_until");
    if (until) {
      const remaining = Math.ceil((parseInt(until) - Date.now()) / 1000);
      if (remaining > 0) queueMicrotask(() => startCooldown(remaining));
      else sessionStorage.removeItem("lh_cooldown_until");
    }

    return () => {
      if (cooldownTimerRef.current) clearInterval(cooldownTimerRef.current);
    };
  }, []);

  // Signup path: code already sent — lock resend unless cooldown was already restored
  useEffect(() => {
    if (fromSignup && !sessionStorage.getItem("lh_cooldown_until")) {
      queueMicrotask(() => startCooldown(60));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Login redirect path: auto-send a code on first render
  useEffect(() => {
    if (!fromLogin || !email || autoSentRef.current) return;
    autoSentRef.current = true;
    void sendVerificationCode(email).then((result) => {
      if ("error" in result) setError(result.error);
      else startCooldown(60);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Back button guard: intercept popstate and show exit modal
  useEffect(() => {
    history.pushState(null, "", location.href);
    const onPopState = () => {
      if (!guardActiveRef.current) return;
      history.pushState(null, "", location.href);
      setShowExitModal(true);
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  // Refresh/close guard
  useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (guardActiveRef.current) e.preventDefault();
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
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
      if (result.error.includes("Too many incorrect attempts")) {
        if (cooldownTimerRef.current) clearInterval(cooldownTimerRef.current);
        cooldownTimerRef.current = null;
        sessionStorage.removeItem("lh_cooldown_until");
        setCooldown(0);
      }
      setError(result.error);
      setDigits(Array(6).fill(""));
      setTimeout(() => inputRefs.current[0]?.focus(), 0);
      setIsLoading(false);
      return;
    }
    guardActiveRef.current = false;
    const signInResult = await signIn("credentials", {
      email,
      autoLoginToken: result.autoLoginToken,
      redirect: false,
      callbackUrl: "/user-dashboard",
    });
    if (signInResult?.error) {
      setError("Your email is verified! Please log in to continue.");
      guardActiveRef.current = true;
      setIsLoading(false);
      return;
    }
    router.replace("/user-dashboard");
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

  const handleLeaveAnyway = () => {
    guardActiveRef.current = false;
    setShowExitModal(false);
    router.push(backDestination);
  };

  const handleStayAndVerify = () => {
    setShowExitModal(false);
  };

  if (!emailFromParam) {
    return (
      <AuthShell
        heading="Something went wrong"
        subheading="No email address was provided. Please return to login and try again."
        panelTitle="Keep Your Account Secure"
        panelDescription="Verifying your email keeps your account safe and protects your data."
        panelFeatures={PANEL_FEATURES}
      >
        <a
          href="/login"
          className="w-full bg-primary text-white py-3.5 px-4 rounded-lg font-bold tracking-wide hover:bg-primary/90 transition-all flex items-center justify-center gap-2"
        >
          Back to login
          <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
        </a>
      </AuthShell>
    );
  }

  return (
    <>
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
        onBackClick={() => setShowExitModal(true)}
      >
        <div className="space-y-7">
          <div className="flex gap-1.5 sm:gap-2 w-full" onPaste={handlePaste}>
            {digits.map((digit: string, i: number) => (
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
                className={`flex-1 min-w-0 h-16 text-center text-2xl font-black border-2 rounded-xl outline-none transition-all duration-150 ${
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

      {mounted && showExitModal && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={handleStayAndVerify}
          />
          <div className="relative bg-white dark:bg-surface-container rounded-3xl p-8 max-w-sm w-full shadow-2xl text-center space-y-5">
            <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-3xl text-amber-600 dark:text-amber-400">
                warning
              </span>
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-on-surface mb-2">
                Leave verification?
              </h3>
              <p className="text-sm text-gray-500 dark:text-on-surface-variant leading-relaxed">
                Your email hasn&apos;t been verified yet. You&apos;ll need to verify it before you can access your account.
              </p>
            </div>
            <div className="space-y-3">
              <button
                onClick={handleStayAndVerify}
                className="w-full bg-primary text-white py-3 px-4 rounded-xl font-semibold hover:bg-primary/90 transition-colors cursor-pointer"
              >
                Stay and verify
              </button>
              <button
                onClick={handleLeaveAnyway}
                className="w-full border border-gray-300 dark:border-outline-variant text-gray-700 dark:text-on-surface py-3 px-4 rounded-xl font-semibold hover:bg-gray-50 dark:hover:bg-surface-container-high transition-colors cursor-pointer"
              >
                Leave anyway
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}

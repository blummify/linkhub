"use client";

import { useState } from "react";
import { AccountNotFoundModal } from "@/app/components/auth/AccountNotFoundModal";
import { UnverifiedEmailModal } from "@/app/components/auth/UnverifiedEmailModal";
import Link from "next/link";
import { signIn, useSession } from "next-auth/react";
import { toast } from "sonner";
import { executeRecaptcha, RecaptchaError } from "@/lib/recaptcha.client";
import {
  checkUserExists,
  loginWithCredentials,
  registerUser,
  resendVerificationCode,
  sendVerificationCode,
} from "@/app/actions/auth";
import { verifyTotpLogin } from "@/app/actions/twoFactor";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthShell } from "@/app/components/auth/AuthShell";
import { GoogleAuthButton } from "@/app/components/auth/GoogleAuthButton";
import { PasswordField } from "@/app/components/auth/PasswordField";
import { TotpCodeInput } from "@/app/components/auth/TotpCodeInput";
import { validateEmail, validatePassword, validatePasswordMatch } from "@/lib/validation/auth.schema";

type SignupErrors = { name: string; password: string; confirmPassword: string };

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const oauthError = searchParams.get("error");
  const oauthPendingToken = searchParams.get("2fa");
  const { update: updateSession } = useSession();
  const [email, setEmail] = useState("");
  const [signupName, setSignupName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [stage, setStage] = useState<"email" | "password" | "signup" | "totp">(
    oauthPendingToken ? "totp" : "email"
  );
  const [pendingToken, setPendingToken] = useState(oauthPendingToken ?? "");
  const [totpCode, setTotpCode] = useState("");
  const [totpError, setTotpError] = useState("");
  const [useBackupCode, setUseBackupCode] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const [showUnverifiedModal, setShowUnverifiedModal] = useState(false);
  const [showNoAccountModal, setShowNoAccountModal] = useState(false);
  const [showOauthNoPasswordBanner, setShowOauthNoPasswordBanner] = useState(false);

  const [lastUsed] = useState<"google" | "email" | null>(() => {
    const saved = localStorage.getItem("lh_last_auth");
    return saved === "google" || saved === "email" ? saved : null;
  });

  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [signupErrors, setSignupErrors] = useState<SignupErrors>({
    name: "",
    password: "",
    confirmPassword: "",
  });

  const handleContinue = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validateEmail(email);
    if (err) {
      setEmailError(err);
      return;
    }
    setEmailError("");
    setIsValidating(true);

    try {
      const recaptchaToken = await executeRecaptcha("check_email");
      const result = await checkUserExists(email, recaptchaToken);
      if ("error" in result) {
        toast.error(result.error);
        return;
      }
      if (result.exists) {
        setStage("password");
      } else {
        setShowNoAccountModal(true);
      }
    } catch (error: unknown) {
      if (error instanceof RecaptchaError) {
        toast.error("Security check couldn't complete. Please refresh the page and try again.");
        return;
      }
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsValidating(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      setPasswordError("Password is required");
      return;
    }
    setPasswordError("");
    setIsValidating(true);

    try {
      const recaptchaToken = await executeRecaptcha("login");
      const result = await loginWithCredentials({ email, password, recaptchaToken });

      if (result && "requiresTwoFactor" in result) {
        setPendingToken(result.pendingToken);
        setStage("totp");
        return;
      }

      if (result && "error" in result) {
        if (result.error === "email_not_verified") {
          setShowUnverifiedModal(true);
          return;
        }
        if (result.error === "oauth_account_no_password") {
          setShowOauthNoPasswordBanner(true);
          return;
        }
        setPasswordError("Incorrect password. Please try again.");
      } else {
        localStorage.setItem("lh_last_auth", "email");
        await updateSession();
        router.push("/user-dashboard");
      }
    } catch (error: unknown) {
      if (error instanceof Error && error.message.includes("NEXT_REDIRECT")) {
        return;
      }
      if (error instanceof RecaptchaError) {
        toast.error("Security check couldn't complete. Please refresh the page and try again.");
        return;
      }
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsValidating(false);
    }
  };

  const handleEditEmail = () => {
    setStage("email");
    setPasswordError("");
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    localStorage.setItem("lh_last_auth", "google");
    try {
      await signIn("google", { callbackUrl: "/user-dashboard" });
    } catch {
      setIsGoogleLoading(false);
    }
  };

  const handleTotpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = totpCode.trim();
    if (!code) {
      setTotpError("Please enter a code.");
      return;
    }
    setTotpError("");
    setIsValidating(true);
    try {
      const result = await verifyTotpLogin(pendingToken, code);
      if ("error" in result) {
        setTotpError("Invalid code.");
        return;
      }
      const signResult = await signIn("credentials", {
        email: result.email,
        autoLoginToken: result.autoLoginToken,
        redirect: false,
      });
      if (signResult?.error) {
        toast.error("Sign-in failed. Please try again.");
        return;
      }
      localStorage.setItem("lh_last_auth", "email");
      await updateSession();
      router.push("/user-dashboard");
    } catch (err: unknown) {
      if (err instanceof Error && err.message.includes("NEXT_REDIRECT")) return;
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsValidating(false);
    }
  };

  const handleResendVerification = async () => {
    setIsResending(true);
    try {
      const recaptchaToken = await executeRecaptcha("resend_verification");
      const result = await resendVerificationCode(email, recaptchaToken);
      if ("error" in result) {
        toast.error(result.error);
      } else {
        toast.success("Verification code sent! Check your inbox.");
        router.push(`/verify-email?email=${encodeURIComponent(email)}`);
      }
    } catch (error: unknown) {
      if (error instanceof RecaptchaError) {
        toast.error("Security check couldn't complete. Please refresh the page and try again.");
        return;
      }
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  const getSignupFieldError = (
    field: keyof SignupErrors,
    value: string
  ): string => {
    switch (field) {
      case "name":
        return value.trim() ? "" : "Full name is required";
      case "password":
        return validatePassword(value);
      case "confirmPassword":
        return validatePasswordMatch(password, value);
      default:
        return "";
    }
  };

  const handleSignupBlur = (field: keyof SignupErrors, value: string) => {
    setSignupErrors((prev) => ({
      ...prev,
      [field]: getSignupFieldError(field, value),
    }));
  };

  const validateSignupAll = (): boolean => {
    const errors: SignupErrors = {
      name: getSignupFieldError("name", signupName),
      password: getSignupFieldError("password", password),
      confirmPassword: getSignupFieldError("confirmPassword", confirmPassword),
    };
    setSignupErrors(errors);
    return Object.values(errors).every((e) => !e);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateSignupAll()) return;

    setIsValidating(true);
    try {
      const recaptchaToken = await executeRecaptcha("signup");
      const result = await registerUser({
        name: signupName,
        email,
        password,
        recaptchaToken,
      });
      if (result?.error) {
        toast.error(result.error);
        return;
      }
      const sendToken = await executeRecaptcha("send_verification");
      sendVerificationCode(email, sendToken).catch(() => {});
      router.push(`/verify-email?email=${encodeURIComponent(email)}`);
    } catch (error: unknown) {
      if (error instanceof RecaptchaError) {
        toast.error("Security check couldn't complete. Please refresh the page and try again.");
        return;
      }
      toast.error("An unexpected error occurred.");
    } finally {
      setIsValidating(false);
    }
  };

  const panelFeatures = [
    { icon: "link", title: "Unlimited Links", description: "Add as many links as you need" },
    { icon: "analytics", title: "Real-time Analytics", description: "Track your link performance" },
    { icon: "palette", title: "Customizable Design", description: "Make it uniquely yours" },
  ];

  return (
    <>
    <AuthShell
      heading={
        stage === "email"
          ? "Welcome to LinkHub"
          : stage === "password"
          ? "Welcome Back"
          : stage === "totp"
          ? "Two-factor verification"
          : "Join LinkHub"
      }
      subheading={
        stage === "email"
          ? "Enter your email to get started."
          : stage === "password"
          ? "Please enter your password to continue."
          : stage === "totp"
          ? "Enter the code from your authenticator app to continue."
          : "Start your creative journey with LinkHub."
      }
      panelTitle="Connect Your World"
      panelDescription="Share all your important links in one beautiful place. Build your online presence and connect with your audience effortlessly."
      panelFeatures={panelFeatures}
    >
      <div className="space-y-6">

        {oauthError === "OAuthAccountNotLinked" && (
          <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-800/50 dark:bg-amber-900/20 px-4 py-3 text-sm text-amber-800 dark:text-amber-300">
            <span className="material-symbols-outlined text-[18px] shrink-0 mt-0.5">info</span>
            <span>
              You already have an account with this email. Please sign in with your password instead.
            </span>
          </div>
        )}

        {showUnverifiedModal && (
          <UnverifiedEmailModal
            email={email}
            isResending={isResending}
            onClose={() => setShowUnverifiedModal(false)}
            onVerify={handleResendVerification}
          />
        )}

        {showNoAccountModal && (
          <AccountNotFoundModal
            email={email}
            onClose={() => setShowNoAccountModal(false)}
          />
        )}

        {stage === "email" && (
          <form onSubmit={handleContinue} className="space-y-6 animate-stage-in" noValidate>
            <div>
              <label
                className="block text-sm font-medium text-gray-700 dark:text-on-surface mb-2"
                htmlFor="email"
              >
                Email Address
              </label>
              <input
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-surface-container-low dark:text-on-surface ${
                  emailError
                    ? "border-red-400 dark:border-red-400"
                    : "border-gray-300 dark:border-outline-variant"
                }`}
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (emailError) setEmailError("");
                }}
                onBlur={() => setEmailError(validateEmail(email))}
              />
              {emailError && (
                <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">error</span>
                  {emailError}
                </p>
              )}
            </div>
            <button
              disabled={isValidating || !email.trim() || !!validateEmail(email)}
              className="w-full bg-primary text-white py-3 px-4 rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2 relative"
              type="submit"
            >
              {isValidating ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Continue
                  <span className="material-symbols-outlined">arrow_forward</span>
                </>
              )}
              {lastUsed === "email" && !isValidating && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-semibold text-white/70 border border-white/30 px-2 py-0.5 rounded-full">
                  Last used
                </span>
              )}
            </button>
          </form>
        )}

        {stage === "password" && (
          <form onSubmit={handleLogin} className="space-y-6 animate-stage-in" noValidate>

            {showOauthNoPasswordBanner && (
              <div className="flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 dark:border-blue-800/50 dark:bg-blue-900/20 px-4 py-3 text-sm text-blue-800 dark:text-blue-300">
                <span className="material-symbols-outlined text-[18px] shrink-0 mt-0.5">info</span>
                <span>
                  This account uses Google sign-in. Use the{" "}
                  <span className="font-semibold">Continue with Google</span> button below, or{" "}
                  <Link href="/forgot-password" className="underline">
                    reset your password
                  </Link>{" "}
                  to set one.
                </span>
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700 dark:text-on-surface">
                  Email Address
                </label>
                <button
                  type="button"
                  onClick={handleEditEmail}
                  className="text-xs font-semibold text-primary hover:underline cursor-pointer"
                >
                  Change email
                </button>
              </div>
              <div className="px-4 py-3 bg-gray-50 dark:bg-surface-container-low border border-emerald-200 dark:border-emerald-800/50 rounded-lg flex items-center gap-2.5">
                <span className="material-symbols-outlined text-[18px] text-emerald-500 shrink-0">check_circle</span>
                <span className="text-sm text-gray-900 dark:text-on-surface truncate">{email}</span>
              </div>
            </div>
            <div>
              <PasswordField
                id="password"
                label="Password"
                value={password}
                onChange={(value) => {
                  setPassword(value);
                  if (passwordError) setPasswordError("");
                }}
                onBlur={() => setPasswordError(password ? "" : "Password is required")}
                show={showPassword}
                onToggleShow={() => setShowPassword(!showPassword)}
                error={passwordError}
              />
              <div className="flex justify-end mt-2">
                <Link
                  href="/forgot-password"
                  className="text-sm text-primary hover:underline cursor-pointer"
                >
                  Forgot password?
                </Link>
              </div>
            </div>
            <button
              disabled={isValidating}
              className="w-full bg-primary text-white py-3 px-4 rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              type="submit"
            >
              {isValidating ? "Logging in..." : "Log In"}
            </button>
          </form>
        )}

        {stage === "signup" && (
          <form onSubmit={handleSignup} className="space-y-5 animate-stage-in" noValidate>
            <div>
              <label
                className="block text-sm font-medium text-gray-700 dark:text-on-surface mb-2"
                htmlFor="signup-name"
              >
                Full Name
              </label>
              <input
                id="signup-name"
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-surface-container-low dark:text-on-surface ${
                  signupErrors.name
                    ? "border-red-400 dark:border-red-400"
                    : "border-gray-300 dark:border-outline-variant"
                }`}
                placeholder="Alex Rivers"
                type="text"
                value={signupName}
                onChange={(e) => {
                  setSignupName(e.target.value);
                  if (signupErrors.name)
                    setSignupErrors((prev) => ({ ...prev, name: "" }));
                }}
                onBlur={() => handleSignupBlur("name", signupName)}
              />
              {signupErrors.name && (
                <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">error</span>
                  {signupErrors.name}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-on-surface mb-2">
                Email Address
              </label>
              <input
                className="w-full px-4 py-3 border border-gray-300 dark:border-outline-variant rounded-lg dark:bg-surface-container-low dark:text-on-surface opacity-75 cursor-default"
                type="email"
                value={email}
                readOnly
              />
            </div>
            <PasswordField
              id="signup-password"
              label="Password"
              value={password}
              onChange={(value) => {
                setPassword(value);
                if (signupErrors.password)
                  setSignupErrors((prev) => ({ ...prev, password: "" }));
              }}
              onBlur={() => handleSignupBlur("password", password)}
              show={showPassword}
              onToggleShow={() => setShowPassword(!showPassword)}
              showStrength
              error={signupErrors.password}
            />
            <PasswordField
              id="signup-confirm"
              label="Confirm Password"
              value={confirmPassword}
              onChange={(value) => {
                setConfirmPassword(value);
                if (signupErrors.confirmPassword)
                  setSignupErrors((prev) => ({ ...prev, confirmPassword: "" }));
              }}
              onBlur={() => handleSignupBlur("confirmPassword", confirmPassword)}
              show={showConfirmPassword}
              onToggleShow={() => setShowConfirmPassword(!showConfirmPassword)}
              error={signupErrors.confirmPassword}
            />
            <button
              disabled={isValidating}
              className="w-full bg-primary text-white py-3 px-4 rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              type="submit"
            >
              {isValidating ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Create Account
                  <span className="material-symbols-outlined">arrow_forward</span>
                </>
              )}
            </button>
          </form>
        )}

        {stage === "totp" && (
          <form onSubmit={handleTotpSubmit} className="space-y-5 animate-stage-in" noValidate>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-on-surface mb-2" htmlFor="totp-code">
                {useBackupCode ? "Recovery code" : "Authenticator code"}
              </label>
              {useBackupCode ? (
                <input
                  id="totp-code"
                  type="text"
                  inputMode="text"
                  autoComplete="one-time-code"
                  placeholder="XXXXX-XXXXX"
                  value={totpCode}
                  onChange={(e) => {
                    setTotpCode(e.target.value);
                    if (totpError) setTotpError("");
                  }}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-surface-container-low dark:text-on-surface text-center text-lg tracking-widest ${
                    totpError
                      ? "border-red-400 dark:border-red-400"
                      : "border-gray-300 dark:border-outline-variant"
                  }`}
                />
              ) : (
                <TotpCodeInput
                  id="totp-code"
                  value={totpCode}
                  onChange={(value) => {
                    setTotpCode(value);
                    if (totpError) setTotpError("");
                  }}
                  error={!!totpError}
                  autoFocus
                  boxClassName="border-gray-300 dark:border-outline-variant dark:bg-surface-container-low dark:text-on-surface focus:ring-primary"
                  errorBoxClassName="border-red-400 dark:border-red-400 dark:bg-surface-container-low dark:text-on-surface focus:ring-primary"
                />
              )}
              {totpError && (
                <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">error</span>
                  {totpError}
                </p>
              )}
            </div>
            <button
              disabled={isValidating || !totpCode.trim()}
              className="w-full bg-primary text-white py-3 px-4 rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              type="submit"
            >
              {isValidating ? "Verifying…" : "Verify"}
            </button>
            <button
              type="button"
              onClick={() => {
                setUseBackupCode((v) => !v);
                setTotpCode("");
                setTotpError("");
              }}
              className="w-full text-sm text-primary hover:underline cursor-pointer"
            >
              {useBackupCode ? "Use authenticator code instead" : "Use a recovery code instead"}
            </button>
          </form>
        )}

        {stage !== "totp" && (
          <>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-outline-variant" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-surface text-gray-500 dark:text-on-surface-variant font-semibold tracking-wide">
                  OR
                </span>
              </div>
            </div>

            <GoogleAuthButton
              onClick={handleGoogleSignIn}
              label="Continue with Google"
              disabled={isGoogleLoading}
              showLastUsed={lastUsed === "google"}
            />

            {stage !== "signup" && (
              <p className="text-center text-sm text-gray-600 dark:text-on-surface-variant">
                Don&apos;t have an account?{" "}
                <Link href="/signup" className="font-medium text-primary hover:underline">
                  Sign up
                </Link>
              </p>
            )}
          </>
        )}
      </div>
    </AuthShell>
    </>
  );
}